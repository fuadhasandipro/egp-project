import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'The user email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The user password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}
