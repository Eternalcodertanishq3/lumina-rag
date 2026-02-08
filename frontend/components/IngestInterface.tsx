"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, File as FileIcon, Link as LinkIcon, Globe, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function IngestInterface() {
  const [ingestMode, setIngestMode] = useState<"text" | "file" | "url">("text");
  const [text, setText] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!sourceName) {
        setSourceName(e.target.files[0].name);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleIngest = async () => {
    if (
      (ingestMode === "text" && !text) ||
      (ingestMode === "file" && !file) ||
      (ingestMode === "url" && !url)
    ) return;
    
    setStatus("loading");
    setMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
          throw new Error("You must be logged in to ingest documents.");
      }

      const formData = new FormData();
      formData.append("source", sourceName || (file ? file.name : "Untitled"));

      if (ingestMode === "file" && file) {
          formData.append("file", file);
          formData.append("source", sourceName || file.name);
      } else if (ingestMode === "url" && url) {
          formData.append("url", url);
      } else {
          formData.append("text", text);
          formData.append("source", sourceName || "Text Paste");
      }
      
      const endpoint = ingestMode === "url" ? "/ingest/url" : "/ingest";

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Ingestion failed");
      }

      const data = await res.json();
      setStatus("success");
      setMessage(`Successfully ingested ${data.chunks_count} chunks.`);
      setText("");
      setSourceName("");
      setFile(null);
      setUrl("");
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(error.message || "Failed to ingest document.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 blur transition duration-1000 group-hover:opacity-40"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                         <Upload className="text-cyan-400 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Ingest New Data</h3>
                        <p className="text-gray-400 text-xs">Add context to your RAG knowledge base</p>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="grid grid-cols-3 gap-3 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5">
                    {[
                        { id: "text", icon: FileText, label: "Text Paste" },
                        { id: "file", icon: Upload, label: "File Upload" },
                        { id: "url", icon: Globe, label: "Web URL" }
                    ].map((mode) => (
                         <button
                            key={mode.id}
                            onClick={() => setIngestMode(mode.id as any)}
                            className={`py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                            ingestMode === mode.id
                                ? "bg-white/10 text-white shadow-lg border border-white/5 backdrop-blur-md"
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }`}
                        >
                            <mode.icon size={16} />
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Source Title</label>
                        <input
                            type="text"
                            value={sourceName}
                            onChange={(e) => setSourceName(e.target.value)}
                            placeholder="e.g. Q1 Financial Report"
                            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-gray-600 text-sm transition-all"
                        />
                    </div>

                    {ingestMode === "text" && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste relevant context here..."
                                rows={6}
                                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-600 text-sm scrollbar-thin scrollbar-thumb-gray-600 resize-none transition-all"
                            />
                        </div>
                    )}

                    {ingestMode === "url" && (
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Web Page URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/docs"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-gray-600 text-sm transition-all"
                                />
                            </div>
                            <p className="flex items-center gap-2 text-[10px] text-gray-500 mt-3 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <Sparkles size={10} className="text-blue-400" />
                                Text will be automatically extracted from the provided webpage.
                            </p>
                         </div>
                    )}

                    {ingestMode === "file" && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Upload Document</label>
                            {!file ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/10 transition-all group"
                                >
                                    <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                         <Upload className="text-gray-400 group-hover:text-cyan-400 w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Click to upload PDF or TXT</span>
                                    <span className="text-xs text-gray-600 mt-1">Max file size 10MB</span>
                                </div>
                            ) : (
                                <div className="w-full h-24 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl flex items-center justify-between px-6 relative overflow-hidden">
                                     <div className="flex items-center gap-4 relative z-10">
                                         <div className="p-2.5 bg-cyan-500/20 rounded-lg">
                                             <FileIcon className="text-cyan-400 w-6 h-6" />
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="text-sm font-medium text-white">{file.name}</span>
                                             <span className="text-xs text-cyan-200/60">{(file.size / 1024).toFixed(1)} KB</span>
                                         </div>
                                     </div>
                                    <button onClick={clearFile} className="relative z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".pdf,.txt,.md" 
                                className="hidden" 
                            />
                        </div>
                    )}

                    <button
                        onClick={handleIngest}
                        disabled={status === "loading" || (ingestMode === "text" ? !text : ingestMode === "file" ? !file : !url)}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale text-white py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-900/20 font-medium text-sm flex items-center justify-center gap-2 mt-4"
                    >
                        {status === "loading" ? (
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="ml-1">Processing Content...</span>
                            </div>
                        ) : (
                            <>
                                <Upload size={18} />
                                Add to Knowledge Base
                            </>
                        )}
                    </button>

                    {status === "success" && (
                        <div className="flex items-center gap-3 text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-4 rounded-xl animate-in slide-in-from-bottom-2">
                            <CheckCircle size={18} className="shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-in slide-in-from-bottom-2">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
