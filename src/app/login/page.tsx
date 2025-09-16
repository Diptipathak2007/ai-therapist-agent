"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";

export default function LoginPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("🔄 Starting login process...");
      console.log("📧 Email:", email);
      
      const data = await loginUser(email, password);
      console.log("🚀 Login response:", data);
    
      if (!data.token) {
        console.error("❌ No token in login response");
        setError("Login failed: no token returned.");
        return;
      }
    
      console.log("💾 Storing token in localStorage...");
      console.log("🔑 Token preview:", data.token.substring(0, 20) + "...");
      
      // Ensure localStorage is available
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("token", data.token);
        
        // Verify storage worked
        const storedToken = localStorage.getItem("token");
        console.log("✅ Token stored successfully:", storedToken ? "Yes" : "No");
      } else {
        console.error("❌ localStorage not available");
        setError("Browser storage not available");
        return;
      }
      
      console.log("🔄 Checking session after login...");
      await checkSession();
      
      console.log("📍 Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      console.error("💥 Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/30">
      <Container className="flex flex-col items-center justify-center w-full">
        <Card className="w-full md:w-5/12 max-w-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-primary/10 bg-card/90 backdrop-blur-lg mt-12">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1 tracking-tight">
              Sign In
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Welcome back! Please sign in to continue your journey.
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-semibold mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-12 py-3 text-base rounded-xl bg-card bg-opacity-80 border border-primary 
                             focus:outline-none focus:ring-2 focus:ring-primary 
                             text-foreground dark:text-white caret-primary 
                             placeholder:text-muted-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-semibold mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-12 py-3 text-base rounded-xl bg-card bg-opacity-80 border border-primary 
                             focus:outline-none focus:ring-2 focus:ring-primary 
                             text-foreground dark:text-white caret-primary 
                             placeholder:text-muted-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                <p className="text-red-700 text-sm font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            <Button
              className="w-full py-3 text-base rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 
                         shadow-md hover:from-primary/80 hover:to-primary transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="my-6 border-t border-primary/10" />
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>
              <Link
                href="/signup"
                className="text-primary font-semibold underline hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="/forgot-password"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}