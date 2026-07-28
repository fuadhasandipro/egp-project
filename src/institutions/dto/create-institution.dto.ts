import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInstitutionDto {
  @ApiProperty({ example: 'Dhaka City College', description: 'The name of the institution' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '108253', description: 'Educational Institute Identification Number (EIIN)' })
  @IsString()
  @IsNotEmpty()
  eiin: string;

  @ApiProperty({ example: 'College', description: 'The type of the institution (e.g., School, College)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 23.7381, description: 'Latitude coordinate of the institution' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 90.3802, description: 'Longitude coordinate of the institution' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
