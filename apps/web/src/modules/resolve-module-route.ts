import { moduleRegistry } from "./registry";

export function resolveModuleRoute(pathname: string) {
  for (const moduleItem of moduleRegistry) {
    const route = moduleItem.routes.find((item) => item.path === pathname);
    if (route) {
      return { module: moduleItem, route };
    }
  }

  return null;
}

