import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { HuongXuTriEnum } from '@prisma/client';

export class CreateExaminationDto {
  @ApiProperty({ example: 'LK001', required: false })
  @IsOptional()
  @IsString()
  maLuotKham?: string;

  @ApiProperty({ example: 'BN001' })
  @IsString()
  maBN!: string;

  @ApiProperty({ example: 'BS01' })
  @IsString()
  maBS!: string;

  @ApiProperty({ example: 'P01' })
  @IsString()
  maPhongKham!: string;

  @ApiProperty({ example: 'Sốt cao, đau họng, ho có đờm' })
  @IsString()
  trieuChung!: string;

  @ApiProperty({ example: '120/80', required: false })
  @IsOptional()
  @IsString()
  huyetAp?: string;

  @ApiProperty({ example: 38.5, required: false })
  @IsOptional()
  @IsNumber()
  nhietDo?: number;

  @ApiProperty({ example: 82, required: false })
  @IsOptional()
  @IsNumber()
  mach?: number;

  @ApiProperty({ example: 'Viêm họng cấp / Theo dõi cúm' })
  @IsString()
  chanDoanSoBo!: string;

  @ApiProperty({ enum: HuongXuTriEnum, default: HuongXuTriEnum.KE_DON_VE })
  @IsEnum(HuongXuTriEnum)
  huongXuTri!: HuongXuTriEnum;

  @ApiProperty({ example: '2026-11-20', required: false })
  @IsOptional()
  @IsDateString()
  ngayTaiKham?: string;
}
