import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const logger = new Logger('HospitalBackendBootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

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

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Hospital Management System API v2.0 (QLBV)')
    .setDescription(
      'Hệ Thống Quản Lý Bệnh Viện - Khoa CNTT, Đại học Sài Gòn (SGU)\n' +
      'Chuẩn hóa v2: 18 bảng, 103 cột, 20 khóa ngoại (NO ACTION), 6 thuộc tính dẫn xuất (VIEW/Query), 13 nhóm quy tắc (BR-V2-01..13).',
    )
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Xác thực hệ thống (Auth)')
    .addTag('Cơ sở vật chất & Khoa phòng (Department & Room)')
    .addTag('Nhân sự y tế (Staff)')
    .addTag('Tiếp đón, Bệnh nhân & Thẻ BHYT (Patient & Insurance)')
    .addTag('Khám bệnh & Lượt khám (Examination)')
    .addTag('Dược phẩm & Đơn thuốc (Medicines & Prescriptions)')
    .addTag('Xét nghiệm & Phiếu xét nghiệm (Lab Tests)')
    .addTag('Điều trị Nội trú & Phân giường (Inpatient)')
    .addTag('Viện phí & Thanh toán (Billing)')
    .addTag('Báo cáo thống kê & Dashboard (Reports)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'QLBV API v2.0 Documentation',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 Hospital Management Backend v2.0 running on: http://localhost:${port}/api`);
  logger.log(`📑 Swagger Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

bootstrap();
