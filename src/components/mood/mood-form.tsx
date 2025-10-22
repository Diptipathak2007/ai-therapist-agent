"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";

interface MoodFormProps {
  onSuccess?: () => void;
}

export function MoodForm({ onSuccess }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

    const handleSubmit = async () => {
      if (typeof window === 'undefined') return; // Skip on server
    
      console.log("MoodForm: Starting submission");
      console.log("MoodForm: Auth state:", { isAuthenticated, loading, user });
    
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your mood",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }
    
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        console.log("MoodForm: Token from localStorage:", token ? "exists" : "not found");
    
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log("MoodForm: Using API URL:", API_URL);
    
        const response = await fetch(`${API_URL}/api/mood`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({ score: moodScore }),
        });
    
        console.log("MoodForm: Response status:", response.status);
    
        // Safely parse response
        const contentType = response.headers.get("content-type");
        let responseData: any = null;
    
        if (contentType?.includes("application/json")) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          responseData = { message: text };
        }
    
        if (!response.ok) {
          console.error("MoodForm: Error response:", responseData);
          if (responseData.message === "Invalid authentication token") {
            toast({
              title: "Session expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            router.push("/login");
          }
          throw new Error(responseData.message || `HTTP error ${response.status}`);
        }
    
        console.log("MoodForm: Success response:", responseData);
    
        toast({
          title: "Mood tracked successfully!",
          description: "Your mood has been recorded.",
        });
    
        onSuccess?.();
      } catch (error) {
        console.error("MoodForm: Error details:", error);
    
        let errorMessage = "Failed to track mood";
        if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === "string") errorMessage = error;
    
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    

  return (
    <div className="space-y-6 py-4">
      {/* Emotion display */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{currentEmotion.label}</div>
        <div className="text-sm text-muted-foreground">
          {currentEmotion.description}
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-4">
        <div className="flex justify-between px-2">
          {emotions.map((em) => (
            <div
              key={em.value}
              className={`cursor-pointer transition-opacity ${
                Math.abs(moodScore - em.value) < 15
                  ? "opacity-100"
                  : "opacity-50"
              }`}
              onClick={() => setMoodScore(em.value)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        <Slider
          value={[moodScore]}
          onValueChange={(value) => setMoodScore(value[0])}
          min={0}
          max={100}
          step={1}
          className="py-4"
        />
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-muted rounded-md text-xs">
          <div>API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</div>
          <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>Token: {localStorage.getItem("token") ? 'Exists' : 'Missing'}</div>
        </div>
      )}

      {/* Submit button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || loading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Save Mood"
        )}
      </Button>
    </div>
  );
}