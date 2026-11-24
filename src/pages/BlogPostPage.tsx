import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Check, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { BlogService } from '../services/blogService';
import type { BlogFull } from '../services/blogService';
import { PERSONAL_INFO } from '../data/portfolioData';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { AiBlogRecommendations } from '../components/AiBlogRecommendations';

export const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    BlogService.getBlogById(id).then((result) => {
      setBlog(result);
      setLoading(false);
      if (result) {
        document.title = `${result.title} | Mohit Sharma`;
      }
    });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="aspect-[16/9] bg-slate-200 rounded-3xl w-full" />
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-32 bg-slate-100 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Blog Post Not Found</h1>
        <p className="text-sm text-slate-600">
          The requested article could not be located in the database. It may have been unpublished or moved.
        </p>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Blogs</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10"
    >
      {/* Navigation & Share Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Technical Blogs</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 transition-all shadow-xs"
          title="Copy link to this blog post"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Link</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Cover Graphic */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/9] border border-slate-200 bg-slate-100 shadow-xs">
        <img
          src={blog.coverImage || `/assets/blogs/${blog.id}.png`}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-lg shadow-xs border border-slate-200/80">
            {blog.category}
          </span>
        </div>
      </div>

      {/* Blog Article Header */}
      <header className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
          <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-semibold border border-blue-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{blog.status}</span>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{blog.readTime}</span>
          </span>
          {blog.publishDate && (
            <>
              <span className="text-slate-300">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{blog.publishDate}</span>
              </span>
            </>
          )}
        </div>

        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight break-words">
          {blog.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          {blog.subtitle}
        </p>

        {/* Author Byline */}
        <div className="flex items-center gap-3.5 pt-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            MS
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{PERSONAL_INFO.name}</div>
            <div className="text-[11px] font-mono text-slate-500">AI Engineer &bull; Production Systems</div>
          </div>
        </div>
      </header>

      {/* Main Formatted Markdown Content */}
      <div className="max-w-none">
        <MarkdownRenderer content={blog.contentMarkdown} />
      </div>

      {/* High-Impact AI Architect & Engineering Availability CTA Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              Full-Time AI Engineering Availability
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Need a Production-Grade LLM, RAG, or Computer Vision Pipeline?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Mohit Sharma is an AI Systems Specialist delivering &lt;120ms P95 latency pipelines and registered edge IP. Actively interviewing for full-time AI Engineer, Computer Vision, and MLOps roles worldwide.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-md text-center"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:mohitxsharma09@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all text-center"
            >
              <span>Email Direct</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quality Verification Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Engineering Telemetry</span>
          </div>
          <p className="text-xs text-slate-600">
            This breakdown is derived from verified production systems and registered intellectual property.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0"
        >
          <span>Explore Case Studies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Dynamic AI Blog Recommendations (2-4 Personalized Articles) */}
      <AiBlogRecommendations
        currentBlogId={blog.id}
        currentBlogTitle={blog.title}
        currentBlogCategory={blog.category}
      />
    </motion.article>
  );
};
