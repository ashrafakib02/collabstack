"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

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
    title="Invitations"
    className="relative flex items-center justify-center rounded-lg border p-2 hover:bg-gray-100 transition"
  >
    <Bell className="h-5 w-5" />

    {count > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
        {count > 9 ? "9+" : count}
      </span>
    )}
  </Link>
);
}