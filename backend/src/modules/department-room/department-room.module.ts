import { Module } from '@nestjs/common';
import { DepartmentRoomService } from './department-room.service';
import { DepartmentRoomController } from './department-room.controller';

@Module({
  controllers: [DepartmentRoomController],
  providers: [DepartmentRoomService],
  exports: [DepartmentRoomService],
})
export class DepartmentRoomModule {}
