import { faker } from '@faker-js/faker';
import { UniqueEnforcer } from 'enforce-unique';
import mongoose from 'mongoose';
import authorsTestData from 'src/modules/authors/tests/authors.test.data';
import { TMongoObject } from 'src/shared/types/mixed';
import { BookCreateDto } from '../dtos/book.create.dto';

const uniqueEnforcer = new UniqueEnforcer();

// Function to generate random book data
function randomBookData(): BookCreateDto {
  return {
    title: uniqueEnforcer.enforce(() => {
      return faker.music.songName();
    }),
    numberOfPages: Math.round(Math.random() * 100 + 10),
    ISBN: faker.commerce.isbn(),
    price: Number(faker.commerce.price()),
    language: faker.location.countryCode(),
    publisher: faker.company.name(),
    authorId: authorsTestData.pickOne()._id,
  };
}

// Function to create a random book with MongoDB-related fields
function createRandomBook(): BookCreateDto & TMongoObject {
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    __v: 0,
    ...randomBookData(),
  };
}

// Static books array, created only once and reused
let books: Array<BookCreateDto & TMongoObject> | null = null;

// Function to get authors (lazy initialization)
function getBooks() {
  if (!books) {
    books = Array.from({ length: 10 }, createRandomBook);
  }
  return books;
}

function populateAuthor(bookId: string) {
  const book = getBooks().find((o) => o._id === bookId);

  if (book) {
    const author = authorsTestData
      .getAuthors()
      .find((o) => o._id === book.authorId);

    if (author) {
      return {
        ...book,
        author,
      };
    }
  }
}

export default {
  randomBookData,
  createRandomBook,
  // Pick a random book from the array
  pickOne: () => {
    const allBooks = getBooks();
    return allBooks[Math.floor(Math.random() * allBooks.length)];
  },
  // Find a book by _id
  pickOneById: (_id: string) => {
    const allBooks = getBooks();
    return allBooks.find((book) => book._id === _id);
  },

  // Return the full list of books
  getBooks,

  // Return Book wtih Author populated
  populateAuthor,
};
