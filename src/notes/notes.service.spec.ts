/*
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

const mockNote: Note = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Note',
  content: 'Test content',
  isArchived: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

type MockRepository = {
  [K in keyof NotesRepository]: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('NotesService', () => {
  let service: NotesService;
  let repository: MockRepository;

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService, { provide: NotesRepository, useValue: repository }],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
*/
