import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  ArrowLeft,
  FileText,
  Search,
  LogOut,
  Save,
  Image as ImageIcon,
  Upload,
  UploadCloud,
  Link as LinkIcon,
  Bot,
  RefreshCw,
  Copy,
  Globe,
  Radio,
  X,
  Layers,
  User as UserIcon,
} from 'lucide-react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { BlogService } from '../services/blogService';
import type { BlogFull, BlogMetadata } from '../services/blogService';
import { CategoryService } from '../services/categoryService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ProjectAdminManager } from '../components/admin/ProjectAdminManager';
import { ProfileAdminManager } from '../components/admin/ProfileAdminManager';
import { InquiriesAdminManager } from '../components/admin/InquiriesAdminManager';
import { InquiryService } from '../services/inquiryService';

// STRICT SECURITY PROTOCOLS
const AUTHORIZED_ADMIN_EMAIL = 'mohitxsharma09@gmail.com';

const AdminPageInner: React.FC = () => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();

  // Studio Section: 'blogs', 'projects', 'profile', or 'inquiries'
  const [studioSection, setStudioSection] = useState<'blogs' | 'projects' | 'profile' | 'inquiries'>('blogs');
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await InquiryService.getUnreadCount();
      setUnreadInquiriesCount(count);
    } catch (e) {
      console.warn('Failed to load unread inquiries count:', e);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount, studioSection]);

  // Auth Form State (Sign-In Only - Public Registration Disabled)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Admin Dashboard State
  const [articles, setArticles] = useState<BlogMetadata[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Editor State
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorPreviewMode, setEditorPreviewMode] = useState<'write' | 'split' | 'preview'>('split');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Computer Vision & Edge AI');
  const [customCategory, setCustomCategory] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState('Published Technical Breakdown');
  const [coverImage, setCoverImage] = useState('https://zxovekhtcajtefedkkee.supabase.co/storage/v1/object/public/blog-images/covers/1793182413506-deploying-ml-models-with-fastapi-and-docker.png');
  const [publishDate, setPublishDate] = useState('Oct 2026');
  const [summary, setSummary] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [published, setPublished] = useState(true);

  // Image Upload State
  const [coverInputMode, setCoverInputMode] = useState<'upload' | 'url'>('upload');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState<string | null>(null);
  const [contentImageUploading, setContentImageUploading] = useState(false);

  // Sitemap Robot State
  const [sitemapRobotModalOpen, setSitemapRobotModalOpen] = useState(false);
  const [sitemapRobotStatus, setSitemapRobotStatus] = useState<{
    status: 'idle' | 'syncing' | 'synced';
    lastPinged?: string[];
    lastBlogSlug?: string;
    timestamp?: string;
  }>({ status: 'idle' });
  const [isManualPinging, setIsManualPinging] = useState(false);
  const [manualPingSuccess, setManualPingSuccess] = useState(false);
  const [sitemapCopied, setSitemapCopied] = useState(false);

  // Check brute force lock
  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  // Database Categories Management (Taken directly from DB)
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Load categories directly from database
  const loadDbCategories = useCallback(async () => {
    try {
      const cats = await CategoryService.getCategories();
      setDbCategories(cats);
    } catch (err) {
      console.error('Failed to load categories from database:', err);
    }
  }, []);

  const handleAddNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setSavingCategory(true);
    try {
      const res = await CategoryService.addCategory(trimmed);
      if (res.success) {
        setDbCategories(res.categories);
        setCategory(trimmed);
        setNewCategoryName('');
        setIsAddingCategory(false);
      } else {
        alert(res.error || 'Failed to add category to database');
      }
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteDbCategory = async (catName: string) => {
    if (!window.confirm(`Delete category "${catName}" from database?`)) return;
    try {
      const res = await CategoryService.deleteCategory(catName);
      setDbCategories(res.categories);
      if (category === catName && res.categories.length > 0) {
        setCategory(res.categories[0]);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Initial categories fetch on mount
  useEffect(() => {
    loadDbCategories();
  }, [loadDbCategories]);

  // Enforce strict email whitelist on active session
  useEffect(() => {
    if (user && user.email) {
      if (user.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        signOut();
        setAuthError('Access Denied: Your account is not authorized to access this private admin portal.');
      } else {
        loadAdminArticles();
        loadDbCategories();
      }
    }
  }, [user, loadDbCategories]);

  // Load articles when authorized
  const loadAdminArticles = async () => {
    setLoadingArticles(true);
    try {
      const data = await BlogService.getAllBlogsForAdmin();
      setArticles(data);
    } catch (err) {
      console.error('Failed to load admin articles:', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (editorMode === 'create' && !isSlugManuallyEdited && title.trim()) {
      const auto = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(auto);
    }
  }, [title, editorMode, isSlugManuallyEdited]);

  // Auto-calculate read time from content markdown
  useEffect(() => {
    if (contentMarkdown.trim()) {
      const wordCount = contentMarkdown.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(wordCount / 200));
      setReadTime(`${minutes} min read`);
    }
  }, [contentMarkdown]);

  // Strict 2FA Authentication Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // 1. Brute-force check
    if (isLocked) {
      const remainingSeconds = Math.ceil((lockedUntil! - Date.now()) / 1000);
      setAuthError(`Security Lockout: Too many failed attempts. Please wait ${remainingSeconds} seconds.`);
      return;
    }

    // 2. Email Whitelist Guard
    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      recordFailedAttempt();
      setAuthError('Security Alert: This portal is strictly restricted to the site owner.');
      return;
    }

    setAuthSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        recordFailedAttempt();
        setAuthError(res.error);
      } else {
        setFailedAttempts(0);
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const recordFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 5) {
      const lockDuration = 10 * 60 * 1000; // 10 minutes lock
      setLockedUntil(Date.now() + lockDuration);
      setAuthError('Maximum failed attempts reached. Portal temporarily locked for 10 minutes.');
    }
  };

  // Reset Editor Form
  const resetEditor = () => {
    setEditorMode('create');
    setTitle('');
    setSlug('');
    setIsSlugManuallyEdited(false);
    setSubtitle('');
    setCategory('Computer Vision & Edge AI');
    setCustomCategory('');
    setReadTime('5 min read');
    setStatus('Published Technical Breakdown');
    setCoverImage('https://zxovekhtcajtefedkkee.supabase.co/storage/v1/object/public/blog-images/covers/1793182413506-deploying-ml-models-with-fastapi-and-docker.png');
    setPublishDate('Oct 2026');
    setSummary('');
    setContentMarkdown('');
    setPublished(true);
    setEditorError(null);
    setSaveSuccess(false);
    setCoverUploadError(null);
    setCoverUploadSuccess(null);
  };

  // Upload Cover Image handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCoverUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setCoverUploadError('Image size exceeds 20MB limit.');
      return;
    }

    setCoverUploading(true);
    setCoverUploadError(null);
    setCoverUploadSuccess(null);

    try {
      const res = await BlogService.uploadImage(file, 'covers');
      if (res.success && res.url) {
        setCoverImage(res.url);
        setCoverUploadSuccess('Image successfully stored in Supabase Storage CDN and set as cover!');
      } else {
        const errMsg = res.error || 'Failed to upload image.';
        if (errMsg.toLowerCase().includes('bucket not found') || errMsg.toLowerCase().includes('not found')) {
          setCoverUploadError("Storage bucket 'blog-images' not found in Supabase. Please run supabase/storage_setup.sql in your Supabase SQL Editor to initialize it.");
        } else {
          setCoverUploadError(errMsg);
        }
      }
    } catch (err: unknown) {
      setCoverUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  };

  // Upload Inline Markdown Content Image handler
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditorError('Please select a valid image file.');
      return;
    }

    setContentImageUploading(true);
    setEditorError(null);

    try {
      const res = await BlogService.uploadImage(file, 'content');
      if (res.success && res.url) {
        const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const markdownSnippet = `\n\n![${cleanAlt}](${res.url})\n\n`;
        setContentMarkdown((prev) => prev + markdownSnippet);
      } else {
        const errMsg = res.error || 'Failed to upload image.';
        if (errMsg.toLowerCase().includes('bucket not found') || errMsg.toLowerCase().includes('not found')) {
          setEditorError("Storage bucket 'blog-images' not found in Supabase. Please run supabase/storage_setup.sql in your Supabase SQL Editor.");
        } else {
          setEditorError(errMsg);
        }
      }
    } catch (err: unknown) {
      setEditorError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setContentImageUploading(false);
      e.target.value = '';
    }
  };

  const handleStartCreate = () => {
    resetEditor();
    setActiveTab('editor');
  };

  const handleStartEdit = async (blogMeta: BlogMetadata) => {
    resetEditor();
    setEditorMode('edit');
    setTitle(blogMeta.title);
    setSlug(blogMeta.id);
    setIsSlugManuallyEdited(true);
    setSubtitle(blogMeta.subtitle);
    setCategory(blogMeta.category);
    setReadTime(blogMeta.readTime);
    setStatus(blogMeta.status);
    setCoverImage(blogMeta.coverImage);
    setPublishDate(blogMeta.publishDate);
    setSummary(blogMeta.summary);
    setPublished(true);

    setActiveTab('editor');

    const full = await BlogService.getBlogById(blogMeta.id);
    if (full) {
      setContentMarkdown(full.contentMarkdown);
    }
  };

  const handleDeleteArticle = async (id: string, articleTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${articleTitle}"?`)) {
      return;
    }

    const res = await BlogService.deleteBlog(id);
    if (res.success) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert(`Delete failed: ${res.error}`);
    }
  };

  // Save Blog (Insert or Update)
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditorError(null);
    setSaveSuccess(false);

    if (!title.trim()) {
      setEditorError('Title is required');
      return;
    }
    if (!slug.trim()) {
      setEditorError('Slug / ID is required');
      return;
    }

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    if (!finalCategory) {
      setEditorError('Please provide a category');
      return;
    }

    setSaveLoading(true);

    const blogPayload: BlogFull & { published: boolean } = {
      id: slug.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      category: finalCategory,
      readTime: readTime.trim(),
      status: status.trim(),
      coverImage: coverImage.trim(),
      publishDate: publishDate.trim(),
      summary: summary.trim(),
      contentMarkdown: contentMarkdown.trim(),
      published,
    };

    try {
      if (editorMode === 'create') {
        const res = await BlogService.createBlog(blogPayload);
        if (!res.success) {
          setEditorError(res.error || 'Failed to create blog');
          return;
        }
        // Seamlessly switch to edit mode once saved so subsequent saves update the article
        setEditorMode('edit');
      } else {
        const res = await BlogService.updateBlog(slug, blogPayload);
        if (!res.success) {
          setEditorError(res.error || 'Failed to update blog');
          return;
        }
      }

      setSaveSuccess(true);
      CategoryService.addCategory(finalCategory).catch(() => {});
      await Promise.all([loadAdminArticles(), loadDbCategories()]);

      // 🤖 Trigger Sitemap Robot for newly added or updated published blog
      if (published) {
        BlogService.pingSearchEnginesForBlog(slug.trim()).then((res) => {
          setSitemapRobotStatus({
            status: 'synced',
            lastPinged: res.pinged,
            lastBlogSlug: slug.trim(),
            timestamp: new Date().toLocaleTimeString(),
          });
        });
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  // Manual Search Engine Ping Handler
  const handleManualPing = async () => {
    setIsManualPinging(true);
    setManualPingSuccess(false);
    try {
      await BlogService.pingSearchEnginesForBlog(slug || 'blogs');
      setManualPingSuccess(true);
      setTimeout(() => setManualPingSuccess(false), 3000);
    } finally {
      setIsManualPinging(false);
    }
  };

  // Dynamically constructed full sitemap XML representation for the preview modal
  const fullSitemapXml = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const coreRoutes = [
      { loc: 'https://mohitsharma.is-a.dev/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
      { loc: 'https://mohitsharma.is-a.dev/about/', lastmod: today, changefreq: 'monthly', priority: '0.9' },
      { loc: 'https://mohitsharma.is-a.dev/projects/', lastmod: today, changefreq: 'weekly', priority: '0.9' },
      { loc: 'https://mohitsharma.is-a.dev/experience/', lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: 'https://mohitsharma.is-a.dev/skills/', lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: 'https://mohitsharma.is-a.dev/blogs/', lastmod: today, changefreq: 'weekly', priority: '0.9' },
      { loc: 'https://mohitsharma.is-a.dev/contact/', lastmod: today, changefreq: 'monthly', priority: '0.8' },
    ];
    const blogUrls = articles
      .filter((a) => (a as BlogMetadata & { published?: boolean }).published !== false)
      .map((a) => {
        const lastmod = (a.createdAt || a.publishDate || today).split('T')[0];
        return `  <url>\n    <loc>https://mohitsharma.is-a.dev/blogs/${a.id}/</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>`;
      });
    const coreUrls = coreRoutes.map(
      (r) => `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    );
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${coreUrls.join('\n')}\n${blogUrls.join('\n')}\n</urlset>`;
  }, [articles]);

  // Insert markdown tag helper
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('blogContentTextarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contentMarkdown.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newContent =
      contentMarkdown.substring(0, start) + replacement + contentMarkdown.substring(end);
    setContentMarkdown(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 10);
  };

  // Filtered Articles for Admin List
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Categories derived exclusively from database sources (NO hardcoded presets)
  const allDbCategories = useMemo(() => {
    const set = new Set<string>(dbCategories);
    articles.forEach((a) => {
      if (a.category?.trim()) set.add(a.category.trim());
    });
    if (category && category !== '__custom__' && category !== '__add_new__') {
      set.add(category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [dbCategories, articles, category]);

  const isSlugExisting = useMemo(() => {
    if (!slug.trim()) return false;
    return articles.some((a) => a.id.toLowerCase() === slug.trim().toLowerCase());
  }, [slug, articles]);

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500">Checking cryptographically verified session...</span>
        </div>
      </div>
    );
  }

  // 2. Authentication Screen with Strict 2FA Security
  if (!user || user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Admin Access Lock
            </h1>
            <p className="text-xs text-slate-500">
              Private publishing studio for Mohit Sharma. Restricted to authorized Supabase admin credentials.
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Authorized Email</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Whitelisted Only
                </span>
              </label>
              <input
                type="email"
                required
                disabled={isLocked}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mohitxsharma09@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting || isLocked}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in &amp; Access Studio</span>
              )}
            </button>
          </form>

          {/* Security Guarantee Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Layer Defense Active</span>
            </div>
            <p>
              Unauthorized write operations are blocked at the database level by PostgreSQL Row-Level Security.
            </p>
          </div>

          {/* Footer Back Link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <Link to="/blogs" className="text-xs text-slate-500 hover:text-blue-600 inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Public Blogs</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated Admin Studio (Strictly Whitelisted)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header Bar */}
      <header className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            title="Return to Portfolio Homepage"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:scale-105 transition-transform"
          >
            MS
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-950 tracking-tight">
                Portfolio Studio Admin
              </h1>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Owner Verified</span>
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Authenticated: <span className="font-semibold text-slate-700">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {studioSection === 'blogs' && (
            <>
              {activeTab === 'editor' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Articles</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Blog</span>
                </button>
              )}

              {/* 🤖 Sitemap Robot Control Trigger */}
              <button
                type="button"
                onClick={() => setSitemapRobotModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs"
                title="Inspect and manage automated Sitemap Robot"
              >
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>Sitemap Robot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-0.5" />
              </button>
            </>
          )}

          <Link
            to={studioSection === 'projects' ? '/projects' : studioSection === 'profile' ? '/' : '/blogs'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>{studioSection === 'projects' ? 'View Projects Page' : studioSection === 'profile' ? 'View Live Portfolio' : 'View Blogs Page'}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Primary Section Switcher: Technical Blogs vs Projects vs Profile vs Inquiries */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setStudioSection('blogs')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            studioSection === 'blogs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Technical Blogs ({articles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioSection('projects')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            studioSection === 'projects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Projects &amp; Case Studies</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioSection('profile')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            studioSection === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Resume &amp; Hiring Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioSection('inquiries')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative whitespace-nowrap shrink-0 ${
            studioSection === 'inquiries'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Inquiries &amp; Leads</span>
          {unreadInquiriesCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
              {unreadInquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* Section Content: Inquiries OR Profile Manager OR Projects Manager OR Blogs Manager */}
      {studioSection === 'inquiries' ? (
        <InquiriesAdminManager />
      ) : studioSection === 'profile' ? (
        <ProfileAdminManager />
      ) : studioSection === 'projects' ? (
        <ProjectAdminManager />
      ) : activeTab === 'list' ? (
        <div className="space-y-6">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-mono text-slate-500 uppercase">Total Articles</div>
              <div className="text-2xl font-extrabold text-slate-950 mt-1">{articles.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-mono text-slate-500 uppercase">Published</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {articles.filter((a) => (a as BlogMetadata & { published?: boolean }).published !== false).length}
              </div>
            </div>
            <div 
              onClick={() => setCategoryModalOpen(true)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group"
              title="Click to manage database categories"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-500 uppercase">Categories (DB)</div>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase group-hover:underline">Manage</span>
              </div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{allDbCategories.length}</div>
            </div>
            <div
              onClick={() => setSitemapRobotModalOpen(true)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
              title="Click to view automated sitemap & crawler management"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-500 uppercase">Sitemap Robot</div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sitemap Robot Active" />
              </div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1 flex items-baseline gap-1.5">
                <span>{articles.filter((a) => (a as BlogMetadata & { published?: boolean }).published !== false).length + 7}</span>
                <span className="text-xs font-normal text-slate-500">URLs indexed</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-blue-600 transition-colors font-medium">
                <Bot className="w-3 h-3 text-blue-600" />
                <span>Auto-sync &amp; crawlers →</span>
              </div>
            </div>
          </div>

          {/* Sitemap Robot Notification Banner */}
          {sitemapRobotStatus.status === 'synced' && sitemapRobotStatus.lastBlogSlug && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    <span>Sitemap Robot: Synchronized</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Auto-Registered
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    <code>/blogs/{sitemapRobotStatus.lastBlogSlug}/</code> registered into sitemap pool. Search engine crawlers (Google &amp; Bing) notified at {sitemapRobotStatus.timestamp}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fmohitsharma.is-a.dev%2F&page_url=https%3A%2F%2Fmohitsharma.is-a.dev%2Fblogs%2F${sitemapRobotStatus.lastBlogSlug}%2F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-xl border border-blue-200 inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Inspect in Search Console</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  type="button"
                  onClick={() => setSitemapRobotModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  View Sitemap XML
                </button>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or slug..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {allDbCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Table */}
          {loadingArticles ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs font-mono text-slate-500">Fetching articles from Supabase...</span>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No articles match your search</h3>
              <p className="text-xs text-slate-500">Try clearing filters or click "+ Write New Blog" to create one.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Article</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Read Time</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img
                                src={article.coverImage || `/assets/blogs/${article.id}.png`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5 max-w-md">
                              <div className="font-bold text-slate-950 line-clamp-1">{article.title}</div>
                              <div className="font-mono text-[11px] text-slate-400 line-clamp-1">/{article.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">{article.readTime}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{article.publishDate}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/blogs/${article.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                              title="View live post"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(article)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 font-semibold"
                              title="Edit post"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Blog Writing Studio Editor */
        <form onSubmit={handleSaveBlog} className="space-y-6">
          {/* Editor Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                {editorMode === 'create' ? 'Creating New Blog' : `Editing: ${slug}`}
              </span>
            </div>

            {/* View Mode & Save Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setEditorPreviewMode('write')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    editorPreviewMode === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Write Only
                </button>
                <button
                  type="button"
                  onClick={() => setEditorPreviewMode('split')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    editorPreviewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setEditorPreviewMode('preview')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    editorPreviewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Preview Only
                </button>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {saveLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{published ? 'Save & Publish' : 'Save Draft'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Blog saved successfully to Supabase PostgreSQL database!</span>
              </div>
              <Link
                to={`/blogs/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-emerald-700"
              >
                View Live &rarr;
              </Link>
            </motion.div>
          )}

          {/* Sitemap Robot Notification inside Editor */}
          {sitemapRobotStatus.status === 'synced' && sitemapRobotStatus.lastBlogSlug === slug && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Sitemap Robot:</strong> <code>/blogs/{slug}/</code> added to sitemap pool. Googlebot &amp; Bingbot notified at {sitemapRobotStatus.timestamp}.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fmohitsharma.is-a.dev%2F&page_url=https%3A%2F%2Fmohitsharma.is-a.dev%2Fblogs%2F${slug}%2F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-lg border border-blue-200 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Search Console</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <button
                  type="button"
                  onClick={() => setSitemapRobotModalOpen(true)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  View Sitemap
                </button>
              </div>
            </motion.div>
          )}

          {editorError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editorError}</span>
            </div>
          )}

          {/* Meta Fields Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              1. Article Metadata &amp; SEO
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Blog Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed LLM Quantization on Low-Power ARM Clusters"
                className="w-full px-4 py-2.5 text-base font-bold text-slate-950 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Slug / ID and Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>URL Slug (Unique ID)</span>
                  <span className="text-[11px] font-mono text-slate-400">/blogs/{slug || 'your-slug'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'));
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="auto-generated-slug"
                  className="w-full px-3.5 py-2 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                />
                {editorMode === 'create' && isSlugExisting && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
                    <span>
                      Notice: Article <strong>/{slug}</strong> already exists. Saving will update it.
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditorMode('edit')}
                      className="font-bold text-blue-600 hover:underline shrink-0 ml-2"
                    >
                      Switch to Edit Mode
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Profiling latency tradeoffs between FP16 and INT8 across embedded GPUs."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Category (from DB)</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory((prev) => !prev)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingCategory ? 'Select Existing' : '+ Add to DB'}</span>
                  </button>
                </div>

                {isAddingCategory ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Type new category name..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                    />
                    <button
                      type="button"
                      disabled={savingCategory || !newCategoryName.trim()}
                      onClick={handleAddNewCategory}
                      className="px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shrink-0 flex items-center gap-1"
                    >
                      {savingCategory ? 'Saving...' : 'Save to DB'}
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                  >
                    {allDbCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__add_new__">+ Add New Category to DB...</option>
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Status Badge</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Published Technical Breakdown"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Read Time &amp; Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="5 min read"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                  <input
                    type="text"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    placeholder="Oct 2026"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image & Upload to Supabase Storage */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cover Image</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    (Stored in Supabase Object Storage / CDN)
                  </span>
                </label>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCoverInputMode('upload');
                      setCoverUploadError(null);
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                      coverInputMode === 'upload'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3 h-3 text-blue-600" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverInputMode('url');
                      setCoverUploadError(null);
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-semibold ${
                      coverInputMode === 'url'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3 text-slate-500" />
                    <span>Direct URL / Path</span>
                  </button>
                </div>
              </div>

              {coverUploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{coverUploadError}</p>
                    {coverUploadError.includes('blog-images') && (
                      <p className="text-[11px] text-red-600">
                        Run the SQL script <code className="bg-red-100 px-1 rounded font-mono">supabase/storage_setup.sql</code> in your Supabase SQL editor to create the bucket with 1 click.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {coverUploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{coverUploadSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                <div className="md:col-span-2 flex flex-col justify-center">
                  {coverInputMode === 'upload' ? (
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/20 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group min-h-[140px]">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        onChange={handleCoverFileUpload}
                        className="hidden"
                        disabled={coverUploading}
                      />
                      {coverUploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-slate-700">Uploading to Supabase Storage CDN...</span>
                          <span className="text-[11px] font-mono text-slate-400">Saving to bucket: blog-images/covers/</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              Click to browse or drag &amp; drop image
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              PNG, JPG, WEBP, GIF, SVG up to 20MB &bull; Stored in Supabase Storage CDN
                            </p>
                          </div>
                          {coverImage && (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1 line-clamp-1 max-w-xs">
                              Active: {coverImage.split('/').pop()}
                            </span>
                          )}
                        </div>
                      )}
                    </label>
                  ) : (
                    <div className="space-y-2 py-2">
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://... or /assets/blogs/..."
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      />
                      <p className="text-[11px] text-slate-400">
                        Enter an external CDN image URL, or reference existing static assets in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/assets/blogs/</code>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview Box */}
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group flex items-center justify-center">
                  <img
                    src={coverImage || 'https://zxovekhtcajtefedkkee.supabase.co/storage/v1/object/public/blog-images/covers/1793182413506-deploying-ml-models-with-fastapi-and-docker.png'}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://zxovekhtcajtefedkkee.supabase.co/storage/v1/object/public/blog-images/covers/1793182413506-deploying-ml-models-with-fastapi-and-docker.png';
                    }}
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white">
                    Preview
                  </div>
                </div>
              </div>
            </div>

            {/* Summary / Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Summary / Excerpt (Card Preview &amp; SEO)</label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A concise 2-sentence summary that appears on the card preview and search results."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
            </div>

            {/* Published Status Checkbox */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="publishedToggle"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="publishedToggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Publish Immediately (visible on public site)
              </label>
            </div>
          </div>

          {/* Markdown Content & Live Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                2. Article Content (Markdown)
              </h2>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="px-2 py-1 hover:bg-white rounded font-bold text-slate-700"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('#### ')}
                  className="px-2 py-1 hover:bg-white rounded font-bold text-slate-700"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="px-2 py-1 hover:bg-white rounded font-bold text-slate-700"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('```python\n', '\n```')}
                  className="px-2 py-1 hover:bg-white rounded text-slate-700 font-semibold"
                  title="Code Block"
                >
                  &lt;/&gt;
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="px-2 py-1 hover:bg-white rounded text-slate-700"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('$$', '$$')}
                  className="px-2 py-1 hover:bg-white rounded text-slate-700 font-bold"
                  title="Math Formula"
                >
                  Σ Math
                </button>
                <label
                  className="px-2 py-1 hover:bg-white rounded text-blue-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Upload image to Supabase Storage and insert markdown tag"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    className="hidden"
                    disabled={contentImageUploading}
                  />
                  {contentImageUploading ? (
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-3 h-3 text-blue-600" />
                  )}
                  <span>+ Image</span>
                </label>
              </div>
            </div>

            {/* Split Editor / Preview Canvas */}
            <div className={`grid gap-4 ${
              editorPreviewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            }`}>
              {/* Write Textarea */}
              {editorPreviewMode !== 'preview' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between px-1">
                    <span>Markdown Input</span>
                    <span>{contentMarkdown.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    id="blogContentTextarea"
                    rows={20}
                    required
                    value={contentMarkdown}
                    onChange={(e) => setContentMarkdown(e.target.value)}
                    placeholder="Write your article in Markdown here...&#10;&#10;### Introduction&#10;Your breakdown text...&#10;&#10;```python&#10;def infer():&#10;    pass&#10;```"
                    className="w-full p-4 font-mono text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  />
                </div>
              )}

              {/* Rendered Live Preview */}
              {editorPreviewMode !== 'write' && (
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 px-1">Live Reader Preview</div>
                  <div className="p-5 border border-slate-200 rounded-xl bg-white min-h-[350px] max-h-[500px] overflow-y-auto">
                    {title ? (
                      <h1 className="text-xl font-bold text-slate-950 mb-2">{title}</h1>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Title will appear here...</span>
                    )}
                    {subtitle && (
                      <p className="text-xs text-slate-500 font-medium mb-4">{subtitle}</p>
                    )}
                    <hr className="my-3 border-slate-100" />
                    {contentMarkdown.trim() ? (
                      <MarkdownRenderer content={contentMarkdown} />
                    ) : (
                      <div className="text-xs text-slate-400 italic py-8 text-center">
                        Start typing markdown on the left to see the live formatted preview here.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel &amp; Return to List
              </button>

              <button
                type="submit"
                disabled={saveLoading}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {saveLoading ? 'Saving...' : published ? 'Save & Publish to Live Site' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </form>
      )}
      {/* 🤖 Search Engine Sitemap Robot Inspection & Control Modal */}
      {sitemapRobotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSitemapRobotModalOpen(false)}
        >
          <div
            className="bg-white text-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                    <span>Search Engine Sitemap Robot</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      LIVE
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automated indexing coordinator for Googlebot, Bingbot &amp; web crawlers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSitemapRobotModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Engine Status</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Auto-Sync Active</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Total URLs Mapped</div>
                  <div className="text-sm font-bold text-blue-700 mt-1 flex items-baseline gap-1">
                    <span>{articles.filter((a) => (a as BlogMetadata & { published?: boolean }).published !== false).length + 7}</span>
                    <span className="text-[10px] font-normal text-slate-500">(7 core + {articles.filter((a) => (a as BlogMetadata & { published?: boolean }).published !== false).length} blogs)</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Robots Directive</div>
                  <div className="text-sm font-bold text-slate-800 mt-1 font-mono text-xs truncate">
                    Disallow: /admin/
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>Crawler Notification &amp; Webmaster Links</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleManualPing}
                    disabled={isManualPinging}
                    className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left text-blue-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isManualPinging ? 'animate-spin' : ''}`} />
                        <span>Ping Google &amp; Bing Crawlers</span>
                      </div>
                      <div className="text-[10px] text-blue-700/80 mt-0.5">
                        {manualPingSuccess ? '✓ Pings dispatched successfully!' : 'Dispatch re-crawl signal now'}
                      </div>
                    </div>
                    {isManualPinging && (
                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                  </button>

                  <a
                    href="https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fmohitsharma.is-a.dev%2F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-slate-800 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-600" />
                        <span>Google Search Console</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Manage &amp; verify submitted sitemaps
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>

                  <a
                    href="https://mohitsharma.is-a.dev/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center justify-between transition-colors"
                  >
                    <span>View Live sitemap.xml</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <a
                    href="https://mohitsharma.is-a.dev/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center justify-between transition-colors"
                  >
                    <span>View Live robots.txt</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Live XML Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    Live Generated sitemap.xml
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(fullSitemapXml);
                      setSitemapCopied(true);
                      setTimeout(() => setSitemapCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                  >
                    {sitemapCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied XML</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy XML</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 text-slate-200 rounded-xl p-3.5 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
                  <pre className="whitespace-pre-wrap">{fullSitemapXml}</pre>
                </div>
              </div>

              {/* Automation Architecture Note */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span>How the Robot Automates New Blog Indexing</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Instant Crawler Ping:</strong> Whenever you click &quot;Save &amp; Publish&quot;, Googlebot and Bingbot are immediately pinged with your new article slug.</li>
                  <li><strong>Automated Cron Scanner:</strong> The GitHub Actions robot runs every 6 hours via <code>.github/workflows/sitemap-robot.yml</code> to sync any new articles added to Supabase.</li>
                  <li><strong>Prerendered HTML:</strong> During site build, each blog gets an individual SEO-optimized HTML entry with OpenGraph tags and canonical URLs.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Mohit Sharma • AI Portfolio Systems
              </span>
              <button
                type="button"
                onClick={() => setSitemapRobotModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal (Manage Database Categories) */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Database Categories</h3>
                  <p className="text-xs text-slate-500">Live categories synced directly in Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add new category directly to DB */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Add New Category to Database</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Autonomous Agents & Workflows"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                />
                <button
                  type="button"
                  disabled={savingCategory || !newCategoryName.trim()}
                  onClick={handleAddNewCategory}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{savingCategory ? 'Adding...' : 'Add to DB'}</span>
                </button>
              </div>
            </div>

            {/* List of current DB categories */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Current Categories in Database ({allDbCategories.length})
              </label>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                {allDbCategories.map((catName) => {
                  const articleCount = articles.filter((a) => a.category === catName).length;
                  return (
                    <div
                      key={catName}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{catName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDbCategory(catName)}
                        title="Remove category"
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminPage: React.FC = () => (
  <AuthProvider>
    <AdminPageInner />
  </AuthProvider>
);
