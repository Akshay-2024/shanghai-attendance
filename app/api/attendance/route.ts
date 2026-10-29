import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/attendance?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  try {
    const attendance = await prisma.attendance.findMany({
      where: { date },
      include: { student: { select: { id: true, name: true, belt: true, photoUrl: true } } },
    });
    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
