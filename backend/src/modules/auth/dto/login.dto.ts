import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'BS01', description: 'Mã nhân viên (MaNV) hoặc Email cán bộ y tế' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên tài khoản hoặc mã nhân viên' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;
}
