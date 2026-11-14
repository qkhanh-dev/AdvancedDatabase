import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class PrescriptionItemDto {
  @ApiProperty({ example: 'TH01' })
  @IsNotEmpty()
  @IsString()
  maThuoc!: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @IsPositive({ message: 'Số lượng thuốc phải lớn hơn 0' })
  soLuong!: number;

  @ApiProperty({ example: 'Sáng 1 viên, Tối 1 viên sau ăn' })
  @IsString()
  lieuDung!: string;

  @ApiProperty({ example: 'Uống sau bữa ăn 30 phút' })
  @IsString()
  cachDung!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive({ message: 'Số ngày uống phải lớn hơn 0' })
  soNgayUong!: number;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'DT001', required: false })
  @IsOptional()
  @IsString()
  maDon?: string;

  @ApiProperty({ example: 'LK001' })
  @IsNotEmpty()
  @IsString()
  maLuotKham!: string;

  @ApiProperty({ example: 'Uống nhiều nước, kiêng đồ uống có cồn', required: false })
  @IsOptional()
  @IsString()
  loiDanBacSi?: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}
