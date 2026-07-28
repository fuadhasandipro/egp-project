import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['Good', 'Needs Repair'] })
  @IsOptional()
  @IsString()
  @IsIn(['Good', 'Needs Repair'])
  condition: string;
}
