import { heicTo, isHeic } from "heic-to";

const HEIC_OUTPUT_TYPE = "image/jpeg";
const HEIC_OUTPUT_QUALITY = 0.92;

function getConvertedFileName(fileName: string) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExtension || "image"}.jpg`;
}

export async function prepareImageForUpload(file: File): Promise<File> {
  const shouldConvertHeic = await isHeic(file);

  if (!shouldConvertHeic) {
    return file;
  }

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
