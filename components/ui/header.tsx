"use client";
import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";
import { Menu, Rotate3d, X } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";

import { useState } from "react";
import { Button } from "./button";

export default function Header() {
  const navitems = [
    { href: "/features", label: "Features" },
    { href: "/about", label: "About KORA" },
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className=" w-full fixed top-0 z-50 bg-background/95 backdrop-blur">
      <div className="absolute inset-0 border-b border-primary/10">
        <header className="relative max-w-6xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/*logo and nav*/}
            <Link
              href="/"
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              <Rotate3d className="h-7 w-7 primary animate-pulse-gentle" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
                  KORA
                </span>
              </div>
            </Link>
            {/*navitems*/}
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center space-x-1">
                {navitems.map((item) => {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors
                    relative group"
                    >
                      {item.label}
                      <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-primary to-primary/80 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                    </Link>
                  );
                })}
              </nav>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <SignInButton />
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10">
            <nav className="flex flex-col space-y-1 py-4">
              {navitems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground
                  hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
