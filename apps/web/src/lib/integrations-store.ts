import type {
  IntegrationCatalogItem,
  ModuleIntegrationSetting,
  ModuleItem
} from "./integrations-api";

const catalog: IntegrationCatalogItem[] = [
  { id: "whatsapp", name: "WhatsApp", description: "Mensageria comercial" },
  { id: "email", name: "Email", description: "Comunicacao e notificacoes" },
  { id: "storage", name: "Storage", description: "Arquivos e documentos" }
];

const modules: ModuleItem[] = [
  { id: "crm", name: "Fluxi CRM" },
  { id: "paynow", name: "Fluxi PayNow" }
];

let settings: ModuleIntegrationSetting[] = [
  { moduleId: "crm", integrationId: "whatsapp", enabled: true, accessProfile: "gestor" },
  { moduleId: "crm", integrationId: "email", enabled: true, accessProfile: "operador" },
  { moduleId: "crm", integrationId: "storage", enabled: true, accessProfile: "operador" }
];

export function getCatalog() {
  return catalog;
}

export function getModules() {
  return modules;
}

export function getSettings() {
  return settings;
}

export function upsertSetting(next: ModuleIntegrationSetting) {
  const index = settings.findIndex(
    (item) =>
      item.moduleId === next.moduleId && item.integrationId === next.integrationId
  );

  if (index === -1) settings = [...settings, next];
  else settings = settings.map((item, itemIndex) => (itemIndex === index ? next : item));

  return next;
}
