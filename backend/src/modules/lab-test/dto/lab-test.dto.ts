import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLabRequestDto {
  @ApiPropertyOptional({ example: 'PXN10' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maPhieuXN?: string;

  @ApiProperty({ example: 'LK02' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maLuotKham!: string;

  @ApiProperty({ example: 'XN01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maLoaiXN!: string;
}

export class StartLabRequestDto {
  @ApiPropertyOptional({ example: 'KTV01' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maNV_KTV?: string;

  @ApiPropertyOptional({ example: '2026-11-15T10:15:00.000Z' })
  @IsOptional()
  @IsDateString()
  ngayGioXN?: string;
}

export class CompleteLabRequestDto {
  @ApiPropertyOptional({ example: 'KTV01' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maNV_KTV?: string;

  @ApiPropertyOptional({ example: '2026-11-15T10:15:00.000Z' })
  @IsOptional()
  @IsDateString()
  ngayGioXN?: string;

  @ApiPropertyOptional({ example: '2026-11-15T10:45:00.000Z' })
  @IsOptional()
  @IsDateString()
  ngayGioTraKQ?: string;

  @ApiProperty({ example: 'WBC: 7.5 G/L; RBC: 4.9 T/L; PLT: 260 G/L' })
  @IsNotEmpty({ message: 'KetQua không được để trống khi trả kết quả (BR-V2-07)' })
  @IsString()
  @MaxLength(500)
  ketQua!: string;

  @ApiPropertyOptional({ example: 'Các chỉ số trong giới hạn bình thường' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  danhGia?: string | null;
}
