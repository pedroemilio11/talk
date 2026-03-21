import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";

export function ModuleTemplateDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="crm-page-header">
        <div>
          <div className="text-label text-primary">Template</div>
          <h1 className="crm-page-title">Novo modulo Fluxi</h1>
          <p className="crm-page-subtitle">
            Base padrao para criacao de modulos plugaveis no ecossistema.
          </p>
        </div>

        <div className="crm-page-actions">
          <Button>Nova acao</Button>
          <Button variant="outline">Configurar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard inicial</CardTitle>
          <CardDescription>
            Estrutura pronta para paginas, fluxos e widgets do modulo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Use este template para qualquer novo produto conectado ao Fluxi.
        </CardContent>
      </Card>
    </div>
  );
}

