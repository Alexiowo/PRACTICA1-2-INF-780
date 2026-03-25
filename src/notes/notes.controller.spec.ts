/*
import { BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
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

type MockService = {
  [K in keyof NotesService]: jest.Mock;
};

const createMockService = (): MockService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('NotesController', () => {
  let controller: NotesController;
  let service: MockService;

  beforeEach(async () => {
    service = createMockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: service }],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
*/
