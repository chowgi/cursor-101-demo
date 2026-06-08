import { render, screen } from '@testing-library/react';

import { DiscussionPriority } from '@/types/api';

import { DiscussionPriorityBadge } from '../discussion-priority-badge';

describe('DiscussionPriorityBadge', () => {
  it('renders low priority with label and accessible name', () => {
    render(<DiscussionPriorityBadge priority="LOW" />);

    expect(screen.getByLabelText('Priority: Low')).toHaveTextContent('Low');
  });

  it('renders medium priority with label and accessible name', () => {
    render(<DiscussionPriorityBadge priority="MEDIUM" />);

    expect(screen.getByLabelText('Priority: Medium')).toHaveTextContent(
      'Medium',
    );
  });

  it('renders high priority with label and accessible name', () => {
    render(<DiscussionPriorityBadge priority="HIGH" />);

    expect(screen.getByLabelText('Priority: High')).toHaveTextContent('High');
  });

  it('defaults to medium when priority is missing', () => {
    render(<DiscussionPriorityBadge />);

    expect(screen.getByLabelText('Priority: Medium')).toHaveTextContent(
      'Medium',
    );
  });

  it('defaults to medium when priority is an empty string', () => {
    render(<DiscussionPriorityBadge priority={'' as DiscussionPriority} />);

    expect(screen.getByLabelText('Priority: Medium')).toHaveTextContent(
      'Medium',
    );
  });
});
