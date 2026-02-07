import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { validatePassword, hashPassword, generateVerificationToken, generateVerificationCode, isRwandanIP } from '@/lib/utils/auth';
import { sendEmail, sendPhoneVerification } from '@/lib/services/notification';

export async function POST(request: NextRequest) {
     try {
          await connectDB();
          
          const { fullName, email, phone, password } = await request.json();
          
          // Get client IP and check if it's from Rwanda
          const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
          
          if (!isRwandanIP(clientIP)) {
               return NextResponse.json({ error: 'Access denied. Service is only available in Rwanda.' }, { status: 403 });
          }

          // Validate required fields
          if (!fullName || !email || !phone || !password) {
               return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
          }

          // Validate full name
          if (fullName.trim().length < 2) {
               return NextResponse.json({ error: 'Full name must be at least 2 characters long' }, { status: 400 });
          }

          // Validate email format
          const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
          if (!emailRegex.test(email)) {
               return NextResponse.json({ error: 'Please enter a valid email address' },  { status: 400 });
          }

          // Validate phone format (international format)
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
               return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
          }

          // Validate password strength
          const passwordValidation = validatePassword(password);
          if (!passwordValidation.isValid) {
               return NextResponse.json(
                    { 
                         error: 'Password does not meet requirements', 
                         details: passwordValidation.errors 
                    }, 
                    { status: 400 }
               );
          }

          // Check if user already exists
          const existingUser = await User.findOne({
               $or: [
                    { email: email.toLowerCase() },
                    { phone: phone.replace(/\s/g, '') }
               ]
          });

          if (existingUser) {
               if (existingUser.email === email.toLowerCase()) {
                    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
               } else {
                    return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 });
               }
          }

          // Hash password
          const hashedPassword = await hashPassword(password);

          // Generate verification codes (both email and phone use 6-digit codes)
          const emailVerificationCode = generateVerificationCode();
          const phoneVerificationCode = generateVerificationCode();

          // Create new user
          const newUser = new User({
               fullName: fullName.trim(),
               email: email.toLowerCase(),
               phone: phone.replace(/\s/g, ''),
               password: hashedPassword,
               emailVerificationCode,
               phoneVerificationCode,
               emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes (same as phone)
               phoneVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
               role: 'citizen'
          });

          await newUser.save();

          // Send verification email with code
          const emailSent = await sendEmail(email, 'email-verification', {
               fullName: fullName.trim(),
               verificationCode: emailVerificationCode
          });

          //  Send verification SMS
          const smsSent = await sendPhoneVerification(
               phone.replace(/\s/g, ''), 
               phoneVerificationCode, 
               fullName.trim()
          );

          // Return success response
          return NextResponse.json({
               success: true,
               message: 'Registration successful! Please check your email and phone for verification.',
               user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                    isEmailVerified: newUser.isEmailVerified,
                    isPhoneVerified: newUser.isPhoneVerified,
                    createdAt: newUser.createdAt
               },
               verificationStatus: { emailSent: emailSent, smsSent: smsSent}
          }, { status: 201 });

     } catch (error) {
          console.error('Registration error:', error);
          
          // Handle mongoose validation errors
          if ((error as any).name === 'ValidationError') {
               const errors = Object.values((error as any).errors).map((err: any) => err.message);
               return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
          }

          // Handle duplicate key errors
          if ((error as any).code === 11000) {
               const field = Object.keys((error as any).keyValue)[0];
               return NextResponse.json({ error: `An account with this ${field} already exists` }, { status: 409 });
          }

          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}
