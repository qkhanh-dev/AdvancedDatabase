import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TrangThaiLuotKham } from '../../../common/enums/role.enum';

export class CreateExaminationDto {
  @ApiPropertyOptional({ example: 'LK10' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maLuotKham?: string;

  @ApiProperty({ example: 'BN01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maBN!: string;

  @ApiProperty({ example: 'BS01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maNV_BacSi!: string;

  @ApiPropertyOptional({ example: '2026-11-15T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  ngayGioKham?: string;

  @ApiProperty({ example: 'Đau đầu và sốt nhẹ 2 ngày' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lyDoKham!: string;

  @ApiProperty({ example: 'Sốt 38 độ, đau họng' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  trieuChung!: string;

  @ApiProperty({ example: 'Theo dõi viêm họng cấp' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  chanDoanSoBo!: string;

  @ApiPropertyOptional({ enum: TrangThaiLuotKham, default: TrangThaiLuotKham.CHO_KHAM })
  @IsOptional()
  @IsEnum(TrangThaiLuotKham)
  trangThai?: TrangThaiLuotKham;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maDotNT?: string | null;
}

export class UpdateExaminationDto {
  @ApiPropertyOptional({ example: 'Đau đầu âm ỉ' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lyDoKham?: string;

  @ApiPropertyOptional({ example: 'Sốt giảm còn 37.5 độ' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  trieuChung?: string;

  @ApiPropertyOptional({ example: 'Viêm họng cấp ổn định' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  chanDoanSoBo?: string;

  @ApiPropertyOptional({ enum: TrangThaiLuotKham })
  @IsOptional()
  @IsEnum(TrangThaiLuotKham)
  trangThai?: TrangThaiLuotKham;

  @ApiPropertyOptional({ example: 'DOT01', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maDotNT?: string | null;
}
