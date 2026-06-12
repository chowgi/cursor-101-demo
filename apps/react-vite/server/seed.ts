import {
  DEMO_PASSWORD,
  DEMO_TEAM_ID,
  demoComments,
  demoDiscussions,
  demoTeam,
  demoUsers,
} from '../src/testing/mocks/seed-data';

import { hash, toAuthorSnapshot } from './auth';
import {
  getCommentsCollection,
  getDiscussionsCollection,
  getTeamsCollection,
  getUsersCollection,
} from './db';
import type { AuthorSnapshot, UserDocument } from './types';

const buildAuthorSnapshots = (
  users: UserDocument[],
): Map<string, AuthorSnapshot> => {
  return new Map(users.map((user) => [user._id, toAuthorSnapshot(user)]));
};

export const isDemoSeedPresent = async (): Promise<boolean> => {
  const teams = await getTeamsCollection();
  const existingTeam = await teams.findOne({ _id: DEMO_TEAM_ID });
  return existingTeam !== null;
};

export const seedDemoData = async (): Promise<void> => {
  if (await isDemoSeedPresent()) {
    return;
  }

  const hashedPassword = hash(DEMO_PASSWORD);
  const teams = await getTeamsCollection();
  const users = await getUsersCollection();
  const discussions = await getDiscussionsCollection();
  const comments = await getCommentsCollection();

  await teams.updateOne(
    { _id: demoTeam.id },
    { $set: { ...demoTeam, _id: demoTeam.id } },
    { upsert: true },
  );

  const userDocuments: UserDocument[] = demoUsers.map((user) => ({
    _id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    bio: user.bio,
    createdAt: user.createdAt,
    password: hashedPassword,
  }));

  for (const user of userDocuments) {
    await users.updateOne({ _id: user._id }, { $set: user }, { upsert: true });
  }

  const authorSnapshots = buildAuthorSnapshots(userDocuments);

  for (const discussion of demoDiscussions) {
    const author = authorSnapshots.get(discussion.authorId);

    if (!author) {
      continue;
    }

    await discussions.updateOne(
      { _id: discussion.id },
      {
        $set: {
          _id: discussion.id,
          title: discussion.title,
          body: discussion.body,
          teamId: discussion.teamId,
          author,
          createdAt: discussion.createdAt,
        },
      },
      { upsert: true },
    );
  }

  for (const comment of demoComments) {
    const author = authorSnapshots.get(comment.authorId);

    if (!author) {
      continue;
    }

    await comments.updateOne(
      { _id: comment.id },
      {
        $set: {
          _id: comment.id,
          body: comment.body,
          discussionId: comment.discussionId,
          author,
          createdAt: comment.createdAt,
        },
      },
      { upsert: true },
    );
  }
};
