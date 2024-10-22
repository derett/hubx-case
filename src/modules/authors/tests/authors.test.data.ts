import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import booksTestData from 'src/modules/books/tests/books.test.data';
import { TMongoObject } from 'src/shared/types/mixed';
import { AuthorCreateDto } from '../dtos/author.create.dto';

// Function to generate random author data
function randomAuthorData(): AuthorCreateDto {
  return {
    name: faker.person.fullName(),
    birthDate: faker.date.anytime().toDateString(),
    country: faker.location.country(),
  };
}

// Function to create a random author with MongoDB-related fields
function createRandomAuthor(): AuthorCreateDto & TMongoObject {
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    __v: 0,
    ...randomAuthorData(),
  };
}

// Static authors array, created only once and reused
let authors: Array<AuthorCreateDto & TMongoObject> | null = null;

// Function to get authors (lazy initialization)
function getAuthors() {
  if (!authors) {
    // Only generate the array once and cache it
    authors = Array.from({ length: 5 }, createRandomAuthor);
  }
  return authors;
}

function populateBooks(authorId: string) {
  const books = booksTestData.getBooks().filter((o) => o.authorId === authorId);

  return {
    ...getAuthors().find((o) => o._id === authorId),
    books,
  };
}

export default {
  randomAuthorData,
  createRandomAuthor,
  // Pick a random author from the array
  pickOne: () => {
    const allAuthors = getAuthors();
    return allAuthors[Math.floor(Math.random() * allAuthors.length)];
  },

  // Find an author by _id
  pickOneById: (_id: string) => {
    const allAuthors = getAuthors();
    return allAuthors.find((author) => author._id === _id);
  },

  // Return the full list of authors
  getAuthors,

  // Return Author with Books populated
  populateBooks,
};
