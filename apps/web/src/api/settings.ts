import type { PublicSettingsDto } from "@kerak/shared";
import { api } from "./client";

export function fetchPublicSettings() {
  return api.get<PublicSettingsDto>("/settings/public");
}
