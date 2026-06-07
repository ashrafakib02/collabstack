import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MailOpen, Inbox, Shield, AtSign } from "lucide-react";
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
    <main className="min-h-screen bg-muted/40 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MailOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Your Invitations
              </h1>
              <p className="text-sm text-muted-foreground">
                Pending workspace invitations waiting for your response.
              </p>
            </div>
          </div>
        </div>

        {!invitations || invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              No pending invitations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invite) => {
              const workspace = Array.isArray(invite.workspaces)
                ? invite.workspaces[0]
                : invite.workspaces;

              return (
                <div
                  key={invite.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-card-foreground">
                    {workspace?.name || "Workspace"}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-primary" />
                      Role: <span className="font-medium text-foreground">{invite.role}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <AtSign className="h-4 w-4 text-primary" />
                      {invite.email}
                    </span>
                  </div>

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
