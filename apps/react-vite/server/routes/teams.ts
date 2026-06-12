import { Router } from 'express';

import { getTeamsCollection } from '../db';

export const teamsRouter = Router();

teamsRouter.get('/teams', async (_req, res) => {
  try {
    const teams = await getTeamsCollection();
    const result = await teams.find().toArray();

    res.json({
      data: result.map(({ _id, ...fields }) => ({ id: _id, ...fields })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
