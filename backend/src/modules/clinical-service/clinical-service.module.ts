import { Module } from '@nestjs/common';
import { ClinicalServiceService } from './clinical-service.service';
import { ClinicalServiceController } from './clinical-service.controller';

@Module({
  controllers: [ClinicalServiceController],
  providers: [ClinicalServiceService],
  exports: [ClinicalServiceService],
})
export class ClinicalServiceModule {}
