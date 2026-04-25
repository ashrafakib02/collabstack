"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { createClient } from "@/lib/supabase/client";
import TaskActions from "@/features/task/components/task-actions";
import TaskComments from "@/features/task/components/task-comments";
import TaskAttachments from "@/features/task/components/task-attachments";
import type { TaskComment, TaskAttachment } from "@/features/task/types";
import {GripHorizontal } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
};

type TaskBoardProps = {
  tasks: Task[];
  commentsByTask: Record<string, TaskComment[]>;
  attachmentsByTask: Record<string, TaskAttachment[]>;
};

const columns = [
  { key: "todo", title: "Todo" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="rounded-xl border bg-gray-100 p-4">
      {children}
    </div>
  );
}

function DraggableTaskCard({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* 🔥 Drag Handle */}
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="absolute left-1/2 -translate-x-1/2 top-2 cursor-grab p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripHorizontal size={20} />
      </button>

      {children}
    </div>
  );
}

export default function TaskBoard({
  tasks,
  commentsByTask,
  attachmentsByTask,
}: TaskBoardProps) {
  const supabase = createClient();
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = String(active.id);
    const newStatus = String(over.id);

    if (!["todo", "in_progress", "done"].includes(newStatus)) return;

    const currentTask = localTasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === newStatus) return;

    setLocalTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      setLocalTasks(tasks);
      console.error(error.message);
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = localTasks.filter(
            (task) => task.status === column.key,
          );

          return (
            <DroppableColumn key={column.key} id={column.key}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <span className="rounded-full border bg-white px-2 py-1 text-xs">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-4">
                {columnTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
                    No task yet.
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <DraggableTaskCard key={task.id} task={task}>
                      <div className="flex items-start justify-between mt-4 gap-4">
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

                      <TaskActions
                        taskId={task.id}
                        currentStatus={task.status}
                      />

                      <TaskAttachments
                        taskId={task.id}
                        initialAttachments={attachmentsByTask[task.id] ?? []}
                      />

                      <TaskComments
                        taskId={task.id}
                        initialComments={commentsByTask[task.id] ?? []}
                      />
                    </DraggableTaskCard>
                  ))
                )}
              </div>
            </DroppableColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
