import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function fail(message) {
  console.error(`Erro: ${message}`);
  process.exit(1);
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function toUpperSnake(value) {
  return value.replace(/-/g, "_").toUpperCase();
}

async function readText(filePath) {
  return readFile(filePath, "utf8");
}

async function writeText(filePath, content) {
  await writeFile(filePath, content, "utf8");
}

async function updateFile(filePath, replacers) {
  let content = await readText(filePath);
  for (const [from, to] of replacers) {
    content = content.replaceAll(from, to);
  }
  await writeText(filePath, content);
}

async function run() {
  const moduleId = process.argv[2];
  const moduleName = process.argv[3] ?? `Fluxi ${moduleId?.replace(/-/g, " ") ?? ""}`.trim();

  if (!moduleId) fail("Informe o id do modulo. Exemplo: npm run create:module -- paynow \"Fluxi PayNow\"");
  if (!/^[a-z0-9-]+$/.test(moduleId)) fail("Use id em kebab-case minusculo (a-z, 0-9, -).");
  if (moduleId === "module-template") fail("Escolha um id diferente de module-template.");

  const sourceDir = path.join(rootDir, "modules", "module-template");
  const targetDir = path.join(rootDir, "modules", moduleId);

  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true, errorOnExist: true, force: false });

  const camelId = toCamelCase(moduleId);
  const upperSnake = toUpperSnake(moduleId);

  const replacers = [
    ["module-template", moduleId],
    ["moduleTemplate", camelId],
    ["MODULE_TEMPLATE", upperSnake],
    ["Module Template", moduleName],
    ["Novo modulo Fluxi", moduleName],
    ["@fluxi/modules-template", `@fluxi/modules-${moduleId}`],
  ];

  await updateFile(path.join(targetDir, "package.json"), replacers);
  await updateFile(path.join(targetDir, "src", "config", "permissions.ts"), replacers);
  await updateFile(path.join(targetDir, "src", "config", "integrations.ts"), replacers);
  await updateFile(path.join(targetDir, "src", "pages", "dashboard-page.tsx"), replacers);
  await updateFile(path.join(targetDir, "src", "manifest.ts"), replacers);
  await updateFile(path.join(targetDir, "src", "index.ts"), replacers);

  const registryPath = path.join(rootDir, "apps", "web", "src", "modules", "registry.ts");
  let registry = await readText(registryPath);
  const importLine = `import { ${camelId}Manifest } from "@fluxi/modules/${moduleId}";`;
  if (!registry.includes(importLine)) {
    registry = `${registry.trimEnd()}\n${importLine}\n`;
  }

  if (!registry.includes(`${camelId}Manifest`)) {
    registry = registry.replace(
      "export const moduleRegistry = [crmManifest, moduleTemplateManifest];",
      `export const moduleRegistry = [crmManifest, moduleTemplateManifest, ${camelId}Manifest];`
    );
  }

  await writeText(registryPath, registry);

  const authPath = path.join(rootDir, "apps", "web", "src", "lib", "auth.ts");
  let authContent = await readText(authPath);
  const permission = `${moduleId}.view`;
  if (!authContent.includes(`"${permission}"`)) {
    authContent = authContent.replace(
      `"module-template.view"`,
      `"module-template.view",\n      "${permission}"`
    );
    await writeText(authPath, authContent);
  }

  console.log(`Modulo criado com sucesso: modules/${moduleId}`);
  console.log(`Nome: ${moduleName}`);
  console.log("Integracoes padrao aplicadas: whatsapp, email, storage");
  console.log(`Permissao inicial adicionada ao mock auth: ${permission}`);
}

void run();
