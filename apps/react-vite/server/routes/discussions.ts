import { Router } from 'express';
import { nanoid } from 'nanoid';

import { requireAdmin, requireAuthUser } from '../auth';
import { findUserById, getDiscussionsCollection } from '../db';
import {
  serializeDiscussionRead,
  serializeDiscussionWrite,
} from '../serialize';
import type { DiscussionDocument } from '../types';

type DiscussionBody = {
  title: string;
  body: string;
};

const PAGE_SIZE = 10;

export const discussionsRouter = Router();

discussionsRouter.get('/discussions', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    const page = Number(req.query.page || 1);
    const discussions = await getDiscussionsCollection();
    const filter = { teamId: user.teamId };
    const total = await discussions.countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const result = await discussions
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .toArray();

    res.json({
      data: result.map(serializeDiscussionRead),
      meta: {
        page,
        total,
        totalPages,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.get('/discussions/:discussionId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    const discussions = await getDiscussionsCollection();
    const discussion = await discussions.findOne({
      _id: req.params.discussionId,
      teamId: user.teamId,
    });

    if (!discussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json({ data: serializeDiscussionRead(discussion) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.post('/discussions', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user);

    const data = req.body as DiscussionBody;
    const discussions = await getDiscussionsCollection();
    const discussionDocument: DiscussionDocument = {
      _id: nanoid(),
      title: data.title,
      body: data.body,
      teamId: user.teamId,
      author: user,
      createdAt: Date.now(),
    };

    await discussions.insertOne(discussionDocument);
    res.json(serializeDiscussionWrite(discussionDocument));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.patch('/discussions/:discussionId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user);

    const data = req.body as DiscussionBody;
    const discussions = await getDiscussionsCollection();
    const updatedDiscussion = await discussions.findOneAndUpdate(
      {
        _id: req.params.discussionId,
        teamId: user.teamId,
      },
      { $set: data },
      { returnDocument: 'after' },
    );

    if (!updatedDiscussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json(serializeDiscussionWrite(updatedDiscussion));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.delete('/discussions/:discussionId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user);

    const discussions = await getDiscussionsCollection();
    const deletedDiscussion = await discussions.findOneAndDelete({
      _id: req.params.discussionId,
    });

    if (!deletedDiscussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json(serializeDiscussionWrite(deletedDiscussion));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
