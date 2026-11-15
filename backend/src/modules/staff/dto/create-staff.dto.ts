import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GioiTinh, Role } from '../../../common/enums/role.enum';

export class CreateBacSiDto {
  @ApiProperty({ example: 'Nội tổng quát' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  chuyenKhoa!: string;

  @ApiProperty({ example: 'Bác sĩ CKI' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  trinhDoHocVan!: string;

  @ApiProperty({ example: 'CCHN_BS_9999' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  soChungChiHanhNghe!: string;
}

export class CreateDieuDuongDto {
  @ApiProperty({ example: 'Điều dưỡng hạng III' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  capBac!: string;

  @ApiProperty({ example: 'CCHN_DD_9999' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  chungChiHanhNghe!: string;
}

export class CreateKyThuatVienDto {
  @ApiProperty({ example: 'Sinh hóa - Huyết học' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  chuyenMonXetNghiem!: string;

  @ApiProperty({ example: 'Máy xét nghiệm Cobas c311' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  btdThietBiPhuTrach!: string;
}

export class CreateStaffDto {
  @ApiProperty({ example: 'BS09' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maNV!: string;

  @ApiProperty({ example: 'K01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  maKhoa!: string;

  @ApiProperty({ example: 'Nguyễn Văn Hùng' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  hoTen!: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsNotEmpty()
  @IsDateString()
  ngaySinh!: string;

  @ApiProperty({ enum: GioiTinh, example: GioiTinh.NAM })
  @IsNotEmpty()
  @IsEnum(GioiTinh)
  gioiTinh!: GioiTinh;

  @ApiProperty({ example: '079090009999' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  cccd!: string;

  @ApiProperty({ example: '123 Lê Lợi, Q1, TP.HCM' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  diaChi!: string;

  @ApiProperty({ example: '0909009999' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  soDienThoai!: string;

  @ApiProperty({ example: '2022-01-10' })
  @IsNotEmpty()
  @IsDateString()
  ngayVaoLam!: string;

  @ApiPropertyOptional({ enum: Role, description: 'Vai trò phân quyền (đặc biệt cho nhóm partial: TIEP_NHAN, THU_NGAN, ADMIN)' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ type: CreateBacSiDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBacSiDto)
  bacSi?: CreateBacSiDto;

  @ApiPropertyOptional({ type: CreateDieuDuongDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDieuDuongDto)
  dieuDuong?: CreateDieuDuongDto;

  @ApiPropertyOptional({ type: CreateKyThuatVienDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateKyThuatVienDto)
  kyThuatVien?: CreateKyThuatVienDto;
}
