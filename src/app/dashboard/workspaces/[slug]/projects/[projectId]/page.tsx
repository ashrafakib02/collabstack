import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateTaskForm from "@/features/task/components/create-task-form";
import TaskActions from "@/features/task/components/task-actions";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug, projectId } = await params;
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

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, workspace_id")
    .eq("id", projectId)
    .eq("workspace_id", workspace.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, description, status, priority, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  if (tasksError) {
    console.error("Tasks list error:", tasksError.message);
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <Link
            href={`/dashboard/workspaces/${workspace.slug}`}
            className="text-sm text-blue-600 underline"
          >
            Back to Workspace
          </Link>

          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-600">
            {project.description || "No description"}
          </p>
        </div>

        <CreateTaskForm projectId={project.id} />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tasks</h2>

          {!tasks || tasks.length === 0 ? (
            <p className="text-sm text-gray-600">No task created yet.</p>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <span className="rounded border px-2 py-1 text-xs">
                      {task.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {task.description || "No description"}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Priority: {task.priority}
                  </p>

                  <TaskActions taskId={task.id} currentStatus={task.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
