import type { MouseEventHandler, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "ghost" | "outline";
}>;

export function Button({
  children,
  className = "",
  disabled,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    outline: "border border-border bg-transparent text-foreground hover:bg-muted"
  };

  return (
    <button
      className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${variants[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
