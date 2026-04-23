import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateProjectForm from "@/features/project/components/create-project-form";
import Link from "next/link";
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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <Link href="/dashboard" className="text-sm text-blue-600 underline">
            Back to Dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {workspace.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Workspace slug: {workspace.slug}
          </p>
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
          <h2 className="text-2xl font-semibold">Projects</h2>

          {!projects || projects.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
              No project created yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border p-4 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">
                    <Link
                      href={`/dashboard/workspaces/${workspace.slug}/projects/${project.id}`}
                    >
                      {project.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {project.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
        <InviteMemberForm workspaceId={workspace.id} />
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Workspace Members</h2>

          {!members || members.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
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
                    className="rounded-lg border p-4 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold">
                      {profile?.name || "Unnamed User"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {profile?.email || "No email"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Role: {member.role}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Invitations</h2>

          {!invitations || invitations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
              No invitations yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-lg border p-4 shadow-sm"
                >
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Role: {invite.role}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Status: {invite.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
