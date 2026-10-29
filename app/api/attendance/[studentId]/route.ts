import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    });
    const total = attendance.length;
    const present = attendance.filter((a) => a.present).length;
    return NextResponse.json({ attendance, stats: { total, present, percentage: total ? Math.round((present / total) * 100) : 0 } });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
