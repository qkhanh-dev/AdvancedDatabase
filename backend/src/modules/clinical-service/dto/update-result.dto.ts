import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateServiceResultDto {
  @ApiProperty({ example: 'LK001' })
  @IsNotEmpty()
  @IsString()
  maLuotKham!: string;

  @ApiProperty({ example: 'DV01' })
  @IsNotEmpty()
  @IsString()
  maDV!: string;

  @ApiProperty({ example: '2026-11-14T08:30:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  thoiGianChiDinh!: string;

  @ApiProperty({ example: 'Bạch cầu: 7.5 G/L, Hồng cầu: 4.8 T/L, Tiểu cầu: 250 G/L (Bình thường)' })
  @IsNotEmpty()
  @IsString()
  ketQuaCLS!: string;

  @ApiProperty({ example: 'DD01' })
  @IsNotEmpty()
  @IsString()
  maKTVThucHien!: string;
}
