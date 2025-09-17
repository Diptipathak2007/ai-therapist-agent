"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  Trophy,
  Star,
  Clock,
  Smile,
  PlusCircle,
  MessageSquare,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves";
    title: string;
    description: string;
  };
}

interface ApiResponse {
  message: string;
  metadata: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const COMPLETION_THRESHOLD = 5;

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stressPrompt, setStressPrompt] = useState<StressPrompt | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [showNFTCelebration, setShowNFTCelebration] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId as string
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();
      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);
      setMessages([]);
      window.history.pushState({}, "", `/therapy/${newSessionId}`);
      setIsSidebarOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to create new session:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        if (!sessionId || sessionId === "new") {
          const newSessionId = await createChatSession();
          setSessionId(newSessionId);
          window.history.pushState({}, "", `/therapy/${newSessionId}`);
        } else {
          try {
            const history = await getChatHistory(sessionId);
            if (Array.isArray(history)) {
              const formattedHistory = history.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }));
              setMessages(formattedHistory);
            } else {
              setMessages([]);
            }
          } catch (historyError) {
            console.error("Error loading chat history:", historyError);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "I apologize, but I'm having trouble loading the chat session. Please try refreshing the page.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [sessionId]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getAllChatSessions();
        setSessions(allSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    loadSessions();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage || isTyping || isChatPaused || !sessionId) {
      return;
    }

    setMessage("");
    setIsTyping(true);

    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const stressCheck = detectStressSignals(currentMessage);
      if (stressCheck) {
        setStressPrompt(stressCheck);
        setIsTyping(false);
        return;
      }

      const response = await sendChatMessage(sessionId, currentMessage);
      const aiResponse =
        typeof response === "string" ? JSON.parse(response) : response;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          aiResponse.response ||
          aiResponse.message ||
          "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
        metadata: {
          analysis: aiResponse.analysis || {
            emotionalState: "neutral",
            riskLevel: 0,
            themes: [],
            recommendedApproach: "supportive",
            progressIndicators: [],
          },
          technique: aiResponse.metadata?.technique || "supportive",
          goal: aiResponse.metadata?.currentGoal || "Provide support",
          progress: aiResponse.metadata?.progress || {
            emotionalState: "neutral",
            riskLevel: 0,
          },
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const detectStressSignals = (message: string): StressPrompt | null => {
    const stressKeywords = [
      "stress",
      "anxiety",
      "worried",
      "panic",
      "overwhelmed",
      "nervous",
      "tense",
      "pressure",
      "can't cope",
      "exhausted",
    ];

    const lowercaseMsg = message.toLowerCase();
    const foundKeyword = stressKeywords.find((keyword) =>
      lowercaseMsg.includes(keyword)
    );

    if (foundKeyword) {
      const activities = [
        {
          type: "breathing" as const,
          title: "Breathing Exercise",
          description:
            "Follow calming breathing exercises with visual guidance",
        },
        {
          type: "garden" as const,
          title: "Zen Garden",
          description: "Create and maintain your digital peaceful space",
        },
        {
          type: "forest" as const,
          title: "Mindful Forest",
          description: "Take a peaceful walk through a virtual forest",
        },
        {
          type: "waves" as const,
          title: "Ocean Waves",
          description: "Match your breath with gentle ocean waves",
        },
      ];

      return {
        trigger: foundKeyword,
        activity: activities[Math.floor(Math.random() * activities.length)],
      };
    }

    return null;
  };

  const handleSuggestedQuestion = async (text: string) => {
    if (!sessionId) {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);
      router.push(`/therapy/${newSessionId}`);
    }

    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleCompleteSession = async () => {
    if (isCompletingSession) return;
    setIsCompletingSession(true);
    try {
      setShowNFTCelebration(true);
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
        setSessionId(selectedSessionId);
        window.history.pushState({}, "", `/therapy/${selectedSessionId}`);
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] mt-16 sm:mt-20 gap-0 md:gap-6">
        {/* Mobile Sidebar Toggle Button */}
        <div className={cn(
          "md:hidden fixed top-4 left-4 z-50 transition-opacity duration-300",
          isSidebarOpen && "opacity-0 pointer-events-none"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="hover:bg-primary/10 bg-background/80 backdrop-blur-sm"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Sidebar with chat history */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-72 sm:w-80 bg-black text-white z-40 md:static md:flex md:flex-col border-r border-gray-800 transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="p-4 pt-16 md:pt-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chat Sessions</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewSession}
                  className="hover:bg-gray-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden hover:bg-gray-800 text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-sm border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              New Session
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={cn(
                    "p-3 rounded-lg text-sm cursor-pointer hover:bg-gray-800 transition-colors",
                    session.sessionId === sessionId
                      ? "bg-gray-900 text-primary"
                      : "bg-gray-950"
                  )}
                  onClick={() => handleSessionSelect(session.sessionId)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">
                      {session.messages[0]?.content.slice(0, 30) || "New Chat"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-gray-400">
                    {session.messages[session.messages.length - 1]?.content ||
                      "No messages yet"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {session.messages.length} messages
                    </span>
                    <span className="text-xs text-gray-400">
                      {(() => {
                        try {
                          const date = new Date(session.updatedAt);
                          if (isNaN(date.getTime())) {
                            return "Just now";
                          }
                          return formatDistanceToNow(date, {
                            addSuffix: true,
                          });
                        } catch (error) {
                          return "Just now";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-background rounded-lg border md:mt-0 mt-12">
          {/* Chat header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg">AI Therapist</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {messages.length} messages
                </p>
              </div>
            </div>
          </div>

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex flex-col items-center">
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={{
                        initial: { opacity: 0, scale: 1 },
                        animate: {
                          opacity: [0, 1, 0],
                          scale: [1, 1.1, 1],
                          transition: { duration: 1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] },
                        },
                      }}
                    />
                    <div className="relative flex items-center gap-2 text-xl sm:text-2xl font-semibold">
                      <div className="relative">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        <motion.div
                          className="absolute inset-0 text-primary"
                          initial="initial"
                          animate="animate"
                          variants={{
                            initial: { opacity: 0, scale: 1 },
                            animate: {
                              opacity: [0, 1, 0],
                              scale: [1, 1.1, 1],
                              transition: { duration: 1, repeat: Infinity, ease: [0.4, 0, 0.2, 1] },
                            },
                          }}
                        >
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.div>
                      </div>
                      <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                        AI Therapist
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      How can I assist you today?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-3 px-4 sm:py-4 sm:px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 text-sm sm:text-base"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        {q.text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "px-4 sm:px-6 py-6 sm:py-8",
                        msg.role === "assistant"
                          ? "bg-muted/30"
                          : "bg-background"
                      )}
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                              <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm sm:text-base">
                              {msg.role === "assistant"
                                ? "AI Therapist"
                                : "You"}
                            </p>
                            {msg.metadata?.technique && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.metadata.technique}
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-sm dark:prose-invert leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.metadata?.goal && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Goal: {msg.metadata.goal}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 sm:px-6 py-6 sm:py-8 flex gap-3 sm:gap-4 bg-muted/30"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm sm:text-base">AI Therapist</p>
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-3 sm:p-4">
            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-end relative"
            >
              <div className="flex-1 relative group">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isChatPaused
                      ? "Complete the activity to continue..."
                      : "Ask me anything..."
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background",
                    "p-2 sm:p-3 pr-10 sm:pr-12 min-h-[40px] sm:min-h-[48px] max-h-[150px] sm:max-h-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200 text-sm sm:text-base",
                    "placeholder:text-muted-foreground/70",
                    (isTyping || isChatPaused) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-1 sm:right-1.5 bottom-2 sm:bottom-3.5 h-8 w-8 sm:h-[36px] sm:w-[36px]",
                    "rounded-xl transition-all duration-200",
                    "bg-primary hover:bg-primary/90",
                    "shadow-sm shadow-primary/20",
                    (isTyping || isChatPaused || !message.trim()) &&
                      "opacity-50 cursor-not-allowed",
                    "group-hover:scale-105 group-focus-within:scale-105"
                  )}
                  disabled={isTyping || isChatPaused || !message.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Press <kbd className="px-1.5 sm:px-2 py-0.5 rounded bg-muted">Enter ↵</kbd>{" "}
              to send,
              <kbd className="px-1.5 sm:px-2 py-0.5 rounded bg-muted ml-1">
                Shift + Enter
              </kbd>{" "}
              for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}