"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import { useRouter } from "next/navigation";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateWorkspaceForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const handleCreateWorkspace = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");

  if (!name.trim()) {
    setMessage("Workspace name is required.");
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("SESSION:", session);
  console.log("USER:", user);
  console.log("USER ERROR:", userError);

  if (!session || !user) {
    setMessage("No active Supabase session found. Please log in again.");
    return;
  }

  setLoading(true);

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now()}`;

  const { error } = await supabase.rpc("create_workspace", {
    p_name: name,
    p_slug: slug,
  });

  if (error) {
    setMessage(error.message);
    setLoading(false);
    return;
  }

  setName("");
  setMessage("Workspace created successfully.");
  setLoading(false);
  router.refresh();
};
  const isSuccess = message === "Workspace created successfully.";

  return (
    <form
      onSubmit={handleCreateWorkspace}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Plus className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">
          Create Workspace
        </h2>
      </div>

      <input
        type="text"
        placeholder="Enter workspace name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {loading ? "Creating..." : "Create Workspace"}
      </button>

      {message ? (
        <p
          className={`flex items-center gap-2 text-sm ${
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
