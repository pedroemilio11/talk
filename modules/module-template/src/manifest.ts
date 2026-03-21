import { defineModule } from "@fluxi/module-sdk";
import { ModuleTemplateDashboardPage } from "./pages/dashboard-page";
import { MODULE_TEMPLATE_INTEGRATIONS } from "./config/integrations";
import { MODULE_TEMPLATE_PERMISSIONS } from "./config/permissions";

export const moduleTemplateManifest = defineModule({
  id: "module-template",
  name: "Module Template",
  description: "Base padrao para criacao de novos modulos",
  basePath: "/app/module-template",
  icon: "layout-grid",
  enabledByDefault: false,
  permissions: [
    MODULE_TEMPLATE_PERMISSIONS.VIEW,
    MODULE_TEMPLATE_PERMISSIONS.MANAGE
  ],
  integrations: [...MODULE_TEMPLATE_INTEGRATIONS],
  routes: [
    {
      path: "/app/module-template",
      label: "Dashboard",
      component: ModuleTemplateDashboardPage,
      permission: MODULE_TEMPLATE_PERMISSIONS.VIEW
    }
  ],
  menu: [
    {
      label: "Dashboard",
      path: "/app/module-template",
      icon: "layout-grid",
      permission: MODULE_TEMPLATE_PERMISSIONS.VIEW
    }
  ]
});

