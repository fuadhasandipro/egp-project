import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfficerDto {
  @ApiProperty({ example: 'officer@example.com', description: 'Email address of the new officer' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'to', description: 'Role name for the new officer (e.g., to, ato)' })
  @IsString()
  roleName: string;

  @ApiPropertyOptional({ description: 'UUID of the institution if assigning to a specific one' })
  @IsString()
  @IsOptional()
  institutionId?: string;
}
