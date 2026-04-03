import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateVerificationCode, normalizeEmail, normalizePhone } from "@/lib/utils/auth";
import { sendEmail, sendPasswordResetSMS } from "@/lib/services/notification";

export async function POST(request: NextRequest) {
     try {
          await connectDB();

          const { identifier, method } = await request.json(); // identifier can be email or phone

          if (!identifier || !method) {
               return NextResponse.json({ error: "Identifier and method are required" }, { status: 400 });
          }

          if (!["email", "phone"].includes(method)) {
               return NextResponse.json({ error: "Method must be either email or phone" }, { status: 400 },);
          }

          // Find user by email or phone
          const query =
               method === "email"
               ? { email: normalizeEmail(identifier) }
               : { phone: normalizePhone(identifier) };

          const user = await User.findOne(query);

          if (!user) {
               // Don't reveal if user exists or not for security
               return NextResponse.json({ success: true, message: `If an account with this ${method} exists, you will receive a reset code.` });
          }

          // Check if user is active
          if (!user.isActive) {
               return NextResponse.json({ success: true, message: `If an account with this ${method} exists, you will receive a reset code.` });
          }

          // Generate reset code
          const resetCode = generateVerificationCode();

          // Update user with reset token
          user.passwordResetToken = resetCode;
          user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          await user.save();

          let sent = false;

          // Send reset code via chosen method
          if (method === "email") {
               sent = await sendEmail(user.email, "password-reset", { fullName: user.fullName, resetCode });
          } else {
               sent = await sendPasswordResetSMS(user.phone, resetCode);
          }

          return NextResponse.json({
               success: true,
               message: `Password reset code sent to your ${method}`,
               codeSent: sent,
          });
     } catch (error) {
          console.error("Forgot password error:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}
