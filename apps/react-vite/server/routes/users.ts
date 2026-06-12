import { Router } from 'express';

import {
  requireAdmin,
  requireAuthUser,
  serializeUser,
  toAuthorSnapshot,
} from '../auth';
import {
  findUserById,
  getCommentsCollection,
  getDiscussionsCollection,
  getUsersCollection,
} from '../db';
import { serializeUsers } from '../serialize';

type ProfileBody = {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
};

export const usersRouter = Router();

usersRouter.get('/users', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    const users = await getUsersCollection();
    const result = await users.find({ teamId: user.teamId }).toArray();

    res.json({ data: serializeUsers(result) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

usersRouter.patch('/users/profile', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    const data = req.body as ProfileBody;
    const users = await getUsersCollection();
    const updatedUser = await users.findOneAndUpdate(
      { _id: user.id },
      { $set: data },
      { returnDocument: 'after' },
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const authorSnapshot = toAuthorSnapshot(updatedUser);
    const discussions = await getDiscussionsCollection();
    const comments = await getCommentsCollection();

    await discussions.updateMany(
      { 'author.id': user.id },
      { $set: { author: authorSnapshot } },
    );

    await comments.updateMany(
      { 'author.id': user.id },
      { $set: { author: authorSnapshot } },
    );

    res.json(serializeUser(updatedUser));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

usersRouter.delete('/users/:userId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user);

    const users = await getUsersCollection();
    const deletedUser = await users.findOneAndDelete({
      _id: req.params.userId,
      teamId: user.teamId,
    });

    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { _id, ...fields } = deletedUser;
    res.json({ id: _id, ...fields });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
