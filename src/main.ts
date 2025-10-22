import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EncryptionUtil } from './utils/encryption.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize encryption
  EncryptionUtil.initialize(process.env.ENCRYPTION_KEY || 'default-key-change-this');

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Church Integration Management System')
    .setDescription('Secure, privacy-first backend API for church administrative staff')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('members', 'Member management')
    .addTag('families', 'Family and household management')
    .addTag('kids', 'Children ministry and safety')
    .addTag('groups', 'Connect groups')
    .addTag('teams', 'Serving teams')
    .addTag('ministries', 'Ministry programs')
    .addTag('partnership', 'Covenant partnership')
    .addTag('mentorship', 'Mentorship programs')
    .addTag('reports', 'Analytics and reports')
    .addTag('admin', 'Admin operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Church Integration System running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
