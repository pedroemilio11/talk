"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";

type SystemOption = {
  id: string;
  name: string;
  description?: string;
};

type AccessProfile = "admin" | "gestor" | "operador" | "leitura";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  status: "ativo" | "inativo";
  profile: AccessProfile;
  systems: string[];
};

type Props = {
  systems: SystemOption[];
};

const PROFILE_LABELS: Record<AccessProfile, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  operador: "Operador",
  leitura: "Somente Leitura"
};

const PROFILE_NOTES: Record<AccessProfile, string> = {
  admin: "Acesso total a configuracoes, usuarios e modulos.",
  gestor: "Gerencia operacao do modulo e indicadores.",
  operador: "Executa operacao com escopo controlado.",
  leitura: "Apenas visualizacao, sem alteracoes."
};

export function UserManagementPanel({ systems }: Props) {
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: "u-1",
      name: "Admin Fluxi",
      email: "admin@fluxi.local",
      status: "ativo",
      profile: "admin",
      systems: systems.map((item) => item.id)
    },
    {
      id: "u-2",
      name: "Comercial CRM",
      email: "comercial@orange.casa",
      status: "ativo",
      profile: "gestor",
      systems: systems.filter((item) => item.id.includes("crm")).map((item) => item.id)
    }
  ]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");
  const [profile, setProfile] = useState<AccessProfile>("operador");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isEditing = editingUserId !== null;

  const selectedUser = useMemo(
    () => users.find((item) => item.id === editingUserId) ?? null,
    [editingUserId, users]
  );

  function resetForm() {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setStatus("ativo");
    setProfile("operador");
    setSelectedSystems([]);
    setError(null);
  }

  function startEdit(user: UserRecord) {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setStatus(user.status);
    setProfile(user.profile);
    setSelectedSystems(user.systems);
    setError(null);
  }

  function toggleSystem(systemId: string) {
    setSelectedSystems((current) =>
      current.includes(systemId)
        ? current.filter((item) => item !== systemId)
        : [...current, systemId]
    );
  }

  function submitForm() {
    if (!name.trim()) {
      setError("Informe o nome do usuario.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Informe um e-mail valido.");
      return;
    }

    if (selectedSystems.length === 0) {
      setError("Selecione ao menos um sistema.");
      return;
    }

    if (isEditing && editingUserId) {
      setUsers((current) =>
        current.map((item) =>
          item.id === editingUserId
            ? {
                ...item,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                status,
                profile,
                systems: selectedSystems
              }
            : item
        )
      );
    } else {
      const newUser: UserRecord = {
        id: `u-${crypto.randomUUID()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        status,
        profile,
        systems: selectedSystems
      };
      setUsers((current) => [newUser, ...current]);
    }

    resetForm();
  }

  function deleteUser(userId: string) {
    const target = users.find((item) => item.id === userId);
    if (!target) return;

    const confirmed = window.confirm(`Excluir usuario ${target.name}?`);
    if (!confirmed) return;

    setUsers((current) => current.filter((item) => item.id !== userId));
    if (editingUserId === userId) resetForm();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <Card className="fluxi-card">
        <CardHeader>
          <CardTitle>Usuarios e acessos</CardTitle>
          <CardDescription>
            Controle de criacao, edicao, exclusao e escopo de sistemas por usuario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{user.name}</p>
                    <p className="text-body-sm text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-label uppercase tracking-[0.1em] text-muted-foreground">
                      {PROFILE_LABELS[user.profile]} · {user.status}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.systems.map((systemId) => {
                        const match = systems.find((item) => item.id === systemId);
                        return (
                          <span
                            key={`${user.id}-${systemId}`}
                            className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-label text-foreground"
                          >
                            {match?.name ?? systemId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => startEdit(user)}>
                      Editar
                    </Button>
                    <Button variant="ghost" onClick={() => deleteUser(user.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="fluxi-card">
        <CardHeader>
          <CardTitle>{isEditing ? "Editar usuario" : "Criar usuario"}</CardTitle>
          <CardDescription>
            Defina perfil de acesso e sistemas autorizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-label text-muted-foreground">Nome</label>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label text-muted-foreground">E-mail</label>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@empresa.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label text-muted-foreground">Status</label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={status}
              onChange={(event) => setStatus(event.target.value as "ativo" | "inativo")}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-label text-muted-foreground">Perfil de acesso</label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={profile}
              onChange={(event) => setProfile(event.target.value as AccessProfile)}
            >
              {Object.entries(PROFILE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-body-sm text-muted-foreground">{PROFILE_NOTES[profile]}</p>
          </div>

          <div className="space-y-2">
            <label className="text-label text-muted-foreground">Sistemas com acesso</label>
            <div className="grid gap-2">
              {systems.map((system) => {
                const checked = selectedSystems.includes(system.id);
                return (
                  <label
                    key={system.id}
                    className="flex cursor-pointer items-start gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
                  >
                    <input
                      checked={checked}
                      onChange={() => toggleSystem(system.id)}
                      type="checkbox"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">{system.name}</span>
                      <span className="text-body-sm text-muted-foreground">
                        {system.description ?? "Sistema do ecossistema Fluxi"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button onClick={submitForm}>
              {isEditing ? "Salvar alteracoes" : "Criar usuario"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Limpar
            </Button>
          </div>

          {selectedUser ? (
            <p className="text-body-sm text-muted-foreground">
              Editando: <strong>{selectedUser.name}</strong>
            </p>
          ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
