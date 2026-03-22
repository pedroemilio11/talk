import { defineModule } from "@fluxi/module-sdk";
import { PAYNOW_INTEGRATIONS } from "./config/integrations";
import { PAYNOW_PERMISSIONS } from "./config/permissions";

export const paynowManifest = defineModule({
  id: "paynow",
  name: "Fluxi PayNow",
  description: "Modulo financeiro externo integrado ao Fluxi Base",
  basePath: "/app/paynow",
  externalUrl: "https://paynow.fluxi.orange.casa",
  icon: "wallet",
  enabledByDefault: true,
  permissions: [
    PAYNOW_PERMISSIONS.VIEW,
    PAYNOW_PERMISSIONS.MANAGE
  ],
  integrations: [...PAYNOW_INTEGRATIONS],
  routes: [],
  menu: []
});
