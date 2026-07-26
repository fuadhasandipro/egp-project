import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateOfficerDto {
  @IsEmail()
  email: string;

  @IsString()
  roleId: string;

  @IsString()
  @IsOptional()
  institutionId?: string;
}
