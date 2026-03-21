import { ModuleGrid } from "@/components/app-shell/module-grid";
import { getCurrentUser } from "@/lib/auth";

export default async function FluxiHomePage() {
  const user = await getCurrentUser();

  return (
    <div className="crm-vision-stage">
      <section className="crm-vision-hero">
        <div className="crm-vision-eyebrow">Fluxi OS</div>
        <h1 className="crm-vision-title">Todos os modulos na mesma base.</h1>
        <p className="crm-vision-subtitle">
          Fluxi centraliza autenticacao, permissoes, design system,
          integracoes e acesso aos produtos do ecossistema.
        </p>
      </section>

      <section>
        <div className="crm-page-header">
          <div>
            <h2 className="crm-page-title">Modulos disponiveis</h2>
            <p className="crm-page-subtitle">
              Acesse CRM e futuros modulos a partir do mesmo nucleo.
            </p>
          </div>
        </div>

        <ModuleGrid userPermissions={user.permissions} />
      </section>
    </div>
  );
}

