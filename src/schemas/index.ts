import { Author, AuthorSchema } from './author.schema';
import { Book, BookSchema } from './book.schema';

export default {
  Book: { name: Book.name, schema: BookSchema },
  Author: { name: Author.name, schema: AuthorSchema },
};
