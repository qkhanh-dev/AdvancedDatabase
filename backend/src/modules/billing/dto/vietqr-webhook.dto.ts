import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VietQrWebhookDto {
  @ApiProperty({ example: 'HD001' })
  @IsNotEmpty()
  @IsString()
  maHD!: string;

  @ApiProperty({ example: 450000 })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'TRAN_20261114_00123' })
  @IsNotEmpty()
  @IsString()
  transactionId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}
