"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      const checkResponse = await fetch("/api/auth/check-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const checkResult = await checkResponse.json();

      if (checkResult.status === "registered") {
        setMessage("This email is already registered.");
        return;
      }

      if (checkResult.status === "unverified") {
        setMessage(
          "This email is registered but not verified yet. Please check your inbox.",
        );
        return;
      }

      if (checkResult.status !== "available") {
        setMessage(checkResult.message || "Something went wrong.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Please check your email to verify your account.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow"
      >
        <h1 className="text-2xl font-bold">Sign Up</h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          required={true}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {message ? <p className="text-sm text-red-600">{message}</p> : null}
        <p className="text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
