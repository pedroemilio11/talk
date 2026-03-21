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
    <div className="crm-shell">
      <Sidebar userPermissions={userPermissions} />
      <div className="crm-shell-main">
        <Topbar userName={userName} tenantName={tenantName} />
        <main className="crm-page">
          <div className="crm-page-inner">
            <div className="crm-content">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

