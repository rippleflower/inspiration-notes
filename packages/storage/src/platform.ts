import { createInMemoryNoteRepository } from "./memory";
import { createInMemoryPluginInstallationStore } from "./pluginInstallations";
import type { NoteRepository } from "./repository";
import type { PluginInstallationStore } from "@inspiration-notes/core";

export function createPlatformNoteRepository(): NoteRepository {
  return createInMemoryNoteRepository();
}

export function createPlatformPluginInstallationStore(): PluginInstallationStore {
  return createInMemoryPluginInstallationStore();
}
