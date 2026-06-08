import { DiscussionPriority } from '@/types/api';

export const DISCUSSION_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const DEFAULT_DISCUSSION_PRIORITY: DiscussionPriority = 'MEDIUM';

export const DISCUSSION_PRIORITY_OPTIONS = DISCUSSION_PRIORITIES.map(
  (priority) => ({
    label: priority,
    value: priority,
  }),
);
