"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  userName: string;
  tenantName: string;
};

export function Topbar({ userName, tenantName }: Props) {
  const pathname = usePathname();

  return (
    <header className="fluxi-topbar">
      <div className="flex items-center gap-2">
        <span className="fluxi-pill">Fluxi OS</span>
        <Link className={`fluxi-tab ${pathname === "/app" ? "fluxi-tab-active" : ""}`} href="/app">
          Dashboard
        </Link>
        <span className="fluxi-tab">Pipeline</span>
        <span className="fluxi-tab">Vendas</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="fluxi-search">Pesquisar clientes, unidades, vendas</div>
        <button className="fluxi-cta" type="button">+ Novo</button>
        <div className="text-body-sm text-muted-foreground">{tenantName} · {userName}</div>
      </div>
    </header>
  );
}
