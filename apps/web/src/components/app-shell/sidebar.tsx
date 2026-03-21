import Link from "next/link";
import { getEnabledModules } from "@/modules/get-enabled-modules";

type Props = {
  userPermissions: string[];
};

export function Sidebar({ userPermissions }: Props) {
  const modules = getEnabledModules(userPermissions);

  return (
    <aside className="w-72 border-r border-sidebar-border bg-sidebar px-4 py-5">
      <div className="mb-6">
        <div className="font-display text-2xl text-foreground">Fluxi</div>
        <div className="text-body-sm text-muted-foreground">
          Base operacional dos modulos
        </div>
      </div>

      <nav className="space-y-2">
        <Link
          href="/app"
          className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-sidebar-accent"
        >
          Inicio
        </Link>

        {modules.map((moduleItem) => {
          if (moduleItem.externalUrl) {
            return (
              <a
                key={moduleItem.id}
                href={moduleItem.externalUrl}
                className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-sidebar-accent"
              >
                {moduleItem.name}
              </a>
            );
          }

          return (
            <Link
              key={moduleItem.id}
              href={moduleItem.basePath}
              className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-sidebar-accent"
            >
              {moduleItem.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

