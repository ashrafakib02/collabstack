import TaskActions from "@/features/task/components/task-actions";
import TaskComments from "@/features/task/components/task-comments";
import TaskAttachments from "@/features/task/components/task-attachments";
import type { TaskComment, TaskAttachment } from "@/features/task/types";

type TaskBoardProps = {
  tasks: Task[];
  commentsByTask: Record<string, TaskComment[]>;
  attachmentsByTask: Record<string, TaskAttachment[]>;
};
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
};

const columns = [
  { key: "todo", title: "Todo" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function TaskBoard({
  tasks,
  commentsByTask,
  attachmentsByTask,
}: TaskBoardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);

        return (
          <div key={column.key} className="rounded-xl border bg-gray-100 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{column.title}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-xs border">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-4">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
                  No Task yet.
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-base font-semibold leading-6">
                        {task.title}
                      </h4>
                      <span className="rounded-full border px-2 py-1 text-xs capitalize">
                        {task.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {task.description || "No description"}
                    </p>

                    <TaskActions taskId={task.id} currentStatus={task.status} />
                    <TaskAttachments
                      taskId={task.id}
                      initialAttachments={attachmentsByTask[task.id] ?? []}
                    />
                    <TaskComments
                      taskId={task.id}
                      initialComments={commentsByTask[task.id] ?? []}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
