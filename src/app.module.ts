import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { AuthorsModule } from './modules/authors/authors.module';
import { BooksModule } from './modules/books/books.module';
import serverLogger from './shared/loggers/server.logger';

@Module({
  imports: [
    LoggerModule.forRoot(serverLogger),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    AuthorsModule,
    BooksModule,
  ],
})
export class AppModule {}
