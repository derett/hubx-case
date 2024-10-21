// Name
// Country
// Birth Date

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Author {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  birthDate?: string;
}

export type AuthorDocument = HydratedDocument<Author>;
export const AuthorSchema = SchemaFactory.createForClass(Author);
