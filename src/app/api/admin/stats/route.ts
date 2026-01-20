import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Agency from "@/models/Agency";
import { verifyAdminAuth } from "@/lib/utils/adminAuth";

export async function GET(request: NextRequest) {
     try {
          // Verify admin authentication
          const authResult = verifyAdminAuth(request);
          if (!authResult.isAuthorized) {
               return authResult.error;
          }

          await connectDB();

          // Get agency statistics
          const totalAgencies = await Agency.countDocuments();
          const pendingAgencies = await Agency.countDocuments({ verificationStatus: "pending" });
          const approvedAgencies = await Agency.countDocuments({ verificationStatus: "approved" });
          const rejectedAgencies = await Agency.countDocuments({ verificationStatus: "rejected" });

          // Get user statistics
          const totalUsers = await User.countDocuments();
          const citizenUsers = await User.countDocuments({ role: "citizen" });
          const officerUsers = await User.countDocuments({ role: "agency_officer" });
          const activeUsers = await User.countDocuments({ isActive: true });

          // TODO: Add issue statistics once Issue model is created
          // For now, return placeholder values
          const issueStats = { total: 0, open: 0, inProgress: 0, resolved: 0 };

          return NextResponse.json({
               success: true,
               stats: {
                    agencies: { total: totalAgencies, pending: pendingAgencies, approved: approvedAgencies, rejected: rejectedAgencies },
                    issues: issueStats,
                    users: { total: totalUsers, citizens: citizenUsers, officers: officerUsers, active: activeUsers },
               },
          });
     } catch (error) {
          console.error("Admin stats error:", error);
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
     }
}
