import { prisma } from "@/lib/prisma";

export async function logActivity(
  username: string,
  action: string,
  details: string,
  ipAddress?: string | null
) {
  try {
    await prisma.activityLog.create({
      data: {
        username: username || "admin",
        action,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
