"use client";

import Link from "next/link";
import { ArrowRight, Database, Lock, Zap, Globe, MessageSquare, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Lumina
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/login"
              className="group relative px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-all overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-400 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            v2.0: Now with Web Scraping & Persistent Chat
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
          >
            Your Second Brain, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Illuminated by AI.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Ingest documents and websites instantly. Chat with your knowledge base using advanced RAG technology. Secure, fast, and built for clarity.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(8,145,178,0.5)]"
            >
              Start using Lumina
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-semibold transition-all backdrop-blur-sm"
            >
              See Features
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats/Tech Section */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat label="LLM Model" value="Gemini 1.5 Pro" />
            <Stat label="Vector DB" value="Supabase" />
            <Stat label="Latency" value="< 200ms" />
            <Stat label="Security" value="Enterprise RLS" />
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Engineered for Intelligence</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Lumina combines cutting-edge retrieval algorithms with a beautiful, intuitive interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-cyan-400" />}
              title="Web Scraping"
              description="Simply paste any URL. Lumina scrapes, cleans, and indexes the content instantly for your knowledge base."
              delay={0}
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
              title="Persistent Chat"
              description="Review past conversations, rename sessions, and build a history of insights. Your context is never lost."
              delay={0.1}
            />
             <FeatureCard 
              icon={<FileText className="w-6 h-6 text-blue-400" />}
              title="Multi-Format Ingestion"
              description="Drag and drop PDFs, TXT, or MD files. Our processor extracts text and tables with precision."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6 text-emerald-400" />}
              title="Semantic Search"
              description="Powered by pgvector. Search by meaning, not just keywords, to find the exact needle in the haystack."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-amber-400" />}
              title="Row Level Security"
              description="Your data is cryptographically isolated. We use Supabase RLS to ensure 100% data privacy."
              delay={0.4}
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-pink-400" />}
              title="Hybrid Reranking"
              description="We re-rank retrieved results using a cross-encoder model to ensure the AI sees only the most relevant context."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-8">Ready to illuminate your data?</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-2xl shadow-cyan-500/20"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Lumina AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xl md:text-2xl font-bold text-white">{value}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
    )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}
