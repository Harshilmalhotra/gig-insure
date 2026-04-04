import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(AppModule);
    cachedApp.enableCors();
    await cachedApp.init();
  }
  return cachedApp;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (app) => {
    await app.listen(process.env.PORT ?? 3005, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
  });
}

// Vercel serverless handler
export default async (req: any, res: any) => {
  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
};
