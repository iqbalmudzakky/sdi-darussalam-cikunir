import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import type { SaveProgramRequest, ProgramResponse } from "./dto";

export async function listPrograms(): Promise<ProgramResponse[]> {
  const programs = await withDbLogging("program.list", () => repository.list());

  const response: ProgramResponse[] = programs.map((program) => ({
    id: program.id,
    title: program.title,
    description: program.description,
    emoji: program.emoji,
  }));

  return response;
}

export async function createProgram(
  input: SaveProgramRequest,
): Promise<ProgramResponse> {
  const created = await withDbLogging("program.create", () =>
    repository.create(input),
  );

  const response: ProgramResponse = {
    id: created.id,
    title: created.title,
    description: created.description,
    emoji: created.emoji,
  };

  return response;
}

export async function updateProgram(
  id: string,
  input: SaveProgramRequest,
): Promise<ProgramResponse> {
  const updated = await withDbLogging("program.update", () =>
    repository.update(id, input),
  );

  const response: ProgramResponse = {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    emoji: updated.emoji,
  };

  return response;
}

export async function deleteProgram(id: string): Promise<void> {
  await withDbLogging("program.delete", () => repository.remove(id));
}
