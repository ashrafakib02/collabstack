import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AcceptInvitationButton from "@/features/workspace/components/accept-invitation-button";

export default async function InvitationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invitations, error } = await supabase
    .from("invitations")
    .select(`
      id,
      email,
      role,
      status,
      created_at,
      workspaces (
        id,
        name,
        slug
      )
    `)
    .eq("email", user.email?.toLowerCase())
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Invitations page error:", error.message);
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Your Invitations</h1>

        {!invitations || invitations.length === 0 ? (
          <p className="text-sm text-gray-600">No pending invitations.</p>
        ) : (
          <div className="space-y-4">
            {invitations.map((invite) => {
              const workspace = Array.isArray(invite.workspaces)
                ? invite.workspaces[0]
                : invite.workspaces;

              return (
                <div key={invite.id} className="rounded-lg border p-4 shadow-sm">
                  <h2 className="text-lg font-semibold">
                    {workspace?.name || "Workspace"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Role: {invite.role}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Email: {invite.email}
                  </p>

                  <div className="mt-4">
                    <AcceptInvitationButton invitationId={invite.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}