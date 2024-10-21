// Name
// Country
// Birth Date

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Book } from './book.schema';

@Schema()
export class Author {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  birthDate?: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] })
  books: Book[];
}

export type AuthorDocument = HydratedDocument<Author>;
export const AuthorSchema = SchemaFactory.createForClass(Author);
