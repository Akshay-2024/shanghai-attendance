import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔒 DEVELOPER ONLY — hidden audit log route
// Access: GET /api/dev/audit
// Required: X-Dev-Key header matching DEV_KEY env variable
export async function GET(req: Request) {
  const devKey = req.headers.get("x-dev-key");
  if (!devKey || devKey !== process.env.DEV_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const logs = await prisma.loginAudit.findMany({
      orderBy: { loginTime: "desc" },
      take: 200,
      select: {
        id: true,
        username: true,
        loginTime: true,
        ipAddress: true,
        userAgent: true,
      },
    });
    return NextResponse.json({
      total: logs.length,
      logs,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}
