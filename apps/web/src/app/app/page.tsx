import { ModuleGrid } from "@/components/app-shell/module-grid";
import { getCurrentUser } from "@/lib/auth";

export default async function FluxiHomePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-5">
      <section className="fluxi-hero">
        <p className="text-label uppercase tracking-[0.16em] text-muted-foreground">Fluxi OS</p>
        <h1 className="mt-1 text-5xl font-semibold tracking-tight text-foreground">
          Todos os modulos na mesma base.
        </h1>
        <p className="mt-3 max-w-3xl text-body-sm text-muted-foreground">
          Fluxi centraliza autenticacao, permissoes, design system, integracoes e acesso
          aos produtos do ecossistema.
        </p>
      </section>

      <section>
        <div className="fluxi-hero">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Modulos disponiveis</h2>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Acesse CRM e futuros modulos a partir do mesmo nucleo.
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="fluxi-card rounded-xl p-4">
              <p className="text-label uppercase tracking-[0.12em] text-muted-foreground">Governanca</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">Auth + Permissoes</p>
              <p className="text-body-sm text-muted-foreground">Controle centralizado de acesso por modulo</p>
            </div>
            <div className="fluxi-card rounded-xl p-4">
              <p className="text-label uppercase tracking-[0.12em] text-muted-foreground">Ecossistema</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{user.permissions.length} permissoes ativas</p>
              <p className="text-body-sm text-muted-foreground">Base pronta para CRM, PayNow e novos produtos</p>
            </div>
          </div>
        </div>

        <ModuleGrid userPermissions={user.permissions} />
      </section>
    </div>
  );
}
