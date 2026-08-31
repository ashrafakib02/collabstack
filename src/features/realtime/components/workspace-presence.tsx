"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type WorkspacePresenceProps = {
  workspaceId: string;
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
};

type PresenceUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  onlineAt: string;
};

export default function WorkspacePresence({
  workspaceId,
  user,
}: WorkspacePresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([
    {
      id: user.id,
      email: user.email,
      name: user.name,
      onlineAt: new Date().toISOString(),
    },
  ]);

  const channelName = useMemo(
    () => `workspace-presence-${workspaceId}`,
    [workspaceId],
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel(channelName, {
      config: {
        private: true,
        presence: {
          key: user.id,
        },
      },
    });

    const syncPresenceState = () => {
      const state = channel.presenceState<PresenceUser>();

      const users = Object.values(state)
        .flat()
        .map((item) => ({
          id: item.id,
          email: item.email,
          name: item.name,
          onlineAt: item.onlineAt,
        }));

      const uniqueUsers = Array.from(
        new Map(users.map((item) => [item.id, item])).values(),
      );

      setOnlineUsers(
        uniqueUsers.some((item) => item.id === user.id)
          ? uniqueUsers
          : [
              {
                id: user.id,
                email: user.email,
                name: user.name,
                onlineAt: new Date().toISOString(),
              },
              ...uniqueUsers,
            ],
      );
    };

    channel
      .on("presence", { event: "sync" }, () => {
        syncPresenceState();
      })
      .on("presence", { event: "join" }, () => {
        syncPresenceState();
      })
      .on("presence", { event: "leave" }, () => {
        syncPresenceState();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            email: user.email,
            name: user.name,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, user.email, user.id, user.name]);

  return (
    <div
      className="group relative z-10 flex shrink-0"
      onClick={(event) => event.preventDefault()}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        aria-label={`${onlineUsers.length} ${onlineUsers.length === 1 ? "user" : "users"} online`}
        className="inline-flex min-w-[5.25rem] items-center justify-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        {onlineUsers.length} online
      </button>

      <div className="pointer-events-none invisible absolute right-0 top-full z-20 mt-2 w-64 translate-y-1 rounded-xl border border-border bg-card p-3 text-left opacity-0 shadow-lg transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
          <p className="text-sm font-semibold text-card-foreground">Online now</p>
          <span className="text-xs text-muted-foreground">{onlineUsers.length}</span>
        </div>
        {onlineUsers.length === 0 ? (
          <p className="py-3 text-xs text-muted-foreground">No one online right now.</p>
        ) : (
          <div className="grid gap-2 pt-2">
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center gap-2 rounded-lg px-1 py-1.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {(onlineUser.name || onlineUser.email || "U").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-card-foreground">
                    {onlineUser.name || onlineUser.email || "Unknown User"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {onlineUser.email || "No email"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
