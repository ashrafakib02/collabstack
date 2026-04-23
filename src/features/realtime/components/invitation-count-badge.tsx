"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InvitationCountBadge({
  email,
  initialCount,
}: {
  email: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();

    const loadCount = async () => {
      const { count, error } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("email", email.toLowerCase())
        .eq("status", "pending");

      if (!error) {
        setCount(count ?? 0);
      }
    };

    const channel = supabase
      .channel(`invitation-count-${email.toLowerCase()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitations",
        },
        async () => {
          await loadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [email]);

  return (
    <Link
      href="/dashboard/invitations"
      className="relative rounded border px-4 py-2 text-sm hover:bg-gray-100"
    >
      Invitations

      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}