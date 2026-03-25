import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notes')
export class Note {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Shopping List', description: 'Note title', maxLength: 200 })
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @ApiProperty({ example: 'Buy milk, eggs, and bread', description: 'Note content' })
  @Column({ type: 'text' })
  content!: string;

  @ApiProperty({ example: false, description: 'Whether the note is archived', default: false })
  @Column({ type: 'boolean', default: false, name: 'is_archived' })
  isArchived!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
