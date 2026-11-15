import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PrescriptionItemDto {
  @ApiProperty({ example: 'TH01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maThuoc!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive({ message: 'SoLuong phải > 0 (BR-V2-06)' })
  soLuong!: number;

  @ApiProperty({ example: 'Uống 1 viên x 2 lần/ngày sau ăn' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  lieuDung!: string;
}

export class CreatePrescriptionDto {
  @ApiPropertyOptional({ example: 'DT10' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maDonThuoc?: string;

  @ApiProperty({ example: 'LK02' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maLuotKham!: string;

  @ApiPropertyOptional({ example: '2026-11-15' })
  @IsOptional()
  @IsDateString()
  ngayKeDon?: string;

  @ApiProperty({ example: 'Uống nhiều nước, tái khám sau 5 ngày' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  loiDanCuaBacSi!: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn thuốc phải có ít nhất 1 dòng chi tiết thuốc (BR-V2-06)' })
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({ example: '2026-11-16' })
  @IsOptional()
  @IsDateString()
  ngayKeDon?: string;

  @ApiPropertyOptional({ example: 'Cập nhật lời dặn bác sĩ' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  loiDanCuaBacSi?: string;

  @ApiPropertyOptional({ example: 'LK03' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maLuotKham?: string;

  @ApiPropertyOptional({ type: [PrescriptionItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn thuốc phải giữ tối thiểu 1 dòng chi tiết thuốc (BR-V2-06)' })
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items?: PrescriptionItemDto[];
}
