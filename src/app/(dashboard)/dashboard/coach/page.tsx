"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useUserStore } from "@/stores/userStore";
import type { AIMessage } from "@/types";

const SUGGESTED_PROMPTS = [
  "What habits should I start with?",
  "I'm struggling with motivation today",
  "How can I improve my sleep?",
  "Give me a budgeting tip",
  "Help me set a fitness goal",
];

export default function CoachPage() {
  const { profile } = useUserStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: AIMessage = {
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: AIMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Coach
          </h1>
          <p className="text-white/60">
            Your personal wellness guide powered by AI
          </p>
        </div>
        {messages.length > 0 && (
          <GlassButton variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Chat
          </GlassButton>
        )}
      </div>

      {/* Chat Area */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-white/60 max-w-md mb-6">
                I'm here to support your journey across physical, mental, and fiscal wellness. 
                Ask me anything!
              </p>
              
              {/* Suggested prompts */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        flex items-start gap-3 max-w-[80%]
                        ${message.role === "user" ? "flex-row-reverse" : ""}
                      `}
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                          ${message.role === "user"
                            ? "bg-purple-500"
                            : "bg-gradient-to-br from-purple-500 to-pink-500"
                          }
                        `}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`
                          px-4 py-3 rounded-2xl
                          ${message.role === "user"
                            ? "bg-purple-500/30 rounded-tr-sm"
                            : "bg-white/10 rounded-tl-sm"
                          }
                        `}
                      >
                        <p className="text-white whitespace-pre-wrap">{message.content}</p>
                        <span className="text-white/40 text-xs mt-1 block">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-tl-sm">
                    <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          {profile?.tier === "free" && (
            <p className="text-white/40 text-xs mb-2 text-center">
              Free tier: 10 messages per day
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI coach..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={loading}
            />
            <GlassButton
              type="submit"
              variant="primary"
              disabled={!input.trim() || loading}
            >
              <Send className="w-5 h-5" />
            </GlassButton>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
