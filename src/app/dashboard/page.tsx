import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/shared/logout-button";
import CreateWorkspaceForm from "@/features/workspace/components/create-workspace-form";
import InvitationCountBadge from "@/features/realtime/components/invitation-count-badge";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count: invitationCount } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("email", user.email?.toLowerCase())
    .eq("status", "pending");

  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select(
      `
      role,
      workspaces (
        id,
        name,
        slug,
        created_at
      )
      `,
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("Workspace list error:", error.message);
  }
  console.log("invitationCount:", invitationCount);
  const workspaceList =
    memberships
      ?.map((item) => ({
        role: item.role,
        workspace: Array.isArray(item.workspaces)
          ? item.workspaces[0]
          : item.workspaces,
      }))
      .filter((item) => item.workspace) ?? [];
  const workspaceIds =
    workspaceList?.map((item) => item.workspace?.id).filter(Boolean) ?? [];

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .in(
      "workspace_id",
      workspaceIds.length > 0
        ? workspaceIds
        : ["00000000-0000-0000-0000-000000000000"],
    );

  if (projectsError) {
    console.error("Dashboard projects error:", projectsError.message);
  }
  const projectIds = projects?.map((project) => project.id) ?? [];

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, status, project_id")
    .in(
      "project_id",
      projectIds.length > 0
        ? projectIds
        : ["00000000-0000-0000-0000-000000000000"],
    );

  if (tasksError) {
    console.error("Dashboard tasks error:", tasksError.message);
  }
  const { data: recentActivity, error: activityError } = await supabase
    .from("activity_logs")
    .select("id, action, details, created_at")
    .in(
      "workspace_id",
      workspaceIds.length > 0
        ? workspaceIds
        : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (activityError) {
    console.error("Dashboard activity error:", activityError.message);
  }

  const totalWorkspaces = workspaceList.length;
  const totalProjects = projects?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  const todoTasks = tasks?.filter((task) => task.status === "todo").length ?? 0;

  const inProgressTasks =
    tasks?.filter((task) => task.status === "in_progress").length ?? 0;

  const doneTasks = tasks?.filter((task) => task.status === "done").length ?? 0;
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Welcome, {user.email}</p>
          </div>
          <InvitationCountBadge
            email={user.email ?? ""}
            initialCount={invitationCount ?? 0}
          />
          <LogoutButton />
        </div>
        
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">Workspaces</p>
            <h2 className="mt-2 text-3xl font-bold">{totalWorkspaces}</h2>
          </div>

          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">Projects</p>
            <h2 className="mt-2 text-3xl font-bold">{totalProjects}</h2>
          </div>

          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">Tasks</p>
            <h2 className="mt-2 text-3xl font-bold">{totalTasks}</h2>
          </div>

          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">Completed Tasks</p>
            <h2 className="mt-2 text-3xl font-bold">{doneTasks}</h2>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">Todo</p>
            <h3 className="mt-2 text-2xl font-semibold">{todoTasks}</h3>
          </div>

          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">In Progress</p>
            <h3 className="mt-2 text-2xl font-semibold">{inProgressTasks}</h3>
          </div>

          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-600">Done</p>
            <h3 className="mt-2 text-2xl font-semibold">{doneTasks}</h3>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>

          {!recentActivity || recentActivity.length === 0 ? (
            <p className="text-sm text-gray-600">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border p-4 shadow-sm">
                  <p className="text-sm font-medium">{item.details}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.action}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <CreateWorkspaceForm userId={user.id} />
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Workspaces</h2>

          {workspaceList.length === 0 ? (
            <p className="text-sm text-gray-600">No workspace created yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {workspaceList.map((item) => (
                <div
                  key={item.workspace!.id}
                  className="rounded-lg border p-4 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">
                    <Link
                      href={`/dashboard/workspaces/${item.workspace!.slug}`}
                    >
                      {item.workspace!.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Slug: {item.workspace!.slug}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Role: {item.role}
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
