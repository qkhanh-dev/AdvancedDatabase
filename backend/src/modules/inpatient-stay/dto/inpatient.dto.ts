import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdmissionDto {
  @ApiPropertyOptional({ example: 'DOT10' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maDotNT?: string;

  @ApiProperty({ example: 'BN01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maBN!: string;

  @ApiProperty({ example: '2026-11-16' })
  @IsNotEmpty()
  @IsDateString()
  ngayNhapVien!: string;

  @ApiProperty({ example: 'Nguyễn Văn Bình (0909111333)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nguoiNhaLienHe!: string;

  @ApiProperty({ example: 'Sốt cao kéo dài, cần theo dõi nội trú' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tinhTrangNhapVien!: string;
}

export class CreateBedAllocationDto {
  @ApiProperty({ example: 'DOT01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maDotNT!: string;

  @ApiProperty({ example: 'G02' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maGiuong!: string;

  @ApiProperty({ example: '2026-11-16' })
  @IsNotEmpty()
  @IsDateString()
  tuNgay!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsDateString()
  denNgay?: string | null;
}

export class TransferBedDto {
  @ApiProperty({ example: 'DOT01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maDotNT!: string;

  @ApiProperty({ example: 'G03' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maGiuongMoi!: string;

  @ApiProperty({ example: '2026-11-16' })
  @IsNotEmpty()
  @IsDateString()
  ngayChuyen!: string;
}

export class DischargeAdmissionDto {
  @ApiProperty({ example: '2026-11-18' })
  @IsNotEmpty()
  @IsDateString()
  ngayRaVien!: string;
}
