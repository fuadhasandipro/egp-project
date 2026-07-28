import { IsString, IsNotEmpty, IsIn, MinLength } from 'class-validator';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Low', 'Medium', 'High'])
  severity: string;
}
