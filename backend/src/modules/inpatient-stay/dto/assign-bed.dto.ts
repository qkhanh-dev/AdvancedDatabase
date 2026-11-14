import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignBedDto {
  @ApiProperty({ example: 'BN001' })
  @IsNotEmpty()
  @IsString()
  maBN!: string;

  @ApiProperty({ example: 'G01' })
  @IsNotEmpty()
  @IsString()
  maGiuong!: string;

  @ApiProperty({ example: 'Phân giường nhập viện điều trị', required: false })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class TransferBedDto {
  @ApiProperty({ example: 'BN001' })
  @IsNotEmpty()
  @IsString()
  maBN!: string;

  @ApiProperty({ example: 'G02' })
  @IsNotEmpty()
  @IsString()
  maGiuongMoi!: string;

  @ApiProperty({ example: 'Chuyển sang buồng cách ly theo dõi đặc biệt' })
  @IsNotEmpty()
  @IsString()
  lyDoChuyen!: string;
}
