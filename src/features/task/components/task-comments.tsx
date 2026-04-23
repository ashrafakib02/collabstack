"use client";

import TaskCommentForm from "@/features/task/components/task-comment-form";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
};

export default function TaskComments({
  taskId,
  initialComments,
}: {
  taskId: string;
  initialComments: Comment[];
}) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const loadComments = async () => {
    const { data, error } = await supabase.rpc("get_task_comments_with_authors", {
      p_task_id: taskId,
    });

    if (!error && data) {
      setComments(data as Comment[]);
    }
  };

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    const channel = supabase
      .channel(`task-comments-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_comments",
          filter: `task_id=eq.${taskId}`,
        },
        async () => {
          await loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold">Comments</h4>

      <div className="mt-3 space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
            No comments yet.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded border bg-gray-50 p-3">
              <p className="text-sm font-medium">
                {comment.author_name || comment.author_email || "Unknown User"}
              </p>
              <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <TaskCommentForm taskId={taskId} />
    </div>
  );
}