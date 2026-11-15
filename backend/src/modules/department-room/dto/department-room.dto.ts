import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TrangThaiGiuong } from '../../../common/enums/role.enum';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'K03' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maKhoa!: string;

  @ApiProperty({ example: 'Khoa Nhi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tenKhoa!: string;

  @ApiProperty({ example: 'Tầng 4 - Tòa nhà A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  diaDiem!: string;

  @ApiProperty({ example: '02838383333' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  soDienThoai!: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Khoa Nhi Tổng Hợp' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenKhoa?: string;

  @ApiPropertyOptional({ example: 'Tầng 4 - Tòa nhà C' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  diaDiem?: string;

  @ApiPropertyOptional({ example: '02838384444' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  soDienThoai?: string;
}

export class CreateRoomDto {
  @ApiProperty({ example: 'P05' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maPhong!: string;

  @ApiProperty({ example: 'K01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maKhoa!: string;

  @ApiProperty({ example: 'Buồng Nội Trú 202' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tenPhong!: string;

  @ApiProperty({ example: 'NOI_TRU' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  loaiPhong!: string;

  @ApiProperty({ example: 'Tầng 2 - Khu A' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  viTri!: string;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'K01' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maKhoa?: string;

  @ApiPropertyOptional({ example: 'Buồng Nội Trú 202B' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenPhong?: string;

  @ApiPropertyOptional({ example: 'NOI_TRU' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  loaiPhong?: string;

  @ApiPropertyOptional({ example: 'Tầng 2 - Khu B' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  viTri?: string;
}

export class UpdateBedStatusDto {
  @ApiProperty({ enum: TrangThaiGiuong, example: TrangThaiGiuong.BAO_TRI })
  @IsNotEmpty()
  @IsEnum(TrangThaiGiuong, {
    message: 'TrangThai giường chỉ nhận SAN_SANG, BAO_TRI hoặc NGUNG_SU_DUNG (BR-V2-11)',
  })
  trangThai!: TrangThaiGiuong;

  @ApiPropertyOptional({ example: 400000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  donGiaNgay?: number;
}
