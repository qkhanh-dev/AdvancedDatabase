import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GioiTinhEnum, NhomMauEnum } from '@prisma/client';

export class ReceptionDto {
  @ApiProperty({ example: 'BN001', required: false, description: 'Mã bệnh nhân nếu đã có' })
  @IsOptional()
  @IsString()
  maBN?: string;

  @ApiProperty({ example: 'Nguyễn Văn An', description: 'Họ và tên bệnh nhân' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên bệnh nhân' })
  @IsString()
  hoTen!: string;

  @ApiProperty({ example: '1990-05-15', description: 'Ngày sinh bệnh nhân' })
  @IsNotEmpty({ message: 'Vui lòng nhập ngày sinh' })
  @IsDateString()
  ngaySinh!: string;

  @ApiProperty({ enum: GioiTinhEnum, default: GioiTinhEnum.NAM })
  @IsEnum(GioiTinhEnum)
  gioiTinh!: GioiTinhEnum;

  @ApiProperty({ example: '079090123456', required: false })
  @IsOptional()
  @IsString()
  cccd?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @ApiProperty({ example: 'GD4797938329482', required: false })
  @IsOptional()
  @IsString()
  soBHYT?: string;

  @ApiProperty({ example: 80, required: false, description: 'Mức hưởng BHYT (80, 95, 100)' })
  @IsOptional()
  @IsInt()
  mucHuongBHYT?: number;

  @ApiProperty({ example: '123 An Dương Vương, P.3, Q.5, TP.HCM' })
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
  @IsString()
  diaChi!: string;

  @ApiProperty({ enum: NhomMauEnum, default: NhomMauEnum.O, required: false })
  @IsOptional()
  @IsEnum(NhomMauEnum)
  nhomMau?: NhomMauEnum;

  @ApiProperty({ default: true, description: 'Đăng ký sổ khám ngoại trú' })
  @IsOptional()
  @IsBoolean()
  isNgoaiTru?: boolean;
}
