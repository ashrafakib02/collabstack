"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AcceptInvitationButton({
  invitationId,
}: {
  invitationId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.rpc("accept_workspace_invitation", {
      p_invitation_id: invitationId,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Invitation accepted.");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Accepting..." : "Accept Invitation"}
      </button>

      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}