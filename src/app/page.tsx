import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">CollabStack</h1>

      <div className="flex gap-4">
        <Link href="/login" className="rounded border px-4 py-2">
          Login
        </Link>
        <Link href="/signup" className="rounded border px-4 py-2">
          Sign Up
        </Link>
      </div>
    </main>
  );
}