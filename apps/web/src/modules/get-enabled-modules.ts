import { moduleRegistry } from "./registry";

export function getEnabledModules(userPermissions: string[]) {
  return moduleRegistry.filter((moduleItem) =>
    moduleItem.permissions.some((permission) =>
      userPermissions.includes(permission)
    )
  );
}

