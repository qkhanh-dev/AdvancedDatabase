import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AssignServiceDto {
  @ApiProperty({ example: 'LK001' })
  @IsNotEmpty()
  @IsString()
  maLuotKham!: string;

  @ApiProperty({ example: 'DV01' })
  @IsNotEmpty()
  @IsString()
  maDV!: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @IsPositive()
  soLuong!: number;
}
