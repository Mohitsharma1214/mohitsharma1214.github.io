import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { ChatMessage } from '../services/aiChatService';
import { sendChatMessage } from '../services/aiChatService';
import { notifyAiChatActivity } from '../services/visitorTelemetryService';
import { InquiryService } from '../services/inquiryService';

/**
 * High-performance, secure Markdown renderer for chat assistant bubbles.
 * Parses bold, italics, code blocks, lists, and links while sanitizing HTML.
 */
const ChatMarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedHtml = useMemo(() => {
    try {
      const rawHtml = marked.parse(content, { 
        gfm: true, 
        breaks: true 
      }) as string;

      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'rel', 'class'],
      });
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className="chat-markdown text-slate-200 leading-relaxed text-xs"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export const MohitNeuralTwinChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Mohit's Neural Twin** — an interactive AI agent trained on Mohit Sharma's production systems, research, and technical credentials.\n\nAsk me anything about his **<120ms P95 latency architecture**, registered **Govt. Copyright SW-19841/2024**, or full-time career availability!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'llm',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPromptHint, setShowPromptHint] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check if suggestions strip can scroll left/right
  const checkScrollability = () => {
    if (suggestionsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = suggestionsRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestionsRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      suggestionsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScrollability, 250);
    }
  };

  const handleSuggestionsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (suggestionsRef.current && e.deltaY !== 0) {
      suggestionsRef.current.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowPromptHint(false);
      setTimeout(() => inputRef.current?.focus(), 250);
      setTimeout(checkScrollability, 300);
    }
  }, [isOpen, messages, isTyping]);

  // Hide hint bubble after 9 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPromptHint(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  // Lock background scrolling across all devices (iOS Safari, Android Chrome, Desktop) when Mohit's Twin is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Close chat on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(messages, text.trim());
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };
      setMessages((prev) => [...prev, botMessage]);

      // Instantly notify Mohit on Telegram regarding visitor query or contact lead
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const hasEmail = Boolean(emailMatch);
      const isLead = hasEmail || /contact|hire|interview|reach out|email me|schedule|call|phone|leave a message/i.test(text);

      notifyAiChatActivity({
        userQuery: text.trim(),
        botReply: response.text,
        isLead,
      });

      // If visitor provided an email address, automatically route to the Admin Panel Table & Web3Forms
      if (hasEmail && emailMatch) {
        const capturedEmail = emailMatch[0];
        InquiryService.submitInquiry({
          name: 'AI Copilot Visitor',
          email: capturedEmail,
          topic: 'AI Agent Inbound Lead',
          message: text.trim(),
          source: 'ai_agent',
          metadata: {
            botReply: response.text,
            capturedAt: new Date().toISOString(),
          },
        }).catch((e) => console.warn('Notice saving AI lead to admin inquiries:', e));

        // Forward to Web3Forms backup email
        const web3formsAccessKey =
          import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'f3866959-f408-42fa-9896-4a28c392bfcd';

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsAccessKey,
            name: 'AI Copilot Inbound Lead',
            email: capturedEmail,
            subject: `[AI Copilot Lead] from ${capturedEmail}`,
            message: `User message: "${text.trim()}"\n\nAI Response: "${response.text}"`,
            from_name: 'Mohit AI Co-Pilot',
          }),
        }).catch((e) => console.warn('Notice sending AI lead via Web3Forms:', e));
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered a brief latency hiccup. Please ask again or reach out to Mohit at mohitsharma1214.dev@gmail.com.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'llm',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Chat history cleared. What technical topic would you like to explore regarding Mohit Sharma?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'llm',
      },
    ]);
  };

  const promptSuggestions = [
    'Leave a message for Mohit 📬',
    'Top Computer Vision Projects',
    'How does he achieve <120ms P95 latency?',
    'Govt. Copyright SW-19841/2024 Details',
    'Is Mohit open to new roles?',
  ];

  return (
    <aside aria-label="AI Chat Assistant">
      {/* Floating Launcher Button */}
      <div className={`fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-[80] items-center gap-2 ${isOpen ? 'hidden sm:flex' : 'flex'}`}>
        {/* Subtle hint callout */}
        <AnimatePresence>
          {showPromptHint && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white/95 text-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md cursor-pointer text-xs font-mono hover:border-slate-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask AI Co-Pilot</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white border border-slate-700/80 shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer"
          title={isOpen ? "Close AI Co-Pilot" : "Open AI Co-Pilot"}
          aria-expanded={isOpen}
          aria-label="Toggle AI Co-Pilot"
        >
          {/* Bot Avatar Icon */}
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            {isOpen ? <X className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="font-semibold text-xs tracking-tight text-white leading-tight">
              AI Co-Pilot
            </span>
            <span className="text-[10px] font-mono text-slate-400 leading-none flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online
            </span>
          </div>
        </motion.button>
      </div>

      {/* Floating Chat Modal Window & Isolated Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay: Dims background, blocks pass-through clicks, and dismisses on outside touch */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              className="fixed inset-0 z-[85] bg-slate-950/50 backdrop-blur-xs touch-none"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-2.5 bottom-2 sm:inset-x-auto sm:bottom-20 sm:right-6 z-[90] w-auto sm:w-[420px] max-w-[calc(100vw-20px)] sm:max-w-none h-[calc(100dvh-16px)] sm:h-[580px] max-h-[92dvh] sm:max-h-[84dvh] rounded-2xl sm:rounded-3xl bg-[#030712]/95 backdrop-blur-2xl border border-blue-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex flex-col overflow-hidden text-white"
            >
              {/* Header */}
              <div className="p-3.5 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0 ring-1 ring-white/20">
                    MS
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-wide text-white flex items-center gap-1.5 leading-tight truncate">
                      <span className="truncate">Mohit's Neural Twin</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </h3>
                    <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="truncate">AI Copilot &bull; Production Knowledge</span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={clearChat}
                    title="Clear conversation"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Close chat"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-xs font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Tag */}
                  <div className="text-[10px] font-mono text-slate-400 mb-1 px-1 flex items-center gap-1.5">
                    <span>{msg.role === 'user' ? 'You' : "Mohit's Twin"}</span>
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] p-3 sm:p-3.5 rounded-2xl relative group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-lg leading-relaxed'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    ) : (
                      <ChatMarkdownMessage content={msg.content} />
                    )}

                    {/* Copy Button for Assistant responses */}
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute bottom-2 right-2 p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-300" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Loader */}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-xs max-w-[75%]">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Preparing response...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Fast Suggested Queries Strip with Horizontal Scroll & Quick Navigation */}
            <div className="relative border-t border-slate-800/80 bg-slate-950/90 px-1 py-1.5 group shrink-0">
              {/* Left Scroll Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollSuggestions('left')}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white shadow-md transition-all cursor-pointer"
                  title="Scroll left"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}

              {/* Scrollable Chips Container with Mousewheel & Touch Pan (Zero visible scrollbar) */}
              <div
                ref={suggestionsRef}
                onWheel={handleSuggestionsWheel}
                onScroll={checkScrollability}
                className={`overflow-x-auto scroll-smooth flex items-center gap-1.5 py-1 touch-pan-x chat-suggestions-container no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 transition-all ${
                  canScrollLeft && canScrollRight
                    ? 'px-7 sm:px-8'
                    : canScrollLeft
                    ? 'pl-7 pr-3 sm:pl-8 sm:pr-4'
                    : canScrollRight
                    ? 'pl-3 pr-7 sm:pl-4 sm:pr-8'
                    : 'px-3 sm:px-4'
                }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-400 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Right Scroll Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollSuggestions('right')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white shadow-md transition-all cursor-pointer"
                  title="Scroll right"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-2.5 sm:p-3.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 border-t border-slate-800/90 bg-slate-900/90 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Mohit's systems, code, or metrics..."
                disabled={isTyping}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none transition-colors min-w-0"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 sm:p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-40 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </aside>
  );
};
