export type IntegrationCatalogItem = {
  id: string;
  name: string;
  description: string;
};

export type ModuleItem = {
  id: string;
  name: string;
};

export type ModuleIntegrationSetting = {
  moduleId: string;
  integrationId: string;
  enabled: boolean;
  accessProfile: "admin" | "gestor" | "operador" | "leitura";
};

const API_URL = process.env.NEXT_PUBLIC_FLUXI_API_URL ?? "/api";

export async function getIntegrationCatalog(): Promise<IntegrationCatalogItem[]> {
  const response = await fetch(`${API_URL}/integrations/catalog`, { cache: "no-store" });
  if (!response.ok) throw new Error("catalog fetch failed");
  return response.json();
}

export async function getIntegrationModules(): Promise<ModuleItem[]> {
  const response = await fetch(`${API_URL}/integrations/modules`, { cache: "no-store" });
  if (!response.ok) throw new Error("modules fetch failed");
  return response.json();
}

export async function getIntegrationSettings(): Promise<ModuleIntegrationSetting[]> {
  const response = await fetch(`${API_URL}/integrations/settings`, { cache: "no-store" });
  if (!response.ok) throw new Error("settings fetch failed");
  return response.json();
}

export async function upsertIntegrationSetting(
  payload: ModuleIntegrationSetting
): Promise<ModuleIntegrationSetting> {
  const response = await fetch(`${API_URL}/integrations/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("settings update failed");
  return response.json();
}
