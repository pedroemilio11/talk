import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { resolveModuleRoute } from "@/modules/resolve-module-route";
import { PermissionGuard } from "@/components/guards/permission-guard";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function DynamicModulePage({ params }: Props) {
  const { slug } = await params;
  const pathname = `/app/${slug.join("/")}`;
  const user = await getCurrentUser();

  const resolved = resolveModuleRoute(pathname);

  if (!resolved) return notFound();

  const Component = resolved.route.component;

  return (
    <PermissionGuard
      permission={resolved.route.permission}
      userPermissions={user.permissions}
    >
      <Component />
    </PermissionGuard>
  );
}

