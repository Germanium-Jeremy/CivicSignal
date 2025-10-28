import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Agency from '@/models/Agency';
import { verifyAccessToken } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentication required' }, 
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token and get user ID
        let userId;
        try {
            const decoded = verifyAccessToken(token);
            // Verify access token
            if (!decoded) {
                return NextResponse.json(
                    { error: 'Invalid access token' }, 
                    { status: 401 }
                );
            }
            userId = decoded.userId;
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid or expired token' }, 
                { status: 401 }
            );
        }

        const agencyData = await request.json();
        
        // Validate required fields
        const requiredFields = ['agencyName', 'agencyType', 'registrationNumber', 'address', 'district', 'sector', 'serviceDomains'];
        const missingFields = requiredFields.filter(field => !agencyData[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` }, 
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findById(userId).select('+refreshTokens');
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' }, 
                { status: 404 }
            );
        }

        // Check if user is verified
        if (!user.isEmailVerified || !user.isPhoneVerified) {
            return NextResponse.json(
                { 
                    error: 'Account verification required',
                    requiresVerification: true,
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified
                }, 
                { status: 403 }
            );
        }

        // Check if user is already a primary officer for an agency
        const existingAgency = await Agency.findOne({ primaryOfficer: userId });
        if (existingAgency) {
            return NextResponse.json(
                { error: 'You have already registered an agency' }, 
                { status: 400 }
            );
        }

        // Create new agency
        const newAgency = new Agency({
            name: agencyData.agencyName,
            type: agencyData.agencyType,
            registrationNumber: agencyData.registrationNumber,
            website: agencyData.website || undefined,
            address: agencyData.address,
            district: agencyData.district,
            sector: agencyData.sector,
            description: agencyData.description || undefined,
            serviceDomains: agencyData.serviceDomains,
            primaryOfficer: userId,
            officers: [userId], // Add creator as first officer
            isVerified: false,
            verificationStatus: 'pending'
        });

        await newAgency.save();

        // Update user role to agency_officer
        user.role = 'agency_officer';
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Agency registered successfully!',
            agency: {
                id: newAgency._id,
                name: newAgency.name,
                type: newAgency.type,
                registrationNumber: newAgency.registrationNumber,
                verificationStatus: newAgency.verificationStatus
            },
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error('Agency registration error:', error);
        
        // Handle duplicate registration number
        if (error.message && error.message.includes('registration number already exists')) {
            return NextResponse.json(
                { error: 'An agency with this registration number already exists' }, 
                { status: 400 }
            );
        }
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { error: messages.join(', ') }, 
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}

// GET method to check if user has registered an agency
export async function GET(request: NextRequest) {
    console.log('GET /api/auth/register-agency - Route hit!');
    try {
        await connectDB();
        
        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentication required' }, 
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token and get user ID
        let userId;
        try {
            const decoded = verifyAccessToken(token);
            // Verify access token
            if (!decoded) {
                return NextResponse.json(
                    { error: 'Invalid access token' }, 
                    { status: 401 }
                );
            }
            userId = decoded.userId;
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid or expired token' }, 
                { status: 401 }
            );
        }

        // Find user
        const user = await User.findById(userId).select('role');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' }, 
                { status: 404 }
            );
        }

        // Check if user is primary officer of any agency
        const agency = await Agency.findOne({ primaryOfficer: userId });
        return NextResponse.json({
            success: true,
            hasAgency: !!agency,
            agency: agency ? {
                id: agency._id,
                name: agency.name,
                type: agency.type,
                registrationNumber: agency.registrationNumber,
                verificationStatus: agency.verificationStatus,
                isVerified: agency.isVerified
            } : null,
            role: user.role
        });

    } catch (error) {
        console.error('Get agency status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
