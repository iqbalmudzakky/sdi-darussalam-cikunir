import type { TransactionSql } from "postgres";
import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";
import type { BiodataForm, ManualBiodataForm } from "./dto";
import type { FormBiodata, RegistrationParentRow } from "./entity";

export async function listParentsByRegistrationIds(
  registrationIds: string[],
): Promise<RegistrationParentRow[]> {
  if (registrationIds.length === 0) return [];

  return withDbLogging("registrationBiodata.listParents", () =>
    repository.listParentsByRegistrationIds(registrationIds),
  );
}

export async function getFormBiodata(
  registrationId: string,
): Promise<FormBiodata> {
  const [parents, extras] = await Promise.all([
    withDbLogging("registrationBiodata.listFormParents", () =>
      repository.listFormParents(registrationId),
    ),
    getDetailsAndAchievements(registrationId),
  ]);

  const biodata: FormBiodata = { parents, ...extras };
  return biodata;
}

export async function getDetailsAndAchievements(
  registrationId: string,
): Promise<Pick<FormBiodata, "details" | "achievements">> {
  const [details, achievements] = await Promise.all([
    withDbLogging("registrationBiodata.findFormDetails", () =>
      repository.findFormDetails(registrationId),
    ),
    withDbLogging("registrationBiodata.listAchievements", () =>
      repository.listAchievements(registrationId),
    ),
  ]);

  const extras = { details, achievements };
  return extras;
}

export async function replaceWithin(
  tx: TransactionSql,
  registrationId: string,
  form: BiodataForm | ManualBiodataForm,
): Promise<void> {
  await withDbLogging("registrationBiodata.replaceWithin", async () => {
    await repository.replaceParentsWithin(tx, registrationId, form);
    await repository.replaceDetailsWithin(tx, registrationId, form.details);
    await repository.replaceAchievementsWithin(
      tx,
      registrationId,
      form.achievements,
    );
  });
}

export async function insertLegacyWithin(
  tx: TransactionSql,
  registrationId: string,
  input: CreatePpdbRegistrationRequest,
): Promise<void> {
  await withDbLogging("registrationBiodata.insertLegacyWithin", async () => {
    await repository.insertLegacyParentsWithin(
      tx,
      registrationId,
      input.parents,
    );
    await repository.insertLegacyDetailsWithin(
      tx,
      registrationId,
      input.details,
    );
  });
}
