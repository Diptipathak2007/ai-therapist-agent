"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function DashboardPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(()=>{
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    },[]);
  return (
    <div className="min-h-screen bg-background p-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
                {currentTime.toLocaleDateString("en-us",{
                    weekday: 'long', 
                    month: 'long',
                    day: 'numeric',
                })}
            </p>
        </div>
    </div>
  )
}
