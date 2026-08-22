"use server";

import * as programService from "@/modules/program/service";
import type { ProgramItem } from "@/types/Program";

export async function listPrograms(): Promise<ProgramItem[]> {
  try {
    return await programService.listPrograms();
  } catch (error) {
    console.error("lib/actions/programs.listPrograms failed:", error);
    return [];
  }
}
