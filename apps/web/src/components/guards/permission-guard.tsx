import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  permission?: string;
  userPermissions: string[];
}>;

export function PermissionGuard({
  permission,
  userPermissions,
  children
}: Props) {
  if (!permission) return <>{children}</>;
  if (!userPermissions.includes(permission)) return null;
  return <>{children}</>;
}

