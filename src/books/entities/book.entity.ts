import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('books')
export class Book {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Cien años de soledad', description: 'Book title', maxLength: 200 })
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @ApiProperty({ example: 'Gabriel García Márquez', description: 'Book author', maxLength: 200 })
  @Column({ type: 'varchar', length: 200 })
  author!: string;

  @ApiProperty({ example: false, description: 'Whether the book has been read', default: false })
  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
