import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { HinhThucThanhToan } from '../../../common/enums/role.enum';

export class CreateInvoiceDto {
  @ApiPropertyOptional({ example: 'HD10' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maHoaDon?: string;

  @ApiProperty({ example: 'LK02' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maLuotKham!: string;

  @ApiPropertyOptional({ example: '2026-11-15' })
  @IsOptional()
  @IsDateString()
  ngayLap?: string;

  @ApiProperty({ enum: HinhThucThanhToan, example: HinhThucThanhToan.TIEN_MAT })
  @IsNotEmpty()
  @IsEnum(HinhThucThanhToan)
  hinhThucThanhToan!: HinhThucThanhToan;

  @ApiPropertyOptional({ example: 'HS4790000002', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maTheBHYT?: string | null;
}

export class PayInvoiceDto {
  @ApiPropertyOptional({ enum: HinhThucThanhToan, example: HinhThucThanhToan.CHUYEN_KHOAN })
  @IsOptional()
  @IsEnum(HinhThucThanhToan)
  hinhThucThanhToan?: HinhThucThanhToan;
}
