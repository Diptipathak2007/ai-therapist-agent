"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>

      {/* Container */}
      <Container className="relative z-10 flex justify-center items-center w-full px-4">
        <Card className="w-full sm:max-w-md md:max-w-lg p-8 md:p-10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] border border-white/10 bg-gradient-to-br from-background/80 to-card/90 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary via-pink-500 to-secondary bg-clip-text text-transparent tracking-tight">
              Sign In
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 py-3 text-base rounded-xl bg-background/40 border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground hover:border-primary/40 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-12 py-3 text-base rounded-xl bg-background/40 border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground hover:border-primary/40 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/60 shadow-lg shadow-primary/30 transition-all duration-300 ease-in-out text-lg font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Sign up
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/forgot-password"
              className="text-primary font-medium hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
