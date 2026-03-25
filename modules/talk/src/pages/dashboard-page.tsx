"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";

type FluxiMetrics = {
  totalConversations: number;
  byUserType: Record<string, number>;
  byStatus: Record<string, number>;
  closedWithProtocol: number;
  transferred: number;
  averageMessagesPerConversation: number;
};

type Conversation = {
  id: string;
  phone: string;
  userType: string;
  currentStep: string;
  status: string;
  messageCount: number;
  protocol: string | null;
  updatedAt: string;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  createdAt: string;
};

function safeDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export function TalkDashboardPage() {
  const [metrics, setMetrics] = useState<FluxiMetrics | null>(null);
  const [phone, setPhone] = useState("5585999912370");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [simulateText, setSimulateText] = useState("oi");
  const [simulateToken, setSimulateToken] = useState("fluxi-token-final-2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedPhone = useMemo(() => phone.replace(/\D/g, ""), [phone]);

  async function loadMetrics() {
    const response = await fetch("/fluxi-talk/metrics", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar metricas");
    setMetrics(await response.json());
  }

  async function loadConversation(targetPhone = normalizedPhone) {
    if (!targetPhone) return;

    const [conversationRes, messagesRes] = await Promise.all([
      fetch(`/fluxi-talk/conversations/${targetPhone}`, { cache: "no-store" }),
      fetch(`/fluxi-talk/conversations/${targetPhone}/messages`, { cache: "no-store" })
    ]);

    if (!conversationRes.ok) throw new Error("Falha ao carregar conversa");
    if (!messagesRes.ok) throw new Error("Falha ao carregar mensagens");

    setConversation((await conversationRes.json()) as Conversation);
    setMessages((await messagesRes.json()) as Message[]);
  }

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      await loadMetrics();
      await loadConversation();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function simulateInbound() {
    if (!normalizedPhone) {
      setError("Informe um telefone valido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/fluxi-talk/webhook/zapi", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-zapi-token": simulateToken
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          text: simulateText,
          messageId: `dashboard-${Date.now()}`
        })
      });

      if (!response.ok) {
        const payload = await response.text();
        throw new Error(`Webhook falhou: ${payload}`);
      }

      await refreshAll();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="crm-page-header">
        <div>
          <div className="text-label text-primary">Operacao</div>
          <h1 className="crm-page-title">Fluxi Talk</h1>
          <p className="crm-page-subtitle">Monitoramento e operacao do atendimento WhatsApp.</p>
        </div>
        <div className="crm-page-actions">
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            Atualizar
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent>
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total conversas</CardTitle>
          </CardHeader>
          <CardContent>{metrics?.totalConversations ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ativas</CardTitle>
          </CardHeader>
          <CardContent>{metrics?.byStatus?.active ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transferidas</CardTitle>
          </CardHeader>
          <CardContent>{metrics?.transferred ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Media msgs</CardTitle>
          </CardHeader>
          <CardContent>{metrics?.averageMessagesPerConversation ?? 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simular Entrada</CardTitle>
          <CardDescription>Dispara um webhook manual para validar fluxo fim a fim.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Mensagem"
              value={simulateText}
              onChange={(event) => setSimulateText(event.target.value)}
            />
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Token webhook"
              value={simulateToken}
              onChange={(event) => setSimulateToken(event.target.value)}
            />
            <Button onClick={simulateInbound} disabled={loading}>
              Simular
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consulta de Conversa</CardTitle>
          <CardDescription>Busque por telefone para visualizar estado e historico.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="5585..."
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Button variant="outline" onClick={() => void loadConversation()} disabled={loading}>
              Buscar
            </Button>
          </div>

          {conversation ? (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-3 text-sm">
                <p>
                  <strong>Telefone:</strong> {conversation.phone}
                </p>
                <p>
                  <strong>Status:</strong> {conversation.status}
                </p>
                <p>
                  <strong>Etapa:</strong> {conversation.currentStep}
                </p>
                <p>
                  <strong>Tipo:</strong> {conversation.userType}
                </p>
                <p>
                  <strong>Mensagens:</strong> {conversation.messageCount}
                </p>
                <p>
                  <strong>Atualizado:</strong> {safeDate(conversation.updatedAt)}
                </p>
              </div>

              <div className="space-y-2">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem mensagens para este telefone.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="rounded-md border border-border p-3 text-sm">
                      <p>
                        <strong>{message.direction === "inbound" ? "Cliente" : "Fluxi"}:</strong>{" "}
                        {message.content}
                      </p>
                      <p className="text-xs text-muted-foreground">{safeDate(message.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma conversa carregada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
