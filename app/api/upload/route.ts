import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Support direct JSON payload (e.g. pre-compressed base64 dataUrl)
    if (contentType.includes("application/json")) {
      const json = await req.json();
      if (json.image && typeof json.image === "string") {
        return NextResponse.json({ url: json.image, success: true });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate that it's an image by type or extension
    const isImage = file.type 
      ? file.type.startsWith("image/") 
      : /\.(jpe?g|png|webp|gif|bmp|heic|heif|svg)$/i.test(file.name);

    if (!isImage) {
      return NextResponse.json({ error: "Only image files are allowed (JPG, PNG, WebP)" }, { status: 400 });
    }

    // Allow up to 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be under 25MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get safe extension
    const ext = path.extname(file.name) || ".jpg";
    const cleanExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : ".jpg";

    const uniqueName = `student-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "students");

    try {
      // Ensure directory exists and write file
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      const publicUrl = `/uploads/students/${uniqueName}`;
      return NextResponse.json({ url: publicUrl, success: true });
    } catch (fsError) {
      // Fallback for read-only environments (e.g. Vercel serverless) or disk permission errors
      console.warn("Local disk write failed, falling back to base64 Data URL:", fsError);
      const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: dataUrl, success: true });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
