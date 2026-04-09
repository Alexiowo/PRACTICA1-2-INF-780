import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'Cien años de soledad',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'The author of the book',
    example: 'Gabriel García Márquez',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  author!: string;

  @ApiProperty({
    description: 'Whether the book has been read',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
