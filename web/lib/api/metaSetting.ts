import type { MetaSetting } from "@/modules/meta-setting/entity";
import type { UpdateMetaSettingRequest } from "@/modules/meta-setting/dto";

type ApiErrorResponse = {
  error?: string;
};

async function getErrorMessage(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;

  return data?.error ?? "Terjadi kesalahan.";
}

export async function getMetaSetting(): Promise<MetaSetting> {
  const response = await fetch("/api/meta-setting", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function updateMetaSetting(input: UpdateMetaSettingRequest): Promise<MetaSetting> {
  const response = await fetch("/api/meta-setting", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}
