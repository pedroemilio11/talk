import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";
import { getEnabledModules } from "@/modules/get-enabled-modules";

type Props = {
  userPermissions: string[];
};

export function ModuleGrid({ userPermissions }: Props) {
  const modules = getEnabledModules(userPermissions);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modules.map((moduleItem) => {
        if (moduleItem.externalUrl) {
          return (
            <a key={moduleItem.id} href={moduleItem.externalUrl}>
              <Card className="fluxi-card transition hover:border-primary/40 hover:shadow-lg">
                <CardHeader>
                  <CardTitle>
                    {moduleItem.id === "crm" ? (
                      <Image
                        src="/brands/fluxi-crm-dark.png"
                        alt="Fluxi CRM"
                        width={155}
                        height={28}
                        className="h-7 w-auto"
                      />
                    ) : (
                      <span className="text-xl">{moduleItem.name}</span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {moduleItem.description ?? "Modulo do ecossistema Fluxi"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="inline-flex rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-body-sm text-foreground">
                    Abrir modulo
                  </p>
                </CardContent>
              </Card>
            </a>
          );
        }

        return (
          <Link key={moduleItem.id} href={moduleItem.basePath}>
            <Card className="fluxi-card transition hover:border-primary/40 hover:shadow-lg">
              <CardHeader>
                <CardTitle>
                  {moduleItem.id === "crm" ? (
                    <Image
                      src="/brands/fluxi-crm-dark.png"
                      alt="Fluxi CRM"
                      width={155}
                      height={28}
                      className="h-7 w-auto"
                    />
                  ) : (
                    <span className="text-xl">{moduleItem.name}</span>
                  )}
                </CardTitle>
                <CardDescription>
                  {moduleItem.description ?? "Modulo do ecossistema Fluxi"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="inline-flex rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-body-sm text-foreground">
                  Abrir modulo
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
