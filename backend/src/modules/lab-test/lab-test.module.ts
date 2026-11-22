import { Module } from '@nestjs/common';
import { LabTestController } from './lab-test.controller';
import { LabTestService } from './lab-test.service';

@Module({
  controllers: [LabTestController],
  providers: [LabTestService],
  exports: [LabTestService],
})
export class LabTestModule {}
