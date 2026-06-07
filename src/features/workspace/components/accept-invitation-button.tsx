"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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

  const isSuccess = message === "Invitation accepted.";

  return (
    <div className="space-y-2">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {loading ? "Accepting..." : "Accept Invitation"}
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
    </div>
  );
}
