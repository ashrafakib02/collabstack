"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type CreateProjectFormProps = {
  workspaceId: string;
};

export default function CreateProjectForm({
  workspaceId,
}: CreateProjectFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Project name is required.");
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

    const { error } = await supabase.from("projects").insert({
      workspace_id: workspaceId,
      name,
      description,
      created_by: user.id,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setName("");
    setDescription("");
    setMessage("Project created successfully.");
    setLoading(false);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleCreateProject}
      className="space-y-4 rounded-lg border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Create Project</h2>

      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border p-3"
      />

      <textarea
        placeholder="Project description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border p-3"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Project"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}