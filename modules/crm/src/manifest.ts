import { defineModule } from "@fluxi/module-sdk";
import { CrmDashboardPage } from "./pages/dashboard-page";
import { CRM_PERMISSIONS } from "./config/permissions";

export const crmManifest = defineModule({
  id: "crm",
  name: "Fluxi CRM",
  description: "Modulo comercial e pipeline",
  basePath: "/app/crm",
  externalUrl: "https://crm.fluxi.orange.casa",
  icon: "briefcase",
  enabledByDefault: true,
  permissions: [
    CRM_PERMISSIONS.VIEW,
    CRM_PERMISSIONS.LEADS,
    CRM_PERMISSIONS.PIPELINE,
    CRM_PERMISSIONS.MANAGE
  ],
  integrations: ["whatsapp", "email", "storage"],
  routes: [
    {
      path: "/app/crm",
      label: "Dashboard",
      component: CrmDashboardPage,
      permission: CRM_PERMISSIONS.VIEW
    }
  ],
  menu: [
    {
      label: "Dashboard",
      path: "/app/crm",
      icon: "briefcase",
      permission: CRM_PERMISSIONS.VIEW
    }
  ]
});

