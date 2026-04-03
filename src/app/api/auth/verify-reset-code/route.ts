import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { normalizeEmail, normalizePhone } from "@/lib/utils/auth";

/**
 * Confirms a password-reset code without consuming it. The reset endpoint
 * remains the authority that consumes the code and changes the password.
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { identifier, resetCode, method } = await request.json();
        if (!identifier || !resetCode || !method) {
            return NextResponse.json({ error: "Identifier, reset code, and method are required" }, { status: 400 });
        }
        if (!["email", "phone"].includes(method)) {
            return NextResponse.json({ error: "Method must be either email or phone" }, { status: 400 });
        }
        if (!/^\d{6}$/.test(resetCode)) {
            return NextResponse.json({ error: "Invalid reset code format" }, { status: 400 });
        }

        const contactQuery = method === "email"
            ? { email: normalizeEmail(identifier) }
            : { phone: normalizePhone(identifier) };
        const user = await User.exists({
            ...contactQuery,
            passwordResetToken: resetCode,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Reset code verified" });
    } catch (error) {
        console.error("Verify reset code error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
