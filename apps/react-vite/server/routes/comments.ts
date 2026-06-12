import { Router } from 'express';
import { nanoid } from 'nanoid';

import { requireAuthUser } from '../auth';
import { findUserById, getCommentsCollection } from '../db';
import { serializeCommentRead, serializeCommentWrite } from '../serialize';
import type { CommentDocument } from '../types';

type CreateCommentBody = {
  body: string;
  discussionId: string;
};

const PAGE_SIZE = 10;

export const commentsRouter = Router();

commentsRouter.get('/comments', async (req, res) => {
  try {
    const { error } = await requireAuthUser(req, findUserById);

    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const discussionId = String(req.query.discussionId || '');
    const page = Number(req.query.page || 1);
    const comments = await getCommentsCollection();
    const filter = { discussionId };
    const total = await comments.countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const result = await comments
      .find(filter)
      .sort({ createdAt: 1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .toArray();

    res.json({
      data: result.map(serializeCommentRead),
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

commentsRouter.post('/comments', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    const data = req.body as CreateCommentBody;
    const comments = await getCommentsCollection();
    const commentDocument: CommentDocument = {
      _id: nanoid(),
      body: data.body,
      discussionId: data.discussionId,
      author: user,
      createdAt: Date.now(),
    };

    await comments.insertOne(commentDocument);
    res.json(serializeCommentWrite(commentDocument));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

commentsRouter.delete('/comments/:commentId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req, findUserById);

    if (error || !user) {
      res.status(401).json({ message: error });
      return;
    }

    const comments = await getCommentsCollection();
    const filter =
      user.role === 'USER'
        ? { _id: req.params.commentId, 'author.id': user.id }
        : { _id: req.params.commentId };

    const deletedComment = await comments.findOneAndDelete(filter);

    if (!deletedComment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.json(serializeCommentWrite(deletedComment));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
