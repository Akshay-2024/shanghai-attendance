import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        attendance: { orderBy: { date: "desc" } },
        fees: { orderBy: { month: "desc" } },
      },
    });
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const session = await auth();
    const actor = session?.user?.name || "admin";
    await logActivity(
      actor,
      "UPDATE_STUDENT",
      `Updated student: ${student.name} (${student.belt} Belt, Monthly Fee: ₹${student.monthlyFee})`
    );

    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const student = await prisma.student.update({
      where: { id },
      data: {
        name: body.name,
        belt: body.belt,
        dob: body.dob,
        phone: body.phone,
        photoUrl: body.photoUrl,
        monthlyFee: parseFloat(body.monthlyFee) || 0,
        joinedOn: body.joinedOn ? new Date(body.joinedOn) : undefined,
      },
    });
    const session = await auth();
    const actor = session?.user?.name || "admin";
    await logActivity(
      actor,
      "UPDATE_STUDENT",
      `Updated student: ${student.name} (${student.belt} Belt, Monthly Fee: ₹${student.monthlyFee})`
    );

    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const student = await prisma.student.update({ where: { id }, data: { active: false } });
    const session = await auth();
    const actor = session?.user?.name || "admin";
    await logActivity(
      actor,
      "DEACTIVATE_STUDENT",
      `Deactivated student: ${student.name} (${student.belt} Belt)`
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
