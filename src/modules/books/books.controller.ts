import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { BookCreateDto } from './dtos/book.create.dto';
import { BookUpdateDto } from './dtos/book.update.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  createBook(@Body() body: BookCreateDto) {
    return this.booksService.createBook(body);
  }

  @Get('/')
  listBooks() {
    return this.booksService.listBooks();
  }

  @Get('/:id')
  findBook(@Param('id') id: string) {
    return this.booksService.findBook(id);
  }

  @Put('/:id')
  updateBook(@Param('id') id: string, @Body() body: BookUpdateDto) {
    return this.booksService.updateBook(id, body);
  }

  @Delete('/:id')
  deleteBook(@Param('id') id: string) {
    return this.booksService.deleteBook(id);
  }
}
