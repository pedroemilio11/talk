import { crmManifest } from "@fluxi/modules/crm";
import { moduleTemplateManifest } from "@fluxi/modules/module-template";
import { paynowManifest } from "@fluxi/modules/paynow";
import { talkManifest } from "@fluxi/modules/talk";

export const moduleRegistry = [
  crmManifest,
  paynowManifest,
  moduleTemplateManifest,
  talkManifest
];
