import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/audit
// Strictly restricted to user: "sensei"
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.name !== "sensei") {
      return NextResponse.json(
        { error: "Access denied. Only master admin (sensei) can view audit logs." },
        { status: 403 }
      );
    }

    const [loginLogs, activityLogs, admins] = await Promise.all([
      prisma.loginAudit.findMany({
        orderBy: { loginTime: "desc" },
        take: 100,
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 150,
      }),
      prisma.admin.findMany({
        select: { id: true, username: true, createdAt: true },
      }),
    ]);

    return NextResponse.json(
      {
        authorized: true,
        loginLogs,
        activityLogs,
        admins,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Audit fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch audit data" }, { status: 500 });
  }
}
