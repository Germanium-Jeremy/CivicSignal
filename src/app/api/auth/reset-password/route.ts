import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { validatePassword, hashPassword } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
     try {
          await connectDB();

          const { identifier, resetCode, newPassword, method } = await request.json();

          if (!identifier || !resetCode || !newPassword || !method) {
               return NextResponse.json({ error: "All fields are required" }, { status: 400 });
          }

          // Validate new password
          const passwordValidation = validatePassword(newPassword);
          if (!passwordValidation.isValid) {
               return NextResponse.json(
                    { error: "Password does not meet requirements", details: passwordValidation.errors },
               { status: 400 },
               );
          }

          // Find user with valid reset token
          const query = method === "email" ? { email: identifier.toLowerCase() } : { phone: identifier.replace(/\s/g, "") };

          const user = await User.findOne({
               ...query,
               passwordResetToken: resetCode,
               passwordResetExpires: { $gt: new Date() },
          }).select(
               "+passwordResetToken +passwordResetExpires +password +refreshTokens",
          );

          if (!user) {
               return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
          }

          // Hash new password
          const hashedPassword = await hashPassword(newPassword);

          // Update user password and clear reset token
          user.password = hashedPassword;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;

          // Clear all refresh tokens to force re-login on all devices
          user.refreshTokens = [];

          // Deactivate all login devices for security
          user.loginDevices.forEach((device: any) => {
               device.isActive = false;
          });

          await user.save();

          return NextResponse.json({ success: true, message: "Password reset successfully! Please login with your new password." });
     } catch (error) {
          console.error("Reset password error:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}
