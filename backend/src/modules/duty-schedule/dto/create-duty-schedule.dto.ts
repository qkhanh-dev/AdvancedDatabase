import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CaTrucEnum, TrangThaiDiemDanhEnum } from '@prisma/client';

export class CreateDutyScheduleDto {
  @ApiProperty({ example: 'BS01' })
  @IsNotEmpty()
  @IsString()
  maNV!: string;

  @ApiProperty({ example: '2026-11-20' })
  @IsNotEmpty()
  @IsDateString()
  ngayTruc!: string;

  @ApiProperty({ enum: CaTrucEnum, default: CaTrucEnum.DEM })
  @IsEnum(CaTrucEnum)
  caTruc!: CaTrucEnum;

  @ApiProperty({ example: 'P01' })
  @IsNotEmpty()
  @IsString()
  maPhong!: string;

  @ApiProperty({ example: 'Bác sĩ trực chính Cấp cứu' })
  @IsOptional()
  @IsString()
  vaiTroTruc?: string;

  @ApiProperty({ enum: TrangThaiDiemDanhEnum, default: TrangThaiDiemDanhEnum.CHUA_DIEM_DANH })
  @IsOptional()
  @IsEnum(TrangThaiDiemDanhEnum)
  trangThaiDiemDanh?: TrangThaiDiemDanhEnum;
}
