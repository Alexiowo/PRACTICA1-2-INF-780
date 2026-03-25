import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesRepository.create(createNoteDto);
  }

  async findAll(archived?: boolean): Promise<Note[]> {
    return this.notesRepository.findAll(archived);
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne(id);
    if (!note) {
      throw new NotFoundException(`Note with id "${id}" not found`);
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    await this.findOne(id);
    const updated = await this.notesRepository.update(id, updateNoteDto);
    if (!updated) {
      throw new NotFoundException(`Note with id "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.notesRepository.remove(id);
  }
}
