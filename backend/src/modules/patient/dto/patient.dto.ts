import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { GioiTinh } from '../../../common/enums/role.enum';

export class CreatePatientDto {
  @ApiPropertyOptional({ example: 'BN10' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maBN?: string;

  @ApiProperty({ example: 'Trần Văn Minh' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  hoTen!: string;

  @ApiProperty({ example: '1992-08-20' })
  @IsNotEmpty()
  @IsDateString()
  ngaySinh!: string;

  @ApiProperty({ enum: GioiTinh, example: GioiTinh.NAM })
  @IsNotEmpty()
  @IsEnum(GioiTinh)
  gioiTinh!: GioiTinh;

  @ApiProperty({ example: '079092001234' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  cccd!: string;

  @ApiProperty({ example: '0909123456' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  sdt!: string;

  @ApiProperty({ example: '123 Nguyễn Trãi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  diaChiDuong!: string;

  @ApiProperty({ example: 'Phường 2' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  diaChiPhuong!: string;

  @ApiProperty({ example: 'Quận 5' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  diaChiQuan!: string;

  @ApiProperty({ example: 'O' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  nhomMau!: string;
}

export class CreateInsuranceCardDto {
  @ApiProperty({ example: 'DN4790009999' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maTheBHYT!: string;

  @ApiProperty({ example: 0.8, description: 'Mức hưởng trong đoạn [0, 1]' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'MucHuong phải nằm trong đoạn [0, 1] (BR-V2-06)' })
  @Max(1, { message: 'MucHuong phải nằm trong đoạn [0, 1] (BR-V2-06)' })
  mucHuong!: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsNotEmpty()
  @IsDateString()
  ngayBatDau!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsNotEmpty()
  @IsDateString()
  ngayHetHan!: string;
}
