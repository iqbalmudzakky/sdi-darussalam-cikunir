import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import { removeStoragePhoto } from "@/modules/storage/storage";
import type { SaveFacilityRequest, FacilityResponse } from "./dto";

const PHOTO_BUCKET = "facility-photos";

export async function listFacilities(): Promise<FacilityResponse[]> {
  const facilities = await withDbLogging("facility.list", () =>
    repository.list(),
  );

  const response: FacilityResponse[] = facilities.map((facility) => ({
    id: facility.id,
    title: facility.title,
    subtitle: facility.subtitle,
    emoji: facility.emoji,
    photo_url: facility.photo_url,
  }));

  return response;
}

export async function createFacility(
  input: SaveFacilityRequest,
): Promise<FacilityResponse> {
  const created = await withDbLogging("facility.create", () =>
    repository.create(input),
  );

  const response: FacilityResponse = {
    id: created.id,
    title: created.title,
    subtitle: created.subtitle,
    emoji: created.emoji,
    photo_url: created.photo_url,
  };

  return response;
}

export async function updateFacility(
  id: string,
  input: SaveFacilityRequest,
): Promise<FacilityResponse> {
  const existing = await withDbLogging("facility.getById", () =>
    repository.getById(id),
  );

  const updated = await withDbLogging("facility.update", () =>
    repository.update(id, input),
  );

  if (existing?.photo_url && existing.photo_url !== input.photo_url) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.photo_url);
  }

  const response: FacilityResponse = {
    id: updated.id,
    title: updated.title,
    subtitle: updated.subtitle,
    emoji: updated.emoji,
    photo_url: updated.photo_url,
  };

  return response;
}

export async function deleteFacility(id: string): Promise<void> {
  const existing = await withDbLogging("facility.getById", () =>
    repository.getById(id),
  );

  await withDbLogging("facility.delete", () => repository.remove(id));

  if (existing?.photo_url) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.photo_url);
  }
}
