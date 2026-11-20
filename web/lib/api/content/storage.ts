export async function uploadPhoto(bucket: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);

  const res = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload photo (${res.status})`);
  }

  const { url } = await res.json();
  return url;
}
