import { ModuleGrid } from "@/components/app-shell/module-grid";
import { getCurrentUser } from "@/lib/auth";

export default async function FluxiHomePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-5">
      <section>
        <div className="fluxi-hero">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Modulos disponiveis</h2>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Acesse CRM e futuros modulos a partir do mesmo nucleo.
            </p>
          </div>
        </div>

        <ModuleGrid userPermissions={user.permissions} />
      </section>
    </div>
  );
}
