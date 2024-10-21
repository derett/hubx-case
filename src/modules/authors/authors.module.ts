import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import schemas from 'src/schemas';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [MongooseModule.forFeature([schemas.Author])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
