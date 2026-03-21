export type UserSession = {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  permissions: string[];
};

export type TenantContext = {
  id: string;
  name: string;
};

