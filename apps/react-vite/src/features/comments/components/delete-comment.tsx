import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';

import { useDeleteComment } from '../api/delete-comment';

type DeleteCommentProps = {
  id: string;
  discussionId: string;
};

export const DeleteComment = ({ id, discussionId }: DeleteCommentProps) => {
  const { addNotification } = useNotifications();
  const deleteCommentMutation = useDeleteComment({
    discussionId,
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Comment Deleted',
        });
      },
    },
  });

  return (
    <ConfirmationDialog
      isDone={deleteCommentMutation.isSuccess}
      icon="danger"
      title="Delete Comment"
      body="Are you sure you want to delete this comment?"
      triggerButton={
        <Button
          variant="ghost"
          size="sm"
          className="px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Delete Comment</span>
        </Button>
      }
      confirmButton={
        <Button
          isLoading={deleteCommentMutation.isPending}
          type="button"
          variant="destructive"
          onClick={() => deleteCommentMutation.mutate({ commentId: id })}
        >
          Delete Comment
        </Button>
      }
    />
  );
};
