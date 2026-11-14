import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HuongXuTriEnum } from '@prisma/client';

export class UpdateDiagnosisDto {
  @ApiProperty({ example: 'Viêm họng cấp tính do liên cầu khuẩn' })
  @IsNotEmpty()
  @IsString()
  chanDoanXacDinh!: string;

  @ApiProperty({ enum: HuongXuTriEnum })
  @IsEnum(HuongXuTriEnum)
  huongXuTri!: HuongXuTriEnum;

  @ApiProperty({ example: '2026-11-25', required: false })
  @IsOptional()
  @IsDateString()
  ngayTaiKham?: string;
}
