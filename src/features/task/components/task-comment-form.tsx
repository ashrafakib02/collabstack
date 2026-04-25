"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";

export default function TaskCommentForm({ taskId }: { taskId: string }) {
  const supabase = createClient();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const currentUserIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`task-typing-${taskId}`);

    const setupUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      currentUserIdRef.current = user?.id ?? null;
    };

    setupUser();

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId === currentUserIdRef.current) return;

        setTypingUsers((prev) => {
          if (prev.includes(payload.name)) return prev;
          return [...prev, payload.name];
        });
      })
      .on("broadcast", { event: "stopped_typing" }, ({ payload }) => {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== payload.name)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, supabase]);

  const sendTypingEvent = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const channel = supabase.channel(`task-typing-${taskId}`);

    await channel.subscribe();

    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: user.id,
        name: user.user_metadata?.name || user.email || "Someone",
      },
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await channel.send({
        type: "broadcast",
        event: "stopped_typing",
        payload: {
          userId: user.id,
          name: user.user_metadata?.name || user.email || "Someone",
        },
      });
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!content.trim()) {
      setMessage("Comment cannot be empty.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You are not authenticated.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("task_comments").insert({
      task_id: taskId,
      user_id: user.id,
      content: content.trim(),
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setContent("");
    setMessage("Comment added.");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          sendTypingEvent();
        }}
        className="w-full rounded border p-3"
        rows={3}
      />

      {typingUsers.length > 0 && (
        <p className="text-xs text-gray-500">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Add Comment"}
        </button>

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      </div>
    </form>
  );
}