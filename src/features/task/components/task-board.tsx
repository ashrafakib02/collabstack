import TaskActions from "@/features/task/components/task-actions";
import TaskComments from "@/features/task/components/task-comments";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
};

type Comment = {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string | null;
  author_email: string | null;
};

type TaskBoardProps = {
  tasks: Task[];
  commentsByTask: Record<string, Comment[]>;
};

const columns = [
  { key: "todo", title: "Todo" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function TaskBoard({ tasks, commentsByTask }: TaskBoardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);

        return (
          <div key={column.key} className="rounded-lg border bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{column.title}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-xs border">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-4">
              {columnTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks</p>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-base font-semibold">{task.title}</h4>
                      <span className="rounded border px-2 py-1 text-xs">
                        {task.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      {task.description || "No description"}
                    </p>

                    <TaskActions taskId={task.id} currentStatus={task.status} />
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
