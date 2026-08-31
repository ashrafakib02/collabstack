"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RealtimeTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
};

type TaskRealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: RealtimeTask;
  old: Partial<RealtimeTask>;
};

type TaskRealtimeListenerProps = {
  projectId: string;
};

export default function TaskRealtimeListener({
  projectId,
}: TaskRealtimeListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const notifyBoard = (payload: TaskRealtimePayload) => {
      window.dispatchEvent(new CustomEvent("task-realtime-update", { detail: payload }));
      router.refresh();
    };

    const channel = supabase
      .channel(`tasks-project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          notifyBoard({
            eventType: "INSERT",
            new: payload.new as RealtimeTask,
            old: payload.old as Partial<RealtimeTask>,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          notifyBoard({
            eventType: "UPDATE",
            new: payload.new as RealtimeTask,
            old: payload.old as Partial<RealtimeTask>,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          notifyBoard({
            eventType: "DELETE",
            new: payload.new as RealtimeTask,
            old: payload.old as Partial<RealtimeTask>,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, router]);

  return null;
}
