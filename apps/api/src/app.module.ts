import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { FluxiTalkModule } from "./fluxi-talk/fluxi-talk.module";
import { IntegrationsModule } from "./integrations/integrations.module";

@Module({
  imports: [IntegrationsModule, FluxiTalkModule],
  controllers: [AppController]
})
export class AppModule {}
