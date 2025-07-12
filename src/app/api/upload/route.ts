import { generateUniqueFilename, validateImageFile } from "@/utils/file";
import { existsSync } from "fs";
import {
  mkdir as mkdirPromise,
  writeFile as writeFilePromise,
} from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image_url") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdirPromise(uploadsDir, { recursive: true });
    }

    const filename = generateUniqueFilename(file.name);
    const filePath = join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    const processedBuffer = await sharp(buffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    await writeFilePromise(filePath, processedBuffer);

    const metadata = await sharp(processedBuffer).metadata();

    const imageAttachment = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: processedBuffer.length,
      url: `/uploads/${filename}`,
      width: metadata.width,
      height: metadata.height,
    };

    return NextResponse.json(imageAttachment);
  } catch (error) {
    console.error("Error in upload route: ", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
