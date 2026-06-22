"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { Shield, Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/users/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "savezoUser",
        JSON.stringify(
          res.data.user
        )
      );

      router.push("/dashboard");
    } catch (error: any) {
      console.log(error);

      setError(
        error?.response?.data
          ?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 text-white">

          <div className="flex items-center gap-3 mb-6">
            <Shield size={42} />
            <h1 className="text-3xl font-bold">
              SaveZo
            </h1>
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Social Media
            <br />
            Without Harm
          </h2>

          <p className="text-lg text-white/90">
            AI-powered platform for detecting
            deepfakes, harmful content and
            mental health risks.
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 md:p-12">

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back 👋
            </h2>

            <p className="text-muted-foreground">
              Sign in to continue using
              SaveZo.
            </p>

          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter email"
                  required
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    rounded-xl
                    bg-muted
                    border
                    border-border
                    outline-none
                    focus:border-blue-500
                  "
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div>

              <label className="text-sm font-medium block mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter password"
                  required
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    rounded-xl
                    bg-muted
                    border
                    border-border
                    outline-none
                    focus:border-blue-500
                  "
                />

              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-3
                rounded-xl
                bg-gradient-to-r
                from-blue-500
                via-cyan-500
                to-purple-500
                text-white
                font-semibold
                hover:opacity-90
                transition
              "
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

          </form>

          {/* SIGNUP LINK */}
          <div className="mt-6 text-center">

            <p className="text-muted-foreground text-sm">

              Don't have an account?{" "}

              <Link
                href="/signup"
                className="text-blue-500 font-semibold hover:underline"
              >
                Create Account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}