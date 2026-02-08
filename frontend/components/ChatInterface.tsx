"use client";

import { useState, useRef, useEffect } from "react";
import { Send, FileText, Clock, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import LuminaAvatar from "./LuminaAvatar";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { id: number; content: string }[];
  timing?: number; // Response time in ms
}

interface ChatInterfaceProps {
  chatId: string | null;
  onUpdateChat: (newChatId?: string) => void;
}

export default function ChatInterface({ chatId, onUpdateChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<"idle" | "thinking" | "streaming">("idle");
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    setCurrentChatId(chatId);
    if (chatId) {
      loadChatHistory(chatId);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async (chatIdToLoad: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/chats/${chatIdToLoad}/messages`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map((m: any) => ({
          role: m.role,
          content: m.content,
          citations: m.citations
        })));
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setAvatarState("thinking");
    setLastResponseTime(null);

    const startTime = performance.now();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          query: userMessage,
          chat_id: currentChatId
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      setLastResponseTime(responseTime);

      setAvatarState("streaming");
      const data = await res.json();

      const answerContent = data.answer || data.response || "No response received";
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: answerContent,
        citations: data.citations,
        timing: responseTime
      }]);

      if (!currentChatId && data.chat_id) {
        setCurrentChatId(data.chat_id);
        onUpdateChat(data.chat_id);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      setAvatarState("idle");
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const quickSuggestions = [
    "Summarize my documents",
    "What are the key insights?",
    "Find relevant information about...",
    "Explain the main concepts"
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full" />
                <LuminaAvatar state={avatarState} size="xl" />
              </div>
              
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                How can I help you today?
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Ask questions about your knowledge base or start a new conversation.
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {quickSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 text-sm text-gray-400 hover:text-white transition-all text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {msg.role === "assistant" && (
                    <div className="shrink-0">
                      <LuminaAvatar 
                        state={isLoading && idx === messages.length - 1 ? avatarState : "idle"} 
                        size="sm" 
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-5 py-4 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-md"
                          : "bg-white/5 text-gray-100 border border-white/5 rounded-tl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    </div>

                    {/* Citations & Timing for assistant messages */}
                    {msg.role === "assistant" && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {/* Timing Badge */}
                        {msg.timing && (
                          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <Clock size={10} />
                            {formatTime(msg.timing)}
                          </span>
                        )}
                        
                        {/* Citations */}
                        {msg.citations && msg.citations.map((cite, cIdx) => (
                          <div key={cIdx} className="group relative">
                            <span className="text-[10px] bg-black/50 border border-white/10 text-gray-400 px-2.5 py-1 rounded-full cursor-help hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-1.5">
                              <FileText size={10} />
                              Source {cite.id}
                            </span>
                            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-black/95 border border-white/10 rounded-lg text-xs text-gray-300 hidden group-hover:block z-50">
                              <p className="italic line-clamp-4">"{cite.content}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4"
              >
                <LuminaAvatar state="thinking" size="sm" />
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumina anything..."
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 rounded-xl transition-colors"
            >
              <Send size={18} className="text-white" />
            </button>
          </form>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-[10px] text-gray-600">Lumina RAG v2.0</span>
            <span className="text-[10px] text-gray-700">•</span>
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <Zap size={10} className="text-cyan-500" />
              Gemini 1.5 Pro
            </span>
            {lastResponseTime && (
              <>
                <span className="text-[10px] text-gray-700">•</span>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <Clock size={10} />
                  Last: {formatTime(lastResponseTime)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
