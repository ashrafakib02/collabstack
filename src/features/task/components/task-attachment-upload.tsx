"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TaskAttachmentUpload({
  taskId,
}: {
  taskId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You are not authenticated.");
      return;
    }

    setLoading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${taskId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("task-files")
      .upload(filePath, file);

    if (uploadError) {
      setMessage(uploadError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("task_attachments").insert({
      task_id: taskId,
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
    });

    if (dbError) {
      setMessage(dbError.message);
      setLoading(false);
      return;
    }

    setFile(null);
    setMessage("File uploaded successfully.");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleUpload} className="mt-4 space-y-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
      </div>
    </form>
  );
}