import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInfrastructureRequestDto {
  @IsString()
  @IsNotEmpty()
  itemType: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
