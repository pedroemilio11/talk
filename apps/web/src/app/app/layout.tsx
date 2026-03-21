import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function InternalAppLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell
      userName={user.name}
      tenantName="Orange Group"
      userPermissions={user.permissions}
    >
      {children}
    </AppShell>
  );
}

