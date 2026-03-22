"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getEnabledModules } from "@/modules/get-enabled-modules";

type Props = {
  userPermissions: string[];
};

export function Sidebar({ userPermissions }: Props) {
  const pathname = usePathname();
  const modules = getEnabledModules(userPermissions);

  return (
    <aside className="fluxi-sidebar">
      <div className="fluxi-sidebar-brand">
        <p className="text-3xl font-semibold tracking-tight text-foreground">Fluxi</p>
        <p className="text-body-sm text-muted-foreground">Base operacional dos modulos</p>
      </div>

      <div className="mb-4">
        <p className="fluxi-nav-title">Principal</p>
        <Link
          href="/app"
          className={`fluxi-nav-link ${pathname === "/app" ? "fluxi-nav-link-active" : ""}`}
        >
          Dashboard
        </Link>
      </div>

      <div>
        <p className="fluxi-nav-title">Modulos</p>
        {modules.map((moduleItem) => {
          const isActive = pathname === moduleItem.basePath;

          if (moduleItem.externalUrl) {
            return (
              <a
                key={moduleItem.id}
                href={moduleItem.externalUrl}
                className="fluxi-nav-link"
              >
                {moduleItem.name}
              </a>
            );
          }

          return (
            <Link
              key={moduleItem.id}
              href={moduleItem.basePath}
              className={`fluxi-nav-link ${isActive ? "fluxi-nav-link-active" : ""}`}
            >
              {moduleItem.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border/70 bg-card/70 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Sessao ativa
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">admin@fluxi.local</p>
        <p className="text-body-sm text-muted-foreground">Administrador</p>
      </div>
    </aside>
  );
}
