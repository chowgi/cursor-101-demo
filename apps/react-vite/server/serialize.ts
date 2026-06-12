import type {
  AuthorSnapshot,
  CommentDocument,
  DiscussionDocument,
  UserDocument,
} from './types';
import { serializeUser } from './auth';

export const serializeDiscussionRead = (discussion: DiscussionDocument) => {
  const { _id, author, ...fields } = discussion;
  return { id: _id, ...fields, author };
};

export const serializeDiscussionWrite = (discussion: DiscussionDocument) => {
  const { _id, author, ...fields } = discussion;
  return { id: _id, ...fields, authorId: author.id };
};

export const serializeCommentRead = (comment: CommentDocument) => {
  const { _id, author, ...fields } = comment;
  return { id: _id, ...fields, author };
};

export const serializeCommentWrite = (comment: CommentDocument) => {
  const { _id, author, ...fields } = comment;
  return { id: _id, ...fields, authorId: author.id };
};

export const serializeUsers = (users: UserDocument[]): AuthorSnapshot[] => {
  return users.map(serializeUser);
};
