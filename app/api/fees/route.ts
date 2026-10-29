import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/fees?month=YYYY-MM
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  try {
    // 1. Fetch existing fees and active students in parallel for max speed
    const [existingFees, activeStudents] = await Promise.all([
      prisma.fee.findMany({
        where: { month },
        include: {
          student: {
            select: { id: true, name: true, belt: true, photoUrl: true, monthlyFee: true },
          },
        },
        orderBy: { student: { name: "asc" } },
      }),
      prisma.student.findMany({
        where: { active: true },
        select: { id: true, name: true, belt: true, photoUrl: true, monthlyFee: true },
      }),
    ]);

    // 2. Find missing students who don't have a fee record for this month yet
    const existingStudentIds = new Set(existingFees.map(f => f.studentId));
    const missingStudents = activeStudents.filter(s => !existingStudentIds.has(s.id));

    let allFees = existingFees;

    if (missingStudents.length > 0) {
      // 3. Batch create missing fees in 1 single SQL INSERT
      await prisma.fee.createMany({
        data: missingStudents.map(s => ({
          studentId: s.id,
          month,
          amountDue: s.monthlyFee,
          amountPaid: 0,
          status: "UNPAID",
        })),
        skipDuplicates: true,
      });

      // Refetch combined list quickly
      allFees = await prisma.fee.findMany({
        where: { month },
        include: {
          student: {
            select: { id: true, name: true, belt: true, photoUrl: true, monthlyFee: true },
          },
        },
        orderBy: { student: { name: "asc" } },
      });
    }

    const totalDue = allFees.reduce((s, f) => s + f.amountDue, 0);
    const totalPaid = allFees.reduce((s, f) => s + f.amountPaid, 0);

    return NextResponse.json(
      {
        fees: allFees,
        summary: {
          totalDue,
          totalPaid,
          outstanding: Math.max(0, totalDue - totalPaid),
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Fee error:", error);
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}
