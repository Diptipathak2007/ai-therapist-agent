"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get API URL from environment
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const checkSession = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      console.log(
        "SessionContext: Token from localStorage:",
        token ? "exists" : "not found"
      );
      console.log("SessionContext: API_BASE_URL:", API_BASE_URL);

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("SessionContext: Fetching user data...");
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {  // ✅ Fixed URL!
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
      });

      console.log("SessionContext: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("SessionContext: User data received:", data);
        
        // Handle different response formats
        const userData = data.user || data;
        
        // Remove password if it exists
        if (userData.password) {
          const { password, ...safeUserData } = userData;
          setUser(safeUserData);
          console.log("SessionContext: User state updated:", safeUserData);
        } else {
          setUser(userData);
          console.log("SessionContext: User state updated:", userData);
        }
      } else {
        console.log("SessionContext: Failed to get user data, status:", response.status);
        
        // Try to get error message
        try {
          const errorData = await response.json();
          console.log("SessionContext: Error response:", errorData);
        } catch (e) {
          console.log("SessionContext: Could not parse error response");
        }
        
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("SessionContext: Error checking session:", error);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("SessionContext: Logging out...");
        await fetch(`${API_BASE_URL}/api/auth/logout`, {  // ✅ Fixed URL!
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
      }
    } catch (error) {
      console.error("SessionContext: Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    }
  };

  useEffect(() => {
    console.log("SessionContext: Initial check");
    checkSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        checkSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}