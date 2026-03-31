"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type TaskActionsProps = {
  taskId: string;
  currentStatus: string;
};

export default function TaskActions({
  taskId,
  currentStatus,
}: TaskActionsProps) {
  const supabase = createClient();
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setMessage("");
    setLoading(true);

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Status updated.");
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    setMessage("");
    setLoading(true);

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Task deleted.");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        className="rounded border p-2"
      >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Delete
      </button>

      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}