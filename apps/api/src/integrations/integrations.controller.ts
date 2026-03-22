import { Body, Controller, Get, Put } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import type { ModuleIntegrationSetting } from "./integrations.types";

@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get("catalog")
  getCatalog() {
    return this.integrationsService.getCatalog();
  }

  @Get("modules")
  getModules() {
    return this.integrationsService.getModules();
  }

  @Get("settings")
  getSettings() {
    return this.integrationsService.getSettings();
  }

  @Put("settings")
  upsertSetting(@Body() body: ModuleIntegrationSetting) {
    return this.integrationsService.upsertSetting(body);
  }
}

