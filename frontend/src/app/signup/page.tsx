"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  Shield,
  User,
  Mail,
  Lock,
  AtSign,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState({
      name: "",
      username: "",
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/users/signup",
        formData
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
          "Signup failed"
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
            Join The Future
            <br />
            Of Safe Social Media
          </h2>

          <p className="text-lg text-white/90">
            Create your account and
            experience AI-powered
            protection against
            deepfakes, harmful content,
            and misinformation.
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 md:p-12">

          <div className="mb-8">

            <h2 className="text-3xl font-bold mb-2">
              Create Account 🚀
            </h2>

            <p className="text-muted-foreground">
              Start your SaveZo journey.
            </p>

          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSignup}
            className="space-y-4"
          >

            {/* NAME */}
            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
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

            {/* USERNAME */}
            <div className="relative">

              <AtSign
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={
                  formData.username
                }
                onChange={
                  handleChange
                }
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

            {/* EMAIL */}
            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
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

            {/* PASSWORD */}
            <div className="relative">

              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
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

            {/* BUTTON */}
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
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 text-center">

            <p className="text-muted-foreground text-sm">

              Already have an account?{" "}

              <Link
                href="/signin"
                className="text-blue-500 font-semibold hover:underline"
              >
                Sign In
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}