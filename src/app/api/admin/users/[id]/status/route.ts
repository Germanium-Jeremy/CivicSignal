import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { requireAuth, requireRole } from "@/lib/middleware";
import connectDB from "@/lib/mongodb";

// PATCH /api/admin/users/[id]/status - Toggle user status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
     try {
          await connectDB();

          // Authentication and authorization
          const authResult = await requireAuth(request);
          if (!authResult.success) {
               return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 500 });
          }

          const roleCheck = await requireRole(request, ["admin"]);
          if (!roleCheck.success) {
               return NextResponse.json({ error: roleCheck.error || "Authorization failed" }, { status: roleCheck.status || 500 });
          }

          // Await params in Next.js 15+
          const { id } = await params;

          const { isActive } = await request.json();

          if (typeof isActive !== "boolean") {
               return NextResponse.json({ error: "isActive must be a boolean value" }, { status: 400 });
          }

          const user = await User.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true }).select("-password").lean();

          if (!user) {
               return NextResponse.json({ error: "User not found" }, { status: 404 });
          }

          return NextResponse.json({ success: true, data: user });
     } catch (error) {
          console.error("Error updating user status:", error);
          return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
     }
}
