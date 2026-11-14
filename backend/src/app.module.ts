import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentRoomModule } from './modules/department-room/department-room.module';
import { StaffModule } from './modules/staff/staff.module';
import { PatientModule } from './modules/patient/patient.module';
import { ExaminationModule } from './modules/examination/examination.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { ClinicalServiceModule } from './modules/clinical-service/clinical-service.module';
import { InpatientStayModule } from './modules/inpatient-stay/inpatient-stay.module';
import { BillingModule } from './modules/billing/billing.module';
import { DutyScheduleModule } from './modules/duty-schedule/duty-schedule.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    PrismaModule,
    AuthModule,
    DepartmentRoomModule,
    StaffModule,
    PatientModule,
    ExaminationModule,
    PrescriptionModule,
    ClinicalServiceModule,
    InpatientStayModule,
    BillingModule,
    DutyScheduleModule,
    ReportModule,
  ],
})
export class AppModule {}
