"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Trash2, LogOut, Menu, X, Database, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Chat } from "@/types/chat";
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onToggleIngest: () => void;
}

export default function ChatSidebar({ currentChatId, onSelectChat, onNewChat, onToggleIngest }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchUserAndChats();
  }, [currentChatId]);

  const fetchUserAndChats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setUserEmail(session.user.email || "User");
    const token = session.access_token;

    try {
      const res = await fetch(`${API_URL}/chats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`${API_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      
      setChats(chats.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-black/80 backdrop-blur border border-white/10 rounded-lg text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        w-[280px] shrink-0 h-full flex flex-col bg-[#0a0a0a] border-r border-white/5
        fixed md:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Lumina RAG</span>
          </div>

          <button
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-3 rounded-xl transition-all font-medium text-sm shadow-lg shadow-cyan-900/30"
          >
            <Plus size={18} />
            New Conversation
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-2">Recent Chats</h3>
          
          {chats.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
              <p className="text-gray-600 text-xs">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setIsOpen(false);
                  }}
                  className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    currentChatId === chat.id 
                      ? "bg-cyan-500/10 text-white border border-cyan-500/20" 
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <MessageSquare size={16} className={`shrink-0 ${currentChatId === chat.id ? "text-cyan-400" : "opacity-50"}`} />
                  <span className="truncate text-sm font-medium">{chat.title || "Untitled"}</span>
                  
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <button
            onClick={() => {
              onToggleIngest();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Database size={18} className="text-purple-400" />
            <span className="text-sm font-medium">Knowledge Base</span>
          </button>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {userEmail?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-200 max-w-[90px] truncate">{userEmail}</span>
                <span className="text-[10px] text-cyan-400 font-medium">Pro Plan</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
