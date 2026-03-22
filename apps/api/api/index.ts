import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";

type Handler = (req: unknown, res: unknown) => Promise<void> | void;

let cachedHandler: Handler | null = null;

async function bootstrap(): Promise<Handler> {
  if (cachedHandler) return cachedHandler;

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  cachedHandler = (req, res) => expressApp(req, res);
  return cachedHandler;
}

export default async function handler(req: unknown, res: unknown) {
  const server = await bootstrap();
  return server(req, res);
}

