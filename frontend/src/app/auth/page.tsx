"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] =
    useState(true);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 text-white">

          <div className="flex items-center gap-3 mb-6">
            <Shield size={40} />
            <h1 className="text-3xl font-bold">
              SaveZo
            </h1>
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Social Media
            <br />
            Without Harm
          </h2>

          <p className="text-white/90 text-lg">
            Detect deepfakes, harmful content,
            and mental health risks before they
            spread.
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 md:p-12">

          <div className="flex mb-8 bg-muted rounded-xl p-1">

            <button
              onClick={() =>
                setIsLogin(true)
              }
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                isLogin
                  ? "bg-blue-500 text-white"
                  : ""
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() =>
                setIsLogin(false)
              }
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                !isLogin
                  ? "bg-blue-500 text-white"
                  : ""
              }`}
            >
              Sign Up
            </button>

          </div>

          {/* LOGIN TAB */}
          {isLogin ? (
            <div className="space-y-4">

              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
                disabled
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
                disabled
              />

              <button
                onClick={() =>
                  router.push("/signin")
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition"
              >
                Continue to Sign In
              </button>

            </div>
          ) : (
            <div className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
                disabled
              />

              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
                disabled
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
                disabled
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
                disabled
              />

              <button
                onClick={() =>
                  router.push("/signup")
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition"
              >
                Continue to Sign Up
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}