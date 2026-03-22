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

