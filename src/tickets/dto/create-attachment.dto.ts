import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
