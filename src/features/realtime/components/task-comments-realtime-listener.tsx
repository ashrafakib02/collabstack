"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TaskCommentsRealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("task-comments-table-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_comments",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log("task_comments subscription:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}