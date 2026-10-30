import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const includeInactive = searchParams.get("includeInactive") === "true" || searchParams.get("all") === "true";

    let whereClause: { active?: boolean } = { active: true };
    if (statusParam === "inactive" || statusParam === "left") {
      whereClause = { active: false };
    } else if (statusParam === "all" || includeInactive) {
      whereClause = {};
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        belt: true,
        dob: true,
        phone: true,
        photoUrl: true,
        joinedOn: true,
        active: true,
        monthlyFee: true,
        _count: { select: { attendance: true } },
      },
    });
    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const student = await prisma.student.create({
      data: {
        name: body.name,
        belt: body.belt || "WHITE",
        dob: body.dob || null,
        phone: body.phone || null,
        photoUrl: body.photoUrl || null,
        monthlyFee: parseFloat(body.monthlyFee) || 0,
        joinedOn: body.joinedOn ? new Date(body.joinedOn) : undefined,
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    });
    const session = await auth();
    const actor = session?.user?.name || "admin";
    await logActivity(
      actor,
      "ADD_STUDENT",
      `Added new student: ${student.name} (${student.belt} Belt, Monthly Fee: ₹${student.monthlyFee})`
    );

    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
