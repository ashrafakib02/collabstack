"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type InviteMemberFormProps = {
  workspaceId: string;
};

export default function InviteMemberForm({
  workspaceId,
}: InviteMemberFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Email is required.");
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

    const { error } = await supabase.from("invitations").insert({
      workspace_id: workspaceId,
      email: email.trim().toLowerCase(),
      role,
      invited_by: user.id,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setEmail("");
    setRole("member");
    setMessage("Invitation created successfully.");
    setLoading(false);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleInvite}
      className="space-y-4 rounded-lg border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Invite Member</h2>

      <input
        type="email"
        placeholder="Member email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border p-3"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded border p-3"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Inviting..." : "Invite Member"}
      </button>

      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}