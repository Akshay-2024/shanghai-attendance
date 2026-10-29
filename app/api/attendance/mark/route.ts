import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// POST /api/attendance/mark
// Body: { date: "YYYY-MM-DD", records: [{ studentId, present }] }
export async function POST(req: Request) {
  try {
    const { date, records } = await req.json();
    if (!date || !records?.length) {
      return NextResponse.json({ error: "date and records required" }, { status: 400 });
    }
    const ops = records.map((r: { studentId: string; present: boolean }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        update: { present: r.present },
        create: { studentId: r.studentId, date, present: r.present },
      })
    );
    await prisma.$transaction(ops);

    const presentCount = records.filter((r: { present: boolean }) => r.present).length;
    const session = await auth();
    const actor = session?.user?.name || "admin";
    await logActivity(
      actor,
      "MARK_ATTENDANCE",
      `Marked attendance for date ${date}: ${presentCount} present out of ${records.length} students`
    );

    return NextResponse.json({ success: true, count: records.length });
  } catch {
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
