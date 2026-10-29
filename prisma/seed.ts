import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admins
  const hashSensei = await bcrypt.hash("karate123", 12);
  await prisma.admin.upsert({
    where: { username: "sensei" },
    update: {},
    create: { username: "sensei", passwordHash: hashSensei },
  });
  console.log("✅ Admin created: sensei / karate123");

  const hashAdmin = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: hashAdmin },
  });
  console.log("✅ Admin created: admin / admin123");

  // Create students
  const students = [
    { name: "Arjun Sharma", belt: "BLACK" as const, phone: "9876543210", monthlyFee: 1500 },
    { name: "Priya Mehta", belt: "BROWN" as const, phone: "9876543211", monthlyFee: 1500 },
    { name: "Rohan Varma", belt: "BROWN_II" as const, phone: "9876543218", monthlyFee: 1400 },
    { name: "Kavya Iyer", belt: "BROWN_III" as const, phone: "9876543219", monthlyFee: 1300 },
    { name: "Devansh Gupta", belt: "BROWN_IV" as const, phone: "9876543220", monthlyFee: 1300 },
    { name: "Siddharth Das", belt: "MAROON" as const, phone: "9876543221", monthlyFee: 1200 },
    { name: "Rahul Singh", belt: "BLUE" as const, phone: "9876543212", monthlyFee: 1200 },
    { name: "Ananya Patel", belt: "GREEN" as const, phone: "9876543213", monthlyFee: 1200 },
    { name: "Vikram Nair", belt: "ORANGE" as const, phone: "9876543214", monthlyFee: 1000 },
    { name: "Sneha Reddy", belt: "YELLOW" as const, phone: "9876543215", monthlyFee: 1000 },
    { name: "Aditya Kumar", belt: "WHITE" as const, phone: "9876543216", monthlyFee: 800 },
    { name: "Meera Joshi", belt: "WHITE" as const, phone: "9876543217", monthlyFee: 800 },
  ];

  for (const s of students) {
    await prisma.student.create({ data: s });
  }
  console.log(`✅ ${students.length} students created`);

  // Seed attendance for last 10 days
  const allStudents = await prisma.student.findMany();
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    for (const student of allStudents) {
      await prisma.attendance.upsert({
        where: { studentId_date: { studentId: student.id, date: dateStr } },
        update: {},
        create: {
          studentId: student.id,
          date: dateStr,
          present: Math.random() > 0.3,
        },
      });
    }
  }
  console.log("✅ Attendance seeded for last 10 days");

  // Seed fees for current month
  const month = today.toISOString().slice(0, 7);
  for (const student of allStudents) {
    await prisma.fee.upsert({
      where: { studentId_month: { studentId: student.id, month } },
      update: {},
      create: {
        studentId: student.id,
        month,
        amountDue: student.monthlyFee,
        status: Math.random() > 0.5 ? "PAID" : "UNPAID",
        amountPaid: Math.random() > 0.5 ? student.monthlyFee : 0,
      },
    });
  }
  console.log("✅ Fees seeded for current month");

  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
