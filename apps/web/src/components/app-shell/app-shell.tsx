import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type Props = PropsWithChildren<{
  userName: string;
  tenantName: string;
  userPermissions: string[];
}>;

export function AppShell({
  userName,
  tenantName,
  userPermissions,
  children
}: Props) {
  return (
    <div className="fluxi-shell flex">
      <Sidebar userPermissions={userPermissions} />
      <div className="min-w-0 flex-1">
        <Topbar userName={userName} tenantName={tenantName} />
        <main className="fluxi-main">{children}</main>
      </div>
    </div>
  );
}
