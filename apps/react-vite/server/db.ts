import { MongoClient, type Collection, type Db } from 'mongodb';

import { env } from './env';
import type {
  CommentDocument,
  DiscussionDocument,
  TeamDocument,
  UserDocument,
} from './types';

export const DATABASE_NAME = 'cursor-demo';

let client: MongoClient | null = null;
let database: Db | null = null;

const getClient = async (): Promise<MongoClient> => {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
  }

  return client;
};

export const getDb = async (): Promise<Db> => {
  if (!database) {
    const mongoClient = await getClient();
    database = mongoClient.db(DATABASE_NAME);
  }

  return database;
};

const collectionExists = async (db: Db, name: string): Promise<boolean> => {
  const collections = await db
    .listCollections({ name }, { nameOnly: true })
    .toArray();
  return collections.length > 0;
};

const ensureCollection = async (
  db: Db,
  name: string,
  validator: object,
): Promise<void> => {
  const exists = await collectionExists(db, name);

  if (!exists) {
    await db.createCollection(name, {
      validator,
      validationLevel: 'moderate',
      validationAction: 'warn',
    });
  }
};

export const bootstrapDatabase = async (): Promise<void> => {
  const db = await getDb();

  await ensureCollection(db, 'users', {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        '_id',
        'firstName',
        'lastName',
        'email',
        'password',
        'teamId',
        'role',
        'bio',
        'createdAt',
      ],
      properties: {
        _id: { bsonType: 'string' },
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        teamId: { bsonType: 'string' },
        role: { enum: ['ADMIN', 'USER'] },
        bio: { bsonType: 'string' },
        createdAt: { bsonType: ['int', 'long', 'double'] },
      },
    },
  });

  await ensureCollection(db, 'teams', {
    $jsonSchema: {
      bsonType: 'object',
      required: ['_id', 'name', 'description', 'createdAt'],
      properties: {
        _id: { bsonType: 'string' },
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        createdAt: { bsonType: ['int', 'long', 'double'] },
      },
    },
  });

  await ensureCollection(db, 'discussions', {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        '_id',
        'title',
        'body',
        'teamId',
        'author',
        'createdAt',
      ],
      properties: {
        _id: { bsonType: 'string' },
        title: { bsonType: 'string' },
        body: { bsonType: 'string' },
        teamId: { bsonType: 'string' },
        author: { bsonType: 'object' },
        createdAt: { bsonType: ['int', 'long', 'double'] },
      },
    },
  });

  await ensureCollection(db, 'comments', {
    $jsonSchema: {
      bsonType: 'object',
      required: ['_id', 'body', 'discussionId', 'author', 'createdAt'],
      properties: {
        _id: { bsonType: 'string' },
        body: { bsonType: 'string' },
        discussionId: { bsonType: 'string' },
        author: { bsonType: 'object' },
        createdAt: { bsonType: ['int', 'long', 'double'] },
      },
    },
  });

  const users = await getUsersCollection();
  const discussions = await getDiscussionsCollection();
  const comments = await getCommentsCollection();

  await users.createIndex({ email: 1 }, { unique: true });
  await discussions.createIndex({ teamId: 1, createdAt: -1 });
  await comments.createIndex({ discussionId: 1, createdAt: 1 });
};

export const getUsersCollection = (): Promise<Collection<UserDocument>> => {
  return getDb().then((db) => db.collection<UserDocument>('users'));
};

export const getTeamsCollection = (): Promise<Collection<TeamDocument>> => {
  return getDb().then((db) => db.collection<TeamDocument>('teams'));
};

export const getDiscussionsCollection =
  (): Promise<Collection<DiscussionDocument>> => {
    return getDb().then((db) =>
      db.collection<DiscussionDocument>('discussions'),
    );
  };

export const getCommentsCollection = (): Promise<Collection<CommentDocument>> => {
  return getDb().then((db) => db.collection<CommentDocument>('comments'));
};

export const findUserById = async (
  id: string,
): Promise<UserDocument | null> => {
  const users = await getUsersCollection();
  return users.findOne({ _id: id });
};

export const findUserByEmail = async (
  email: string,
): Promise<UserDocument | null> => {
  const users = await getUsersCollection();
  return users.findOne({ email });
};

export const closeDb = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};
