export type AuthorSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  teamId: string;
  bio: string;
  createdAt: number;
};

export type UserDocument = AuthorSnapshot & {
  _id: string;
  password: string;
};

export type TeamDocument = {
  _id: string;
  name: string;
  description: string;
  createdAt: number;
};

export type DiscussionDocument = {
  _id: string;
  title: string;
  body: string;
  teamId: string;
  author: AuthorSnapshot;
  createdAt: number;
};

export type CommentDocument = {
  _id: string;
  body: string;
  discussionId: string;
  author: AuthorSnapshot;
  createdAt: number;
};
