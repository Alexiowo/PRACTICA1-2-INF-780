import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(private readonly booksRepository: BooksRepository) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    return this.booksRepository.create(createBookDto);
  }

  async findAll(isRead?: boolean): Promise<Book[]> {
    return this.booksRepository.findAll(isRead);
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);
    const updated = await this.booksRepository.update(id, updateBookDto);
    if (!updated) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.booksRepository.remove(id);
  }
  
}
