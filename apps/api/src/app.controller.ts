import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: "Fluxi Talk API",
      status: "ok",
      usageUrl: "https://talk.orange.casa",
      endpoints: {
        health: "/fluxi-talk/health",
        webhook: "/fluxi-talk/webhook/zapi",
        metrics: "/fluxi-talk/metrics"
      },
      timestamp: new Date().toISOString()
    };
  }
}
