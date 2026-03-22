import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  IntegrationCatalogItem,
  ModuleIntegrationSetting,
  ModuleItem
} from "./integrations.types";

@Injectable()
export class IntegrationsService {
  private readonly catalog: IntegrationCatalogItem[] = [
    { id: "whatsapp", name: "WhatsApp", description: "Mensageria comercial e notificacoes" },
    { id: "email", name: "Email", description: "Disparo transacional e comunicacao" },
    { id: "storage", name: "Storage", description: "Arquivos, anexos e documentos" }
  ];

  private readonly modules: ModuleItem[] = [
    { id: "crm", name: "Fluxi CRM" },
    { id: "paynow", name: "Fluxi PayNow" }
  ];

  private settings: ModuleIntegrationSetting[] = [
    { moduleId: "crm", integrationId: "whatsapp", enabled: true, accessProfile: "gestor" },
    { moduleId: "crm", integrationId: "email", enabled: true, accessProfile: "operador" },
    { moduleId: "crm", integrationId: "storage", enabled: true, accessProfile: "operador" },
    { moduleId: "paynow", integrationId: "email", enabled: true, accessProfile: "gestor" },
    { moduleId: "paynow", integrationId: "storage", enabled: true, accessProfile: "operador" }
  ];

  getCatalog() {
    return this.catalog;
  }

  getModules() {
    return this.modules;
  }

  getSettings() {
    return this.settings;
  }

  upsertSetting(input: ModuleIntegrationSetting) {
    const hasModule = this.modules.some((item) => item.id === input.moduleId);
    const hasIntegration = this.catalog.some((item) => item.id === input.integrationId);

    if (!hasModule) {
      throw new NotFoundException(`Module ${input.moduleId} not found`);
    }

    if (!hasIntegration) {
      throw new NotFoundException(`Integration ${input.integrationId} not found`);
    }

    const index = this.settings.findIndex(
      (item) =>
        item.moduleId === input.moduleId &&
        item.integrationId === input.integrationId
    );

    if (index === -1) {
      this.settings.push(input);
      return input;
    }

    this.settings[index] = input;
    return input;
  }
}

