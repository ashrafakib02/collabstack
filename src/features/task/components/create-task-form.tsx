"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type CreateTaskFormProps = {
  projectId: string;
};

export default function CreateTaskForm({ projectId }: CreateTaskFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

 const handleCreateTask = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");

  if (!title.trim()) {
    setMessage("Task title is required.");
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

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    setMessage("Project not found.");
    setLoading(false);
    return;
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title,
      description,
      status,
      priority,
      created_by: user.id,
    })
    .select("id, title")
    .single();

  if (error || !task) {
    setMessage(error?.message || "Failed to create task.");
    setLoading(false);
    return;
  }

  await supabase.from("activity_logs").insert({
    workspace_id: project.workspace_id,
    project_id: project.id,
    task_id: task.id,
    user_id: user.id,
    action: "task_created",
    details: `Created task "${task.title}"`,
  });

  setTitle("");
  setDescription("");
  setStatus("todo");
  setPriority("medium");
  setMessage("Task created successfully.");
  setLoading(false);
  router.refresh();
};

  return (
    <form
      onSubmit={handleCreateTask}
      className="space-y-4 rounded-lg border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Create Task</h2>

      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border p-3"
      />

      <textarea
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border p-3"
        rows={4}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded border p-3"
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded border p-3"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Task"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}