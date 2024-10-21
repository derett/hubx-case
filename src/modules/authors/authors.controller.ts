import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MongoIdGuard } from 'src/shared/guards/mongo.id.guard';
import { AuthorsService } from './authors.service';
import { AuthorCreateDto } from './dtos/author.create.dto';
import { AuthorUpdateDto } from './dtos/author.update.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  createAuthor(@Body() body: AuthorCreateDto) {
    return this.authorsService.createAuthor(body);
  }

  @Get('/')
  listAuthors() {
    return this.authorsService.listAuthors();
  }

  @UseGuards(MongoIdGuard)
  @Get('/:id')
  findAuthor(@Param('id') id: string) {
    return this.authorsService.findAuthor(id);
  }

  @UseGuards(MongoIdGuard)
  @Put('/:id')
  updateAuthor(@Param('id') id: string, @Body() body: AuthorUpdateDto) {
    return this.authorsService.updateAuthor(id, body);
  }

  @UseGuards(MongoIdGuard)
  @Delete('/:id')
  deleteAuthor(@Param('id') id: string) {
    return this.authorsService.deleteAuthor(id);
  }
}
