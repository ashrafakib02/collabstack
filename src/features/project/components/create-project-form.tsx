"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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

  const isSuccess = message === "Project created successfully.";

  return (
    <form
      onSubmit={handleCreateProject}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <FolderPlus className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">
          Create Project
        </h2>
      </div>

      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
      />

      <textarea
        placeholder="Project description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FolderPlus className="h-4 w-4" />
        )}
        {loading ? "Creating..." : "Create Project"}
      </button>

      {message ? (
        <p
          className={`flex items-center gap-1.5 text-sm ${
            isSuccess ? "text-primary" : "text-destructive"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </p>
      ) : null}
    </form>
  );
}
