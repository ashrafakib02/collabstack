"use client";

import TaskCommentForm from "@/features/task/components/task-comment-form";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profiles:
    | {
        id: string;
        name: string | null;
        email: string | null;
      }
    | {
        id: string;
        name: string | null;
        email: string | null;
      }[]
    | null;
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
    const { data, error } = await supabase
      .from("task_comments")
      .select(
        `
        id,
        content,
        created_at,
        profiles (
          id,
          name,
          email
        )
        `
      )
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
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
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const profile = Array.isArray(comment.profiles)
              ? comment.profiles[0]
              : comment.profiles;

            return (
              <div key={comment.id} className="rounded border bg-gray-50 p-3">
                <p className="text-sm font-medium">
                  {profile?.name || profile?.email || "Unknown User"}
                </p>
                <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
              </div>
            );
          })
        )}
      </div>

      <TaskCommentForm taskId={taskId} />
    </div>
  );
}