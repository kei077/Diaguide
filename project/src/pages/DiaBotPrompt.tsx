import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Settings, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LLM_MODELS = [
  { label: "Llama3-8B", value: "Llama3-8B" },
  { label: "Llama3-70B", value: "Llama3-70B" },
  { label: "DeepSeek-Llama-70B", value: "DeepSeek-Llama-70B" }
];

const CREATIVITY_LEVELS = [
  { label: "Very Conservative", value: 0.0 },
  { label: "Conservative", value: 0.2 },
  { label: "Standard", value: 0.5 },
  { label: "Creative", value: 0.7 },
  { label: "Very Creative", value: 1.0 }
];

const LENGTH_LEVELS = [
  { label: "Very Short", value: 100 },
  { label: "Short", value: 200 },
  { label: "Standard", value: 500 },
  { label: "Long", value: 1000 },
  { label: "Very Long", value: 2000 }
];

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function DiaBotPrompt() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Diabetes AI Assistant. I\'m here to help answer your questions about diabetes management, symptoms, treatments, and general health advice. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [llmModel, setLlmModel] = useState(LLM_MODELS[0].value);
  const [creativity, setCreativity] = useState(CREATIVITY_LEVELS[2].value);
  const [length, setLength] = useState(LENGTH_LEVELS[2].value);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!currentMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    try {
      const res = await fetch("http://localhost:9000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "diabete",
          question: currentMessage,
          llm_provider: "Groq",
          llm_model: llmModel,
          temperature: creativity,
          max_tokens: length,
          n_context_results: 3,
          system_prompt: "You are a helpful diabetes assistant. Answer clearly and concisely with accurate medical information."
        })
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.answer || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Diabetes AI Assistant
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your personal health companion
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 bg-gradient-to-r from-slate-50/95 via-white/90 to-emerald-50/70 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-emerald-950/70 border-b border-slate-200/60 dark:border-slate-600/40 backdrop-blur-md">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              AI Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize how your AI assistant responds
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LLM Model */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                AI Model
              </label>
              <div className="relative">
                <select
                  value={llmModel}
                  onChange={e => setLlmModel(e.target.value)}
                  className={cn(
                    "w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm",
                    "bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm",
                    "border-2 border-slate-200/60 dark:border-slate-600/60",
                    "focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none",
                    "text-slate-700 dark:text-slate-200",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md",
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  disabled={loading}
                >
                  {LLM_MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-4">
                Choose AI model performance
              </p>
            </div>

            {/* Creativity */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                Creativity Level
              </label>
              <div className="relative">
                <select
                  value={creativity}
                  onChange={e => setCreativity(Number(e.target.value))}
                  className={cn(
                    "w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm",
                    "bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm",
                    "border-2 border-slate-200/60 dark:border-slate-600/60",
                    "focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none",
                    "text-slate-700 dark:text-slate-200",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md",
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  disabled={loading}
                >
                  {CREATIVITY_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-4">
                Response creativity & variance
              </p>
            </div>

            {/* Response Length */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                Response Length
              </label>
              <div className="relative">
                <select
                  value={length}
                  onChange={e => setLength(Number(e.target.value))}
                  className={cn(
                    "w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm",
                    "bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm",
                    "border-2 border-slate-200/60 dark:border-slate-600/60",
                    "focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none",
                    "text-slate-700 dark:text-slate-200",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md",
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  disabled={loading}
                >
                  {LENGTH_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-4">
                Detailed vs concise answers
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-600/40">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setLlmModel('Llama3-8B');
                  setCreativity(0.2);
                  setLength(200);
                }}
                className="px-3 py-1.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 border border-blue-200/50 dark:border-blue-800/50"
                disabled={loading}
              >
                📊 Quick & Factual
              </button>
              <button
                onClick={() => {
                  setLlmModel('Llama3-70B');
                  setCreativity(0.5);
                  setLength(500);
                }}
                className="px-3 py-1.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-200 border border-emerald-200/50 dark:border-emerald-800/50"
                disabled={loading}
              >
                ⚖️ Balanced
              </button>
              <button
                onClick={() => {
                  setLlmModel('DeepSeek-Llama-70B');
                  setCreativity(0.7);
                  setLength(1000);
                }}
                className="px-3 py-1.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 border border-purple-200/50 dark:border-purple-800/50"
                disabled={loading}
              >
                🎨 Detailed & Creative
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-4xl",
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm",
                message.type === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ml-12'
                  : 'bg-white/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-600/50'
              )}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              <div
                className={cn(
                  "text-xs mt-2 opacity-70",
                  message.type === 'user' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/80 dark:bg-slate-700/80 rounded-2xl px-4 py-3 border border-slate-200/50 dark:border-slate-600/50">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about diabetes..."
              className={cn(
                "w-full resize-none rounded-2xl px-4 py-3 border-2 border-slate-200 dark:border-slate-600",
                "bg-white/90 dark:bg-slate-700/90 text-slate-800 dark:text-slate-100",
                "focus:border-emerald-500 focus:ring-0 focus:outline-none",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "shadow-sm"
              )}
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto'
              }}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !currentMessage.trim()}
            className={cn(
              "rounded-2xl px-4 py-3 h-11 shadow-lg",
              "bg-gradient-to-r from-emerald-500 to-teal-500",
              "hover:from-emerald-600 hover:to-teal-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}