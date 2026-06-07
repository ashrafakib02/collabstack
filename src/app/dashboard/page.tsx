import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  CheckCircle2,
  Briefcase,
  Circle,
  Loader2,
  Activity,
  ArrowRight,
  Boxes,
} from "lucide-react";
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

  const stats = [
    {
      label: "Workspaces",
      value: totalWorkspaces,
      icon: Briefcase,
    },
    {
      label: "Projects",
      value: totalProjects,
      icon: FolderKanban,
    },
    {
      label: "Tasks",
      value: totalTasks,
      icon: ListChecks,
    },
    {
      label: "Completed Tasks",
      value: doneTasks,
      icon: CheckCircle2,
    },
  ];

  const statusCards = [
    {
      label: "Todo",
      value: todoTasks,
      icon: Circle,
      iconClass: "text-muted-foreground",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Loader2,
      iconClass: "text-accent",
    },
    {
      label: "Done",
      value: doneTasks,
      icon: CheckCircle2,
      iconClass: "text-primary",
    },
  ];

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-card-foreground md:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your workspaces, projects, and team activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InvitationCountBadge
              email={user.email ?? ""}
              initialCount={invitationCount ?? 0}
            />
            <LogoutButton />
          </div>
        </div>

        {/* analytics cards section */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-card-foreground">
                  {stat.value}
                </h2>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* task status summary section */}
        <section className="grid gap-4 md:grid-cols-3">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <card.icon className={`h-5 w-5 ${card.iconClass}`} />
              </span>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-card-foreground">
                  {card.value}
                </h3>
              </div>
            </div>
          ))}
        </section>

        {/* recent activity section */}
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
              Recent Activity
            </h2>
          </div>

          {!recentActivity || recentActivity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No recent activity yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-4"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {item.details}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <CreateWorkspaceForm userId={user.id} />

        {/* workspaces section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
              Your Workspaces
            </h2>
          </div>

          {workspaceList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
              No workspace created yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {workspaceList.map((item) => (
                <Link
                  key={item.workspace!.id}
                  href={`/dashboard/workspaces/${item.workspace!.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {item.workspace!.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.workspace!.slug}
                      </p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                        {item.role}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
