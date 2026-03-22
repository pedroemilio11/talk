import { IntegrationManagementPanel } from "@/components/integrations/integration-management-panel";

export default function IntegracoesPage() {
  return (
    <div className="space-y-4">
      <div className="fluxi-hero">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Integracoes Centralizadas
        </h1>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Governe conectores do ecossistema no Fluxi Base sem alterar configuracao do CRM.
        </p>
      </div>

      <IntegrationManagementPanel />
    </div>
  );
}

