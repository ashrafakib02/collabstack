import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateProjectForm from "@/features/project/components/create-project-form";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Users,
  MailCheck,
  Hash,
  Briefcase,
  Shield,
} from "lucide-react";
import InviteMemberForm from "@/features/workspace/components/invite-member-form";
import WorkspacePresence from "@/features/realtime/components/workspace-presence";

type WorkspacePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (workspaceError || !workspace) {
    notFound();
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error("Membership error:", membershipError.message);
  }

  if (!membership) {
    notFound();
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Projects list error:", projectsError.message);
  }
  const { data: members, error: membersError } = await supabase
    .from("workspace_members")
    .select(
      `
    id,
    role,
    profiles (
      id,
      name,
      email
    )
    `,
    )
    .eq("workspace_id", workspace.id);

  if (membersError) {
    console.error("Members error:", membersError.message);
  }

  const { data: invitations, error: invitationsError } = await supabase
    .from("invitations")
    .select("id, email, role, status, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (invitationsError) {
    console.error("Invitations error:", invitationsError.message);
  }

  return (
    <main className="min-h-screen bg-muted/40 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {workspace.name}
              </h1>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                {workspace.slug}
              </p>
            </div>
          </div>
        </div>

        <WorkspacePresence
          workspaceId={workspace.id}
          user={{
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name ?? null,
          }}
        />
        <CreateProjectForm workspaceId={workspace.id} />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <FolderKanban className="h-6 w-6 text-primary" />
            Projects
          </h2>

          {!projects || projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No project created yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/workspaces/${workspace.slug}/projects/${project.id}`}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {project.name}
                    </h3>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.description || "No description"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <InviteMemberForm workspaceId={workspace.id} />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Users className="h-6 w-6 text-primary" />
            Workspace Members
          </h2>

          {!members || members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No members found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {members.map((member) => {
                const profile = Array.isArray(member.profiles)
                  ? member.profiles[0]
                  : member.profiles;

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                      {(profile?.name || profile?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-card-foreground">
                        {profile?.name || "Unnamed User"}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {profile?.email || "No email"}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        {member.role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <MailCheck className="h-6 w-6 text-primary" />
            Pending Invitations
          </h2>

          {!invitations || invitations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No invitations yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {invite.email}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Role: {invite.role}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium capitalize text-accent-foreground">
                    {invite.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
