import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdmitPatientDto {
  @ApiProperty({ example: 'BN001' })
  @IsNotEmpty()
  @IsString()
  maBN!: string;

  @ApiProperty({ example: 'BA2026_001', required: false })
  @IsOptional()
  @IsString()
  soHoSoBenhAn?: string;

  @ApiProperty({ example: '2026-11-20', required: false })
  @IsOptional()
  @IsDateString()
  ngayXuatVienDuKien?: string;

  @ApiProperty({ example: 'Viêm phổi thùy cấp tính' })
  @IsNotEmpty()
  @IsString()
  chanDoanNhapVien!: string;

  @ApiProperty({ example: 'Vua', description: 'Nhe, Vua, Nang, Nguy_kich' })
  @IsNotEmpty()
  @IsString()
  tinhTrangNhapVien!: string;

  @ApiProperty({ example: 'BS01' })
  @IsNotEmpty()
  @IsString()
  maBSTheoDoi!: string;
}
