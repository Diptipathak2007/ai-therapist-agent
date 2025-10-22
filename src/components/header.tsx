"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X, MessageCircle, AudioWaveform, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useSession } from "@/lib/contexts/session-context";

export function Header() {
  const { isAuthenticated, logout } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "features", label: "Features" },
    { id: "about", label: "About KORA" },
  ];

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -80; // Adjust for fixed navbar height
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
    setIsMenuOpen(false); // Close mobile menu
  };

  return (
    <div className="w-full fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 border-b border-primary/10" />
      <header className="relative max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <AudioWaveform className="h-7 w-7 text-primary animate-pulse-gentle" />
            <div className="flex flex-col">
              <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                KORA
              </span>
              <span className="text-xs dark:text-muted-foreground">
                Your mental health Companion
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    className="hidden md:flex gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Link href="/dashboard">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Start Chat
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <SignInButton />
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10">
            <nav className="flex flex-col space-y-1 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated && (
                <Button
                  asChild
                  className="mt-2 mx-4 gap-2 bg-primary/90 hover:bg-primary"
                >
                  <Link href="/dashboard">
                    <MessageCircle className="w-4 h-4" />
                    <span>Start Chat</span>
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
