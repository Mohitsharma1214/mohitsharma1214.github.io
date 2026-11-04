import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Bot,
  Send,
  Search,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  Filter,
  AlertCircle,
  Database,
  CheckCircle2,
  X,
  User,
  Sparkles,
} from 'lucide-react';
import { InquiryService } from '../../services/inquiryService';
import type { Inquiry } from '../../services/inquiryService';

export const InquiriesAdminManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'ai_agent' | 'contact_form'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Load inquiries
  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await InquiryService.getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Copy email to clipboard
  const handleCopyEmail = (email: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Update Status
  const handleStatusChange = async (
    id: string,
    status: 'unread' | 'read' | 'replied',
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    await InquiryService.updateStatus(id, status);
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    if (activeInquiry && activeInquiry.id === id) {
      setActiveInquiry((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Delete Inquiry
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    await InquiryService.deleteInquiry(id);
    setInquiries((prev) => prev.filter((item) => item.id !== id));
    if (activeInquiry?.id === id) {
      setActiveInquiry(null);
    }
  };

  // Mark all unread as read
  const handleMarkAllRead = async () => {
    const unread = inquiries.filter((i) => i.status === 'unread');
    for (const item of unread) {
      await InquiryService.updateStatus(item.id, 'read');
    }
    setInquiries((prev) =>
      prev.map((item) => ({ ...item, status: item.status === 'unread' ? 'read' : item.status }))
    );
  };

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Source filter
      if (selectedSource !== 'all' && item.source !== selectedSource) return false;
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchMessage = item.message.toLowerCase().includes(q);
        const matchTopic = item.topic?.toLowerCase().includes(q);
        return matchName || matchEmail || matchMessage || matchTopic;
      }
      return true;
    });
  }, [inquiries, selectedSource, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const unread = inquiries.filter((i) => i.status === 'unread').length;
    const aiLeads = inquiries.filter((i) => i.source === 'ai_agent').length;
    const formMessages = inquiries.filter((i) => i.source === 'contact_form').length;
    return { total, unread, aiLeads, formMessages };
  }, [inquiries]);

  // Format date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const copySql = () => {
    const sql = `-- Supabase Table for Portfolio Inquiries & AI Agent Leads
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Website Visitor',
    email TEXT NOT NULL,
    topic TEXT DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'ai_agent',
    status TEXT NOT NULL DEFAULT 'unread',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone can insert inquiries" 
ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public read fallback" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated users have full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Only site owner can read and manage inquiries" ON public.inquiries;
CREATE POLICY "Only site owner can read and manage inquiries" 
ON public.inquiries FOR ALL TO authenticated USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com') WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');`;

    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
              Inbound Leads &amp; Telemetry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 flex items-center gap-2">
            AI Agent Leads &amp; Contact Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            All leads captured by <strong>Mohit&apos;s Neural Twin</strong> and contact form submissions are aggregated here. Click any sender to copy their email or launch a direct pre-addressed response.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSqlModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="View or copy Supabase cloud database schema"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Supabase Cloud Sync</span>
          </button>

          <button
            type="button"
            onClick={loadInquiries}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {stats.unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase flex items-center justify-between">
            <span>Total Leads</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950 mt-1">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase flex items-center justify-between">
            <span>Unread Attention</span>
            <AlertCircle className={`w-4 h-4 ${stats.unread > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold mt-1 ${stats.unread > 0 ? 'text-rose-600' : 'text-slate-950'}`}>
            {stats.unread}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase flex items-center justify-between">
            <span>AI Copilot Leads</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{stats.aiLeads}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-mono text-slate-500 uppercase flex items-center justify-between">
            <span>Contact Form</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{stats.formMessages}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by email, name, or message snippet..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Source:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSource('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSource === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedSource('ai_agent')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSource === 'ai_agent'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Agent
          </button>
          <button
            type="button"
            onClick={() => setSelectedSource('contact_form')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSource === 'contact_form'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Form
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Status:</span>
          {(['all', 'unread', 'read', 'replied'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`capitalize px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? st === 'unread'
                    ? 'bg-rose-600 text-white'
                    : st === 'replied'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inquiries Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-500">Loading incoming inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Inquiries Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || selectedSource !== 'all' || selectedStatus !== 'all'
                ? 'No leads match your current search or filter combination.'
                : 'Incoming messages from the AI Copilot and Contact Form will appear here with one-click direct email response actions.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile Cards List (< md screens) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredInquiries.map((item) => {
                const isUnread = item.status === 'unread';
                const isReplied = item.status === 'replied';

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveInquiry(item)}
                    className={`p-4 space-y-3 cursor-pointer transition-colors active:bg-slate-50 ${
                      isUnread ? 'bg-blue-50/25' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isUnread
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isReplied
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.source === 'ai_agent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                            <Bot className="w-3 h-3 text-purple-600" />
                            AI Copilot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            <Send className="w-3 h-3 text-blue-600" />
                            Form
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                        <span>{item.name || 'Anonymous Visitor'}</span>
                        <a
                          href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(
                            item.topic || 'Your inquiry on Mohit Sharma Portfolio'
                          )}&body=Hi ${encodeURIComponent(
                            item.name || 'there'
                          )},\n\nThank you for reaching out via my portfolio.\n\nBest regards,\nMohit Sharma\nAI Systems & Computer Vision Engineer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(item.id, 'replied');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-2xs"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Reply</span>
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600 font-mono text-xs">
                        <span>{item.email}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyEmail(item.email, item.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700"
                        >
                          {copiedEmailId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.message}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Sender / Contact</th>
                    <th className="py-3.5 px-4 font-semibold">Source</th>
                    <th className="py-3.5 px-4 font-semibold">Topic &amp; Message Preview</th>
                    <th className="py-3.5 px-4 font-semibold">Time</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Direct Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInquiries.map((item) => {
                    const isUnread = item.status === 'unread';
                    const isReplied = item.status === 'replied';

                    return (
                    <tr
                      key={item.id}
                      onClick={() => setActiveInquiry(item)}
                      className={`group hover:bg-slate-50/70 cursor-pointer transition-colors ${
                        isUnread ? 'bg-blue-50/20 font-medium' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isUnread
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isReplied
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Contact / Email */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 min-w-[200px]">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.name || 'Anonymous Visitor'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{item.email}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyEmail(item.email, item.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Copy Email"
                            >
                              {copiedEmailId === item.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {item.source === 'ai_agent' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
                            <Bot className="w-3 h-3 text-purple-600" />
                            AI Copilot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                            <Send className="w-3 h-3 text-blue-600" />
                            Contact Form
                          </span>
                        )}
                      </td>

                      {/* Topic & Message Snippet */}
                      <td className="py-4 px-4">
                        <div className="max-w-[340px] space-y-1">
                          <span className="inline-block text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate max-w-full">
                            {item.topic || 'General Inquiry'}
                          </span>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed text-xs">
                            {item.message}
                          </p>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>

                      {/* Direct Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Direct Email Action */}
                          <a
                            href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(
                              item.topic || 'Your inquiry on Mohit Sharma Portfolio'
                            )}&body=Hi ${encodeURIComponent(
                              item.name || 'there'
                            )},\n\nThank you for reaching out via my portfolio.\n\nBest regards,\nMohit Sharma\nAI Systems & Computer Vision Engineer`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(item.id, 'replied');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                            title={`Reply directly to ${item.email}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>

                          {/* Quick Status toggle */}
                          <button
                            type="button"
                            onClick={(e) =>
                              handleStatusChange(
                                item.id,
                                isUnread ? 'read' : isReplied ? 'unread' : 'replied',
                                e
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title={isUnread ? 'Mark as Read' : 'Cycle Status'}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${isReplied ? 'text-emerald-600' : 'text-slate-400'}`}
                            />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeInquiry && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-7 md:p-8 space-y-5 sm:space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        activeInquiry.status === 'unread'
                          ? 'bg-rose-100 text-rose-700'
                          : activeInquiry.status === 'replied'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {activeInquiry.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(activeInquiry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-950">
                    {activeInquiry.topic || 'Inbound Inquiry'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInquiry(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sender Details Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Sender Name</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activeInquiry.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Email Address</div>
                  <div className="font-mono text-blue-600 font-semibold mt-0.5 flex items-center gap-1.5">
                    <span>{activeInquiry.email}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(activeInquiry.email, 'modal', e)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Copy Email"
                    >
                      {copiedEmailId === 'modal' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Inquiry Source</div>
                  <div className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                    {activeInquiry.source === 'ai_agent' ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        <span>Mohit&apos;s Neural Twin Copilot</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        <span>Direct Contact Form</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Status</div>
                  <div className="mt-0.5">
                    <select
                      value={activeInquiry.status}
                      onChange={(e) =>
                        handleStatusChange(
                          activeInquiry.id,
                          e.target.value as 'unread' | 'read' | 'replied'
                        )
                      }
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-500 uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Message Content</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeInquiry.message}
                </div>
              </div>

              {/* Bot Context / Metadata if available */}
              {activeInquiry.metadata && Object.keys(activeInquiry.metadata).length > 0 && (
                <div className="space-y-1.5 bg-purple-50/50 border border-purple-100 rounded-2xl p-4 text-xs">
                  <div className="font-mono text-purple-800 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Copilot Context</span>
                  </div>
                  {activeInquiry.metadata.botReply && (
                    <div className="text-purple-900/80 text-[11px] leading-relaxed mt-1">
                      <strong>AI Reply Given:</strong> &ldquo;{activeInquiry.metadata.botReply}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDelete(activeInquiry.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors order-2 sm:order-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Inquiry</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => setActiveInquiry(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex-1 sm:flex-initial"
                  >
                    Close
                  </button>

                  <a
                    href={`mailto:${activeInquiry.email}?subject=Re: ${encodeURIComponent(
                      activeInquiry.topic || 'Your inquiry on Mohit Sharma Portfolio'
                    )}&body=Hi ${encodeURIComponent(
                      activeInquiry.name || 'there'
                    )},\n\nThank you for reaching out via my portfolio.\n\nBest regards,\nMohit Sharma\nAI Systems & Computer Vision Engineer`}
                    onClick={() => handleStatusChange(activeInquiry.id, 'replied')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex-1 sm:flex-initial"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Reply</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Supabase SQL Setup Modal */}
      <AnimatePresence>
        {sqlModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                      Supabase Cloud Sync Table
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-950">
                    Enable Multi-Device Cloud Sync
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All inquiries are automatically buffered and saved in this browser. To sync inquiries across your phone, laptop, and all devices in Supabase, run this in your Supabase SQL Editor:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-56 leading-relaxed">
                <pre>{`-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Website Visitor',
    email TEXT NOT NULL,
    topic TEXT DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'ai_agent',
    status TEXT NOT NULL DEFAULT 'unread',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiries" 
ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public read fallback" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated users have full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Only site owner can read and manage inquiries" ON public.inquiries;
CREATE POLICY "Only site owner can read and manage inquiries" 
ON public.inquiries FOR ALL TO authenticated USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com') WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');`}</pre>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href="https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={copySql}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  {sqlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
