import mongoose from 'mongoose';

export type TMongoObject = {
  _id: string;
  __v: number;
};

export function isMongoServerError(
  e: any,
): e is mongoose.mongo.MongoServerError {
  return e.name && e.name === 'MongoServerError';
}
