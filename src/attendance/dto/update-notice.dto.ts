import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  content?: string;
}
