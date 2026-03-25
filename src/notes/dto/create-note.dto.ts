import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The title of the note',
    example: 'Shopping List',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'The full content of the note',
    example: 'Buy milk, eggs, and bread',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Whether the note is archived',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
