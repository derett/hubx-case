import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import schemas from 'src/schemas';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [MongooseModule.forFeature([schemas.Book, schemas.Author])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
