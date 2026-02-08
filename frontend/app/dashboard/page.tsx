"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import IngestInterface from "@/components/IngestInterface";
import ChatSidebar from "@/components/ChatSidebar";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "ingest">("chat");
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setView("chat");
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setView("chat");
  };

  const handleChatUpdate = (newChatId?: string) => {
    // If a new chat was created, set it as the selected chat
    if (newChatId) {
      setSelectedChatId(newChatId);
    }
    // Refresh the sidebar to show the new chat
    setSidebarRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 flex bg-[#030303] text-gray-100 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-cyan-900/15 rounded-full blur-[200px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Sidebar */}
      <ChatSidebar
        currentChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onToggleIngest={() => setView("ingest")}
        key={sidebarRefreshTrigger}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header Bar */}
        <header className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Lumina
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-500 uppercase tracking-wider font-mono">Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <span className="text-[10px] text-gray-500 font-mono">MODEL:</span>
            <span className="text-[10px] text-cyan-400 font-bold font-mono">GEMINI 1.5 PRO</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {view === "chat" ? (
            <ChatInterface 
              chatId={selectedChatId} 
              onUpdateChat={handleChatUpdate} 
            />
          ) : (
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black border border-white/5">
                  <h1 className="text-2xl font-bold text-white mb-2">Knowledge Base</h1>
                  <p className="text-gray-400 text-sm">Add documents, text, or web pages to your AI's knowledge.</p>
                </div>
                <IngestInterface />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
