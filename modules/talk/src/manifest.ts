import { defineModule } from "@fluxi/module-sdk";
import { TalkDashboardPage } from "./pages/dashboard-page";
import { TALK_INTEGRATIONS } from "./config/integrations";
import { TALK_PERMISSIONS } from "./config/permissions";

export const talkManifest = defineModule({
  id: "talk",
  name: "Fluxi Talk",
  description: "Comunicacao omnichannel e atendimento em tempo real",
  basePath: "/app/talk",
  icon: "message-square",
  enabledByDefault: false,
  permissions: [
    TALK_PERMISSIONS.VIEW,
    TALK_PERMISSIONS.MANAGE
  ],
  integrations: [...TALK_INTEGRATIONS],
  routes: [
    {
      path: "/app/talk",
      label: "Dashboard",
      component: TalkDashboardPage,
      permission: TALK_PERMISSIONS.VIEW
    }
  ],
  menu: [
    {
      label: "Dashboard",
      path: "/app/talk",
      icon: "message-square",
      permission: TALK_PERMISSIONS.VIEW
    }
  ]
});
