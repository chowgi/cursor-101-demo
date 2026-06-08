import { ArrowDown, ArrowUp, Minus, LucideIcon } from 'lucide-react';

import { DiscussionPriority } from '@/types/api';
import { cn } from '@/utils/cn';

interface DiscussionPriorityBadgeProps {
  priority?: DiscussionPriority;
}

const PRIORITY_CONFIG: Record<
  DiscussionPriority,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  LOW: {
    label: 'Low',
    icon: ArrowDown,
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  MEDIUM: {
    label: 'Medium',
    icon: Minus,
    className: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  HIGH: {
    label: 'High',
    icon: ArrowUp,
    className: 'bg-rose-100 text-rose-800 ring-rose-200',
  },
};

export const DiscussionPriorityBadge = ({
  priority,
}: DiscussionPriorityBadgeProps) => {
  const resolvedPriority = priority ?? 'MEDIUM';
  const config = PRIORITY_CONFIG[resolvedPriority];
  const Icon = config.icon;

  return (
    <span
      aria-label={`Priority: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {config.label}
    </span>
  );
};
