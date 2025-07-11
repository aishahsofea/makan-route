import path from "path";
import fs from "fs";

export const imageToBase64 = async (filePath: string): Promise<string> => {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const base64String = imageBuffer.toString("base64");

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = getMimeType(ext);

    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error("Error converting image to Base64: ", error);
    throw new Error(`Failed to convert image to base64: ${filePath}`);
  }
};

const getMimeType = (extension: string): string => {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
};

export const compressBase64Image = (base64: string, maxSizeKB = 500) => {
  const sizeKB = (base64.length * 3) / 4 / 1024;
  if (sizeKB <= maxSizeKB) {
    return base64;
  }

  // For now, just return the original
  console.warn(
    `Image size (${sizeKB.toFixed(2)} KB) exceeds limit (${maxSizeKB} KB).`
  );

  return base64;
};
