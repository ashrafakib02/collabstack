# 🚀 CollabStack — Real-time Collaborative SaaS Platform

A production-ready, full-stack SaaS application built with modern web technologies.

CollabStack enables teams to collaborate in real-time with workspaces, projects, tasks, comments, file attachments, and live presence — all in a scalable multi-tenant architecture.

---

## 🌐 Live Demo

👉 https://collabstack-beta.vercel.app

---

## ✨ Features

### 🏢 Workspace & Team Management
- Multi-tenant workspace architecture
- Invite members via email
- Accept / reject invitations
- Role-based access (Owner / Member)

### 📋 Project & Task Management
- Create projects inside workspaces
- Task CRUD operations
- Kanban board (Todo / In Progress / Done)

### ⚡ Real-time Collaboration
- Live task updates (create/update/delete)
- Real-time comments per task
- Live invitation count (notification badge)
- Online presence tracking

### 💬 Communication
- Task-level comments with real-time sync
- Activity logs (who did what)

### 📁 File Attachments
- Upload files to tasks
- Secure storage using Supabase Storage
- Access via signed URLs

### 📊 Dashboard Analytics
- Workspace / project / task counts
- Task status breakdown
- Recent activity feed

### 🎨 UI/UX
- Clean SaaS-style layout
- Responsive design
- Polished empty states
- Consistent component styling

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

### Backend
- Supabase (PostgreSQL + Auth + Realtime + Storage)

### Realtime
- Supabase Realtime (Postgres Changes + Presence)

### Deployment
- Vercel

---

## 🏗️ Architecture Overview
```
Client (Next.js)
↓
API Layer (Server Components + Supabase Client)
↓
Supabase
├── PostgreSQL (Workspaces, Projects, Tasks)
├── Auth (User management)
├── Realtime (Live updates & presence)
└── Storage (File uploads)
```


---

## 🔐 Key Concepts Implemented

- Multi-tenant SaaS design
- Row Level Security (RLS)
- Realtime event-driven UI
- Client + Server component architecture
- Secure file storage with access control

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Workspace
![Workspace](./screenshots/workspace.png)

### Task Board
![Task Board](./screenshots/task-board.png)

---

## ⚙️ Local Setup

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```
Create .env.local:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the app:
```bash
npm run dev
```
---

## 🚀 Future Improvements

- Drag & drop Kanban (DnD)
- Notifications dropdown
- Role-based permissions (Admin vs Member)
- Task deadlines & reminders
- Stripe billing integration

---

## 👨‍💻 Author

**Ashraful Islam**  
Full Stack Developer (Backend-focused)

- GitHub: https://github.com/ashrafakib02
- Portfolio: https://www.behance.net/iffathridy1
---

## ⭐ Why This Project Stands Out

**This is not a demo project — it is a production-style SaaS system featuring:**

- Real-time architecture  
- Multi-user collaboration  
- Secure backend design  
- Scalable database structure  

Built to reflect how modern software is engineered in real-world environments.

---
