import { heicTo, isHeic } from "heic-to";

const HEIC_OUTPUT_TYPE = "image/jpeg";
const HEIC_OUTPUT_QUALITY = 0.92;

const MAX_DIMENSION = 1600;
const RESIZE_OUTPUT_QUALITY = 0.8;

function getConvertedFileName(fileName: string) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return `${nameWithoutExtension || "image"}.jpg`;
}

function getWebpFileName(fileName: string) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return `${nameWithoutExtension || "image"}.webp`;
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const convertedBlob = await heicTo({
    blob: file,
    type: HEIC_OUTPUT_TYPE,
    quality: HEIC_OUTPUT_QUALITY,
  });

  return new File([convertedBlob], getConvertedFileName(file.name), {
    type: HEIC_OUTPUT_TYPE,
    lastModified: Date.now(),
  });
}

async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", RESIZE_OUTPUT_QUALITY),
  );
  if (!blob) return file;

  return new File([blob], getWebpFileName(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export async function prepareImageForUpload(file: File): Promise<File> {
  const shouldConvertHeic = await isHeic(file);
  const workingFile = shouldConvertHeic ? await convertHeicToJpeg(file) : file;

  return resizeImage(workingFile);
}
