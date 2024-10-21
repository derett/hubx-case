// Title
// Author
// Price
// ISBN
// Language
// Number of Pages
// Publisher

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Author } from './author.schema';

@Schema()
export class Book {
  @Prop({ unique: true, required: true })
  title: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  })
  author: Author;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  ISBN: string;

  @Prop({ required: false })
  language?: string;

  @Prop({ required: true })
  numberOfPages: number;

  @Prop({ required: false })
  publisher?: string;
}

export type BookDocument = HydratedDocument<Book>;
export const BookSchema = SchemaFactory.createForClass(Book);
