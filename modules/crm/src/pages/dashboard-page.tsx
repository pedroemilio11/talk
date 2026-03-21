import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";

export function CrmDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">Fluxi CRM</h1>
          <p className="crm-page-subtitle">
            O CRM operacional esta publicado em dominio dedicado.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abrir CRM operacional</CardTitle>
          <CardDescription>
            Acesso direto ao ambiente de producao do CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="https://crm.fluxi.orange.casa" className="text-sm text-primary">
            Ir para crm.fluxi.orange.casa
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

