import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Good', 'Needs Repair'])
  condition: string;
}
