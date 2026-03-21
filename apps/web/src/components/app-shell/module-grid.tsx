import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fluxi/ui";
import { getEnabledModules } from "@/modules/get-enabled-modules";

type Props = {
  userPermissions: string[];
};

export function ModuleGrid({ userPermissions }: Props) {
  const modules = getEnabledModules(userPermissions);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((moduleItem) => {
        if (moduleItem.externalUrl) {
          return (
            <a key={moduleItem.id} href={moduleItem.externalUrl}>
              <Card>
                <CardHeader>
                  <CardTitle>{moduleItem.name}</CardTitle>
                  <CardDescription>
                    {moduleItem.description ?? "Modulo do ecossistema Fluxi"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Abrir modulo</p>
                </CardContent>
              </Card>
            </a>
          );
        }

        return (
          <Link key={moduleItem.id} href={moduleItem.basePath}>
            <Card>
              <CardHeader>
                <CardTitle>{moduleItem.name}</CardTitle>
                <CardDescription>
                  {moduleItem.description ?? "Modulo do ecossistema Fluxi"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Abrir modulo</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

