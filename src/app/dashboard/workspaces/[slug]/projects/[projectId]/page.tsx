import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateTaskForm from "@/features/task/components/create-task-form";
import TaskBoard from "@/features/task/components/task-board";
import TaskRealtimeListener from "@/features/realtime/components/task-realtime-listener";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
};
type CommentRow = {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
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
  const taskIds =
    tasks && tasks.length > 0
      ? tasks.map((task) => task.id)
      : ["00000000-0000-0000-0000-000000000000"];

  const rpcResult = await supabase.rpc("get_task_comments_with_authors", {
    p_task_ids: taskIds,
  });

  const commentsError = rpcResult.error;
  const commentsData = (rpcResult.data ?? []) as CommentRow[];

  const commentsByTask = commentsData.reduce<Record<string, CommentRow[]>>(
    (acc, comment) => {
      if (!acc[comment.task_id]) {
        acc[comment.task_id] = [];
      }
      acc[comment.task_id].push(comment);
      return acc;
    },
    {},
  );
  if (commentsError) {
    console.error("Comments list error:", commentsError.message);
  }

  const { data: activityLogs, error: activityError } = await supabase
    .from("activity_logs")
    .select("id, action, details, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (activityError) {
    console.error("Activity logs error:", activityError.message);
  }

  const { data: attachmentsData, error: attachmentsError } = await supabase
    .from("task_attachments")
    .select(
      "id, task_id, file_name, file_path, file_size, mime_type, created_at",
    )
    .in(
      "task_id",
      tasks && tasks.length > 0
        ? tasks.map((task) => task.id)
        : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("created_at", { ascending: true });

  if (attachmentsError) {
    console.error("Attachments list error:", attachmentsError.message);
  }
  const attachmentsByTask =
    attachmentsData?.reduce<Record<string, typeof attachmentsData>>(
      (acc, attachment) => {
        if (!acc[attachment.task_id]) {
          acc[attachment.task_id] = [];
        }
        acc[attachment.task_id].push(attachment);
        return acc;
      },
      {},
    ) ?? {};
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <TaskRealtimeListener projectId={project.id} />

      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <Link
            href={`/dashboard/workspaces/${workspace.slug}`}
            className="text-sm text-blue-600 underline"
          >
            Back to Workspace
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {project.description || "No description"}
          </p>
        </div>

        <CreateTaskForm projectId={project.id} />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Task Board</h2>

          {!tasks || tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
              No task created yet.
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              commentsByTask={commentsByTask}
              attachmentsByTask={attachmentsByTask}
            />
          )}
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>

          {!activityLogs || activityLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
              No recent activity yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="rounded-lg border p-4 shadow-sm">
                  <p className="text-sm font-medium">{log.details}</p>
                  <p className="mt-1 text-xs text-gray-500">{log.action}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
