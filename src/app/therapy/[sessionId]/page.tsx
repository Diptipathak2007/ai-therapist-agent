"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Bot, User, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

export default function TherapyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content:
          "I’m here to support you. Can you tell me more about what’s on your mind?",
        timestamp: new Date(),
        metadata: { technique: "supportive" },
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (text: string) => {
    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center items-start pt-20 px-4">
      <div className="flex flex-col w-full max-w-3xl h-[80vh] border rounded-lg overflow-hidden bg-white dark:bg-background">
        {/* Chat Display */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-2 text-2xl font-semibold">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                    AI Therapist
                  </span>
                </div>
                <p className="text-muted-foreground">
                  How can I assist you today?
                </p>
              </motion.div>

              <div className="grid gap-3 w-full">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <motion.div
                    key={uuidv4()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full text-left py-4 px-6 rounded-xl"
                      onClick={() => handleSuggestedQuestion(q.text)}
                    >
                      {q.text}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-4 p-4 rounded-xl",
                    msg.role === "assistant"
                      ? "bg-muted/20"
                      : "bg-background self-end"
                  )}
                >
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full">
                    {msg.role === "assistant" ? (
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded-full">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-secondary/20 flex items-center justify-center rounded-full">
                        <User className="w-5 h-5 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {msg.role === "assistant" ? "AI Therapist" : "You"}
                    </p>
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.metadata?.technique && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {msg.metadata.technique}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 rounded-xl bg-muted/20"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">AI Therapist</p>
                    <p className="text-sm text-muted-foreground">Typing...</p>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t p-4 bg-background/50">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 min-h-[48px] max-h-[200px] p-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              disabled={isTyping}
            />
            <Button
              type="submit"
              className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary hover:bg-primary-dark"
              disabled={!message.trim() || isTyping}
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
