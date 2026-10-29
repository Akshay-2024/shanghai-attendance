import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports?month=YYYY-MM
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  try {
    const students = await prisma.student.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        belt: true,
        attendance: {
          where: {
            date: { startsWith: month },
          },
          select: { date: true, present: true },
        },
        fees: {
          where: { month },
          select: { month: true, status: true, amountDue: true, amountPaid: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(students, {
      headers: {
        "Cache-Control": "private, max-age=5, stale-while-revalidate=10",
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
