import { Module } from '@nestjs/common';
import { InpatientStayService } from './inpatient-stay.service';
import { InpatientStayController } from './inpatient-stay.controller';

@Module({
  controllers: [InpatientStayController],
  providers: [InpatientStayService],
  exports: [InpatientStayService],
})
export class InpatientStayModule {}
