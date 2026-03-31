import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/shared/logout-button";
import CreateWorkspaceForm from "@/features/workspace/components/create-workspace-form";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspaces, error } = await supabase
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
    `
    )
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Welcome, {user.email}</p>
          </div>

          <LogoutButton />
        </div>

        <CreateWorkspaceForm userId={user.id} />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Workspaces</h2>

          {!workspaces || workspaces.length === 0 ? (
            <p className="text-sm text-gray-600">No workspace created yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {workspaces.map((item, index) => {
                const workspace = Array.isArray(item.workspaces)
                  ? item.workspaces[0]
                  : item.workspaces;

                if (!workspace) return null;

                return (
                  <div
                    key={workspace.id ?? index}
                    className="rounded-lg border p-4 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold">{workspace.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Slug: {workspace.slug}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Role: {item.role}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}