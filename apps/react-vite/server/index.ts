import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import logger from 'pino-http';

import { bootstrapDatabase } from './db';
import { env } from './env';
import { authRouter } from './routes/auth';
import { commentsRouter } from './routes/comments';
import { discussionsRouter } from './routes/discussions';
import { healthRouter } from './routes/health';
import { teamsRouter } from './routes/teams';
import { usersRouter } from './routes/users';
import { seedDemoData } from './seed';

const app = express();

app.use(
  cors({
    origin: env.APP_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(logger());

app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', teamsRouter);
app.use('/api', usersRouter);
app.use('/api', discussionsRouter);
app.use('/api', commentsRouter);

const startServer = async (): Promise<void> => {
  await bootstrapDatabase();

  if (env.ENABLE_DEMO_SEEDING) {
    await seedDemoData();
  }

  app.listen(env.APP_MOCK_API_PORT, () => {
    process.stdout.write(
      `MongoDB API server started at http://localhost:${env.APP_MOCK_API_PORT}/api\n`,
    );
  });
};

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Failed to start server: ${message}\n`);
  process.exit(1);
});
