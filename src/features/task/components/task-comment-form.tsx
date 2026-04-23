"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TaskCommentForm({ taskId }: { taskId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded border p-3"
        rows={3}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Add Comment"}
        </button>

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      </div>
    </form>
  );
}