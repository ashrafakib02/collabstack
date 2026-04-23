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
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

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

      setOnlineUsers(uniqueUsers);
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
    <section className="space-y-4 rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Online Now</h2>
        <span className="rounded-full border px-3 py-1 text-sm">
          {onlineUsers.length} online
        </span>
      </div>

      {onlineUsers.length === 0 ? (
        <p className="text-sm text-gray-600">No one online right now.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <p className="font-medium">
                {onlineUser.name || onlineUser.email || "Unknown User"}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {onlineUser.email || "No email"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
