import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const logger = new Logger('HospitalBackendBootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Hospital Management System API (QLBV)')
    .setDescription(
      'Hệ Thống Quản Lý Bệnh Viện - Khoa CNTT, Đại học Sài Gòn (SGU)\n' +
      'Chuẩn hóa 19 bảng BCNF, 25 Ràng buộc toàn vẹn và 10 Phân hệ nghiệp vụ y tế.',
    )
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Xác thực hệ thống (Auth)')
    .addTag('Cơ sở vật chất & Khoa phòng (Department & Room)')
    .addTag('Nhân sự y tế (Staff)')
    .addTag('Tiếp đón & Hồ sơ người bệnh (Patient)')
    .addTag('Khám bệnh & Chẩn đoán (Examination)')
    .addTag('Dược phẩm & Toa thuốc (Prescription & Pharmacy)')
    .addTag('Cận lâm sàng & Dịch vụ kỹ thuật (Clinical Services)')
    .addTag('Điều trị Nội trú & Phân giường (Inpatient)')
    .addTag('Thu ngân & Quyết toán viện phí (Billing & Invoices)')
    .addTag('Lịch trực & Phân ca y bác sĩ (Duty Schedules)')
    .addTag('Báo cáo thống kê & Dashboard (Reports)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'QLBV API Documentation',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 Hospital Management Backend running on: http://localhost:${port}/api`);
  logger.log(`📑 Swagger Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

bootstrap();
