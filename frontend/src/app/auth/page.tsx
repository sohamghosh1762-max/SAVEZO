"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, AtSign, Chrome, Apple } from "lucide-react";
import api from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [signupData, setSignupData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/login", loginData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("savezoUser", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (error: any) {
      setError(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/signup", signupData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("savezoUser", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (error: any) {
      setError(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">

        {/* LEFT — dark branding panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#0A0F1E] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(79,110,247,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.15) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4f6ef7, #a855f7)" }}>
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-white text-xl font-medium">SaveZo</span>
            </div>

            <h2 className="text-3xl font-medium text-white leading-snug mb-4 tracking-tight">
              Social media<br />without harm.
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered detection for deepfakes, harmful content, and mental
              health risks — before they spread.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                "AI Content Scan",
                "Deepfake Detection",
                "Mental Health Guard",
                "Privacy First",
              ].map((label) => (
                <span
                  key={label}
                  className="text-xs px-3 py-1 rounded-full text-slate-300"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600">
            Trusted by 10,000+ users worldwide
          </p>
        </div>

        {/* RIGHT — form panel */}
        <div className="p-8 md:p-10">

          {/* Tab switcher */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-7">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                isLogin
                  ? "bg-card text-foreground border border-border shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                !isLogin
                  ? "bg-card text-foreground border border-border shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="text-right">
                <a href="#" className="text-xs text-blue-500 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #4f6ef7, #a855f7)" }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground my-1">
                <span className="flex-1 h-px bg-border" />
                or continue with
                <span className="flex-1 h-px bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted text-sm text-muted-foreground hover:bg-background transition"
                >
                  <Chrome size={15} /> Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted text-sm text-muted-foreground hover:bg-background transition"
                >
                  <Apple size={15} /> Apple
                </button>
              </div>
            </form>

          ) : (

            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Full name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      placeholder="Alex Johnson"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      placeholder="alexjohnson"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #4f6ef7, #a855f7)" }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                By signing up you agree to our{" "}
                <a href="#" className="text-blue-500 hover:underline">Terms</a>
                {" "}and{" "}
                <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}