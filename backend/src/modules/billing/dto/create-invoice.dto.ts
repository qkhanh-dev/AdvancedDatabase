import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PhuongThucTTEnum } from '@prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'HD001', required: false })
  @IsOptional()
  @IsString()
  maHD?: string;

  @ApiProperty({ example: 'LK001' })
  @IsNotEmpty()
  @IsString()
  maLuotKham!: string;

  @ApiProperty({ example: 'NV_TN_01' })
  @IsNotEmpty()
  @IsString()
  maNVThuNgan!: string;

  @ApiProperty({ enum: PhuongThucTTEnum, default: PhuongThucTTEnum.CHUYEN_KHOAN })
  @IsEnum(PhuongThucTTEnum)
  phuongThucTT!: PhuongThucTTEnum;
}
