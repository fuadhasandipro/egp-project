import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateOfficerDto {
  @IsEmail()
  email: string;

  @IsString()
  roleName: string;

  @IsString()
  @IsOptional()
  institutionId?: string;
}
