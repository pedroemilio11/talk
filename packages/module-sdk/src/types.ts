import type { ComponentType } from "react";

export type ModuleRoute = {
  path: string;
  label: string;
  component: ComponentType;
  permission?: string;
};

export type ModuleMenuItem = {
  label: string;
  path: string;
  icon?: string;
  permission?: string;
};

export type FluxiModuleManifest = {
  id: string;
  name: string;
  description?: string;
  basePath: string;
  externalUrl?: string;
  icon?: string;
  enabledByDefault?: boolean;
  permissions: string[];
  integrations: string[];
  routes: ModuleRoute[];
  menu: ModuleMenuItem[];
};

