import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(Note)
    private readonly repository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const note = this.repository.create(createNoteDto);
    return this.repository.save(note);
  }

  async findAll(archived?: boolean): Promise<Note[]> {
    const qb = this.repository.createQueryBuilder('note');
    if (archived !== undefined) {
      qb.where('note.isArchived = :archived', { archived });
    }
    return qb.orderBy('note.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Note | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note | null> {
    await this.repository.update(id, updateNoteDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
