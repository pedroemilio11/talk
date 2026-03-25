import type { UserSession } from "@fluxi/shared-types";

export async function getCurrentUser(): Promise<UserSession> {
  return {
    id: "u_1",
    name: "Admin Fluxi",
    email: "admin@fluxi.local",
    tenantId: "t_1",
    permissions: [
      "crm.view",
      "crm.leads",
      "crm.pipeline",
      "paynow.view",
      "talk.view"
    ]
  };
}
