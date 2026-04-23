"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import TaskAttachmentUpload from "@/features/task/components/task-attachment-upload";

type Attachment = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};
function formatFileName(fileName: string) {
  const extIndex = fileName.lastIndexOf(".");
  const name = extIndex !== -1 ? fileName.slice(0, extIndex) : fileName;
  const ext = extIndex !== -1 ? fileName.slice(extIndex) : "";

  if (name.length <= 12) return fileName;

  const start = name.slice(0, 4);
  const end = name.slice(-3);

  return `${start}...${end}${ext}`;
}
export default function TaskAttachments({
  taskId,
  initialAttachments,
}: {
  taskId: string;
  initialAttachments: Attachment[];
}) {
  const supabase = createClient();
  const [attachments, setAttachments] = useState(initialAttachments);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const handleOpenFile = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from("task-files")
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold">Attachments</h4>

      <div className="mt-3 space-y-3">
        {attachments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
            No attachments yet.
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded border bg-gray-50 p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {formatFileName(attachment.file_name)}
                </p>
                <p className="text-xs text-gray-500">
                  {attachment.mime_type || "Unknown type"}
                </p>
              </div>

              <button
                onClick={() => handleOpenFile(attachment.file_path)}
                className="rounded border px-3 py-1 text-xs"
              >
                Open
              </button>
            </div>
          ))
        )}
      </div>

      <TaskAttachmentUpload taskId={taskId} />
    </div>
  );
}
