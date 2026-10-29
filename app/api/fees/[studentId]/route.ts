import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  try {
    const fees = await prisma.fee.findMany({
      where: { studentId },
      orderBy: { month: "desc" },
    });
    return NextResponse.json(fees);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  try {
    const body = await req.json();
    const fee = await prisma.fee.upsert({
      where: { studentId_month: { studentId, month: body.month } },
      update: {
        status: body.status,
        amountPaid: parseFloat(body.amountPaid) || 0,
        amountDue: parseFloat(body.amountDue) || 0,
        paymentMethod: body.paymentMethod || null,
        paidOn: body.paidOn ? new Date(body.paidOn) : null,
        remarks: body.remarks || null,
      },
      create: {
        studentId,
        month: body.month,
        status: body.status || "UNPAID",
        amountDue: parseFloat(body.amountDue) || 0,
        amountPaid: parseFloat(body.amountPaid) || 0,
        paymentMethod: body.paymentMethod || null,
        paidOn: body.paidOn ? new Date(body.paidOn) : null,
        remarks: body.remarks || null,
      },
    });
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true },
    });
    const session = await auth();
    const actor = session?.user?.name || "admin";
    await logActivity(
      actor,
      "FEE_PAYMENT",
      `Recorded fee for ${student?.name || studentId}: ₹${fee.amountPaid}/₹${fee.amountDue} for ${fee.month} (${fee.status}) via ${fee.paymentMethod || "CASH"}`
    );

    return NextResponse.json(fee);
  } catch {
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 });
  }
}
