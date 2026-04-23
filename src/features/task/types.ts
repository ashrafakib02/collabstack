export type TaskComment = {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
};

export type TaskAttachment = {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};