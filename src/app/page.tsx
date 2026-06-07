import Link from "next/link";
import {
  LogIn,
  UserPlus,
  Layers,
  Users,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time collaboration",
    description: "Work together with your team on shared projects, instantly.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "A snappy workspace that keeps up with your ideas.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Your data is protected with best-in-class security.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">CollabStack</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
          <Zap className="h-4 w-4 text-accent" />
          The collaborative workspace for modern teams
        </span>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Build together, ship faster with{" "}
          <span className="text-primary">CollabStack</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Bring your projects, people, and ideas into one shared space. Plan,
          collaborate, and deliver — all in real time.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <UserPlus className="h-5 w-5" />
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <LogIn className="h-5 w-5" />
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 text-left shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-primary">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CollabStack. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
