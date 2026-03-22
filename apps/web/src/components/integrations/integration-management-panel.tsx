"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";
import type {
  IntegrationCatalogItem,
  ModuleIntegrationSetting,
  ModuleItem
} from "@/lib/integrations-api";
import {
  getIntegrationCatalog,
  getIntegrationModules,
  getIntegrationSettings,
  upsertIntegrationSetting
} from "@/lib/integrations-api";

const MOCK_CATALOG: IntegrationCatalogItem[] = [
  { id: "whatsapp", name: "WhatsApp", description: "Mensageria comercial" },
  { id: "email", name: "Email", description: "Comunicacao e notificacoes" },
  { id: "storage", name: "Storage", description: "Arquivos e documentos" }
];

const MOCK_MODULES: ModuleItem[] = [
  { id: "crm", name: "Fluxi CRM" },
  { id: "paynow", name: "Fluxi PayNow" }
];

const MOCK_SETTINGS: ModuleIntegrationSetting[] = [
  { moduleId: "crm", integrationId: "whatsapp", enabled: true, accessProfile: "gestor" },
  { moduleId: "crm", integrationId: "email", enabled: true, accessProfile: "operador" },
  { moduleId: "crm", integrationId: "storage", enabled: true, accessProfile: "operador" }
];

export function IntegrationManagementPanel() {
  const [catalog, setCatalog] = useState<IntegrationCatalogItem[]>(MOCK_CATALOG);
  const [modules, setModules] = useState<ModuleItem[]>(MOCK_MODULES);
  const [settings, setSettings] = useState<ModuleIntegrationSetting[]>(MOCK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [catalogData, moduleData, settingData] = await Promise.all([
          getIntegrationCatalog(),
          getIntegrationModules(),
          getIntegrationSettings()
        ]);

        setCatalog(catalogData);
        setModules(moduleData);
        setSettings(settingData);
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const matrix = useMemo(
    () =>
      modules.map((moduleItem) => ({
        module: moduleItem,
        rows: catalog.map((integration) => {
          const match = settings.find(
            (item) =>
              item.moduleId === moduleItem.id &&
              item.integrationId === integration.id
          );
          return {
            integration,
            value:
              match ?? {
                moduleId: moduleItem.id,
                integrationId: integration.id,
                enabled: false,
                accessProfile: "operador" as const
              }
          };
        })
      })),
    [catalog, modules, settings]
  );

  async function updateSetting(next: ModuleIntegrationSetting) {
    const previous = settings;
    const nextSettings = [...settings];
    const index = nextSettings.findIndex(
      (item) =>
        item.moduleId === next.moduleId &&
        item.integrationId === next.integrationId
    );

    if (index === -1) nextSettings.push(next);
    else nextSettings[index] = next;
    setSettings(nextSettings);

    if (!apiOnline) return;

    try {
      await upsertIntegrationSetting(next);
    } catch {
      setSettings(previous);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="fluxi-card">
        <CardHeader>
          <CardTitle>Central de Integracoes</CardTitle>
          <CardDescription>
            Controle centralizado por modulo. CRM permanece isolado e nao foi reconfigurado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-muted-foreground">
            Status API:{" "}
            <strong className={apiOnline ? "text-emerald-400" : "text-amber-400"}>
              {loading ? "carregando..." : apiOnline ? "online" : "offline (mock local)"}
            </strong>
          </p>
        </CardContent>
      </Card>

      {matrix.map((entry) => (
        <Card className="fluxi-card" key={entry.module.id}>
          <CardHeader>
            <CardTitle>{entry.module.name}</CardTitle>
            <CardDescription>Habilitacao e perfil de acesso por integracao.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entry.rows.map((row) => (
                <div
                  key={`${entry.module.id}-${row.integration.id}`}
                  className="rounded-xl border border-border/70 bg-muted/20 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{row.integration.name}</p>
                      <p className="text-body-sm text-muted-foreground">
                        {row.integration.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-body-sm text-muted-foreground">
                        <input
                          checked={row.value.enabled}
                          onChange={(event) =>
                            void updateSetting({
                              ...row.value,
                              enabled: event.target.checked
                            })
                          }
                          type="checkbox"
                        />
                        Habilitado
                      </label>

                      <select
                        className="rounded-lg border border-border bg-background px-2 py-1 text-body-sm"
                        onChange={(event) =>
                          void updateSetting({
                            ...row.value,
                            accessProfile: event.target.value as ModuleIntegrationSetting["accessProfile"]
                          })
                        }
                        value={row.value.accessProfile}
                      >
                        <option value="admin">Administrador</option>
                        <option value="gestor">Gestor</option>
                        <option value="operador">Operador</option>
                        <option value="leitura">Leitura</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

