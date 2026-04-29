import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { contentType } from "mime-types";
import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    // 1. Check access
    await requireAuth();

    const { path } = await params;
    const filePath = join(process.cwd(), "public", "uploads", ...path);

    // 2. Prevent directory traversal
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 3. Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 4. Serve file
    const fileBuffer = await readFile(filePath);
    const mimeType =
      contentType(filePath.split(".").pop() || "") ||
      "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
