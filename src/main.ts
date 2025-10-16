import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.log(`✅ Aplicación iniciada en puerto ${port}`);
  logger.log(`📚 Swagger disponible en: http://localhost:${port}/api`);
}

bootstrap();