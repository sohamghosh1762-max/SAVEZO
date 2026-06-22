"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User } from "lucide-react";
import api from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loginData, setLoginData] =
    useState({
      email: "",
      password: "",
    });

  const [signupData, setSignupData] =
    useState({
      name: "",
      username: "",
      email: "",
      password: "",
    });

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/users/login",
        loginData
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

  const handleSignup = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/users/signup",
        signupData
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT */}
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
            AI-powered platform for
            detecting deepfakes,
            harmful content and mental
            health risks before they
            spread.
          </p>

        </div>

        {/* RIGHT */}
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

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* LOGIN */}
          {isLogin ? (
            <form
              onSubmit={
                handleLogin
              }
              className="space-y-5"
            >

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    type="email"
                    required
                    value={
                      loginData.email
                    }
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        email:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Enter email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border outline-none focus:border-blue-500"
                  />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    type="password"
                    required
                    value={
                      loginData.password
                    }
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password:
                          e.target
                            .value,
                      })
                    }
                    placeholder="Enter password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border outline-none focus:border-blue-500"
                  />

                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
              >
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </button>

            </form>
          ) : (
            <form
              onSubmit={
                handleSignup
              }
              className="space-y-5"
            >

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={
                    signupData.name
                  }
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      name:
                        e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted border border-border"
                />

              </div>

              <input
                type="text"
                required
                placeholder="Username"
                value={
                  signupData.username
                }
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    username:
                      e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
              />

              <input
                type="email"
                required
                placeholder="Email"
                value={
                  signupData.email
                }
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    email:
                      e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
              />

              <input
                type="password"
                required
                placeholder="Password"
                value={
                  signupData.password
                }
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    password:
                      e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}