type Props = {
  userName: string;
  tenantName: string;
};

export function Topbar({ userName, tenantName }: Props) {
  return (
    <header className="crm-globalbar">
      <div className="flex items-center gap-3">
        <div className="crm-product-pill">Fluxi OS</div>
        <div>
          <div className="text-label text-muted-foreground">{tenantName}</div>
          <div className="font-display text-base">Plataforma central</div>
        </div>
      </div>

      <div className="text-body-sm text-muted-foreground">{userName}</div>
    </header>
  );
}

