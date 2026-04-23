"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import { useRouter } from "next/navigation";

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
  return (
    <form
      onSubmit={handleCreateWorkspace}
      className="space-y-4 rounded-lg border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Create Workspace</h2>

      <input
        type="text"
        placeholder="Enter workspace name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border p-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Workspace"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
