import type { PropsWithChildren, ReactNode } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
      style={{ boxShadow: "var(--component-card-shadow)" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: PropsWithChildren) {
  return <div className="border-b border-border p-4">{children}</div>;
}

export function CardTitle({ children }: PropsWithChildren) {
  return <h3 className="font-display text-base text-foreground">{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function CardContent({ children }: PropsWithChildren) {
  return <div className="p-4">{children}</div>;
}

