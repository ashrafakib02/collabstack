import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateProjectForm from "@/features/project/components/create-project-form";
import Link from "next/link";

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

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <Link href="/dashboard" className="text-sm text-blue-600 underline">
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <p className="text-sm text-gray-600">
            Workspace slug: {workspace.slug}
          </p>
        </div>

        <CreateProjectForm workspaceId={workspace.id} />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Projects</h2>

          {!projects || projects.length === 0 ? (
            <p className="text-sm text-gray-600">No project created yet.</p>
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
      </div>
    </main>
  );
}
