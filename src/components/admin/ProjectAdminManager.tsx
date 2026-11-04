import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  Search,
  Save,
  Image as ImageIcon,
  RefreshCw,
  Copy,
  Database,
  Star,
  X,
  CheckCircle2,
  FileCode,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ArrowUpDown,
  Grid,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { ProjectService } from '../../services/projectService';
import { PROJECTS } from '../../data/portfolioData';
import type { ProjectCaseStudy } from '../../data/portfolioData';
import { ProjectCoverImage } from '../ProjectCoverImage';

const SQL_MIGRATION_SCRIPT = `-- SUPABASE DATABASE SCHEMA FOR PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Computer Vision & Edge',
    problem_statement TEXT NOT NULL DEFAULT '',
    solution TEXT NOT NULL DEFAULT '',
    technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    repo_url TEXT,
    demo_url TEXT,
    doc_url TEXT,
    is_proprietary BOOLEAN NOT NULL DEFAULT false,
    cover_image TEXT,
    sections JSONB NOT NULL DEFAULT '{}'::jsonb,
    architecture_diagram_svg TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects (featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects (category);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view all projects" ON public.projects;
CREATE POLICY "Public can view all projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users have full write access to projects" ON public.projects;
DROP POLICY IF EXISTS "Only site owner can manage projects" ON public.projects;
CREATE POLICY "Only site owner can manage projects" ON public.projects FOR ALL TO authenticated USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com') WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');`;

const EMPTY_PROJECT: ProjectCaseStudy = {
  id: '',
  title: '',
  subtitle: '',
  category: 'Computer Vision & Edge',
  problemStatement: '',
  solution: '',
  technologies: ['Python', 'PyTorch'],
  metrics: ['<120ms Latency'],
  featured: false,
  repoUrl: '',
  demoUrl: '',
  docUrl: '',
  isProprietary: false,
  coverImage: '',
  sections: {
    overview: '',
    problem: '',
    myContribution: '',
    architectureDescription: '',
    implementation: '',
    engineeringDecisions: [],
    challengesAndFailureModes: [],
    evaluation: [],
    lessonsLearned: [],
  },
};

export const ProjectAdminManager: React.FC = () => {
  const [projects, setProjects] = useState<ProjectCaseStudy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFromDb, setIsFromDb] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [viewMode, setViewMode] = useState<'reorder' | 'cards'>('reorder');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Editor State
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [currentProject, setCurrentProject] = useState<ProjectCaseStudy>(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState<string>('');
  const [metricsInput, setMetricsInput] = useState<string>('');
  const [decisionsInput, setDecisionsInput] = useState<string>('');
  const [failuresInput, setFailuresInput] = useState<string>('');
  const [evaluationInput, setEvaluationInput] = useState<string>('');
  const [lessonsInput, setLessonsInput] = useState<string>('');
  const [rankInput, setRankInput] = useState<string>('1');
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Image Upload State
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Seeding State
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedSuccessMessage, setSeedSuccessMessage] = useState<string | null>(null);
  const [seedErrorMessage, setSeedErrorMessage] = useState<string | null>(null);

  // SQL Copy Modal / State
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  // Load projects
  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await ProjectService.getAllProjects();
      setProjects(res.projects);
      setIsFromDb(res.isFromDatabase);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [projects, categoryFilter, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Open Create Mode
  const handleStartCreate = () => {
    setCurrentProject({
      ...EMPTY_PROJECT,
      id: `project-${Date.now()}`,
    });
    setTechInput('Python, PyTorch, OpenCV');
    setMetricsInput('<120ms P95 SLA, 99.8% Precision');
    setDecisionsInput('');
    setFailuresInput('');
    setEvaluationInput('');
    setLessonsInput('');
    setRankInput(String(projects.length + 1));
    setEditorError(null);
    setSaveSuccess(false);
    setEditorMode('create');
    setActiveTab('editor');
  };

  // Open Edit Mode
  const handleStartEdit = (project: ProjectCaseStudy) => {
    setCurrentProject(project);
    setTechInput(project.technologies ? project.technologies.join(', ') : '');
    setMetricsInput(project.metrics ? project.metrics.join(', ') : '');
    setDecisionsInput(project.sections?.engineeringDecisions ? project.sections.engineeringDecisions.join('\n') : '');
    setFailuresInput(project.sections?.challengesAndFailureModes ? project.sections.challengesAndFailureModes.join('\n') : '');
    setEvaluationInput(project.sections?.evaluation ? project.sections.evaluation.join('\n') : '');
    setLessonsInput(project.sections?.lessonsLearned ? project.sections.lessonsLearned.join('\n') : '');
    setRankInput(String(project.displayOrder ?? 999));
    setEditorError(null);
    setSaveSuccess(false);
    setEditorMode('edit');
    setActiveTab('editor');
  };

  // Sync latest details from code definition while preserving uploaded screenshot
  const handleSyncFromCode = () => {
    const staticProj = PROJECTS.find((p) => p.id === currentProject.id);
    if (!staticProj) return;

    setCurrentProject({
      ...staticProj,
      coverImage: currentProject.coverImage, // KEEP the uploaded screenshot!
    });
    setTechInput(staticProj.technologies ? staticProj.technologies.join(', ') : '');
    setMetricsInput(staticProj.metrics ? staticProj.metrics.join(', ') : '');
    setDecisionsInput(
      staticProj.sections?.engineeringDecisions
        ? staticProj.sections.engineeringDecisions.join('\n')
        : ''
    );
    setFailuresInput(
      staticProj.sections?.challengesAndFailureModes
        ? staticProj.sections.challengesAndFailureModes.join('\n')
        : ''
    );
    setEvaluationInput(
      staticProj.sections?.evaluation ? staticProj.sections.evaluation.join('\n') : ''
    );
    setLessonsInput(
      staticProj.sections?.lessonsLearned ? staticProj.sections.lessonsLearned.join('\n') : ''
    );
    setRankInput(String(staticProj.displayOrder ?? 999));
  };

  // Core Reorder Logic for both drag-and-drop and manual rank shifts
  const reorderProjects = async (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const currentList = [...projects];
    const sourceIndex = currentList.findIndex((p) => p.id === sourceId);
    const targetIndex = currentList.findIndex((p) => p.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Move item in array
    const [movedItem] = currentList.splice(sourceIndex, 1);
    currentList.splice(targetIndex, 0, movedItem);

    // Re-assign sequential displayOrder (1-indexed)
    const updatedWithOrder = currentList.map((p, idx) => ({
      ...p,
      displayOrder: idx + 1,
    }));

    // Optimistic UI update
    setProjects(updatedWithOrder);
    setOrderMessage(
      `✨ Moved "${movedItem.title}" to Rank #${targetIndex + 1}. Saving to database...`
    );

    const payload = updatedWithOrder.map((p) => ({
      id: p.id,
      displayOrder: p.displayOrder!,
    }));

    const res = await ProjectService.updateProjectsOrder(payload);
    if (res.success) {
      setOrderMessage(`Rank saved: "${movedItem.title}" is now Rank #${targetIndex + 1}!`);
      setTimeout(() => setOrderMessage(null), 3000);
    } else {
      setOrderMessage('Rank updated locally.');
      setTimeout(() => setOrderMessage(null), 3500);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, id: string) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId) return;
    await reorderProjects(sourceId, targetId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Jump to specific numerical rank (1-indexed)
  const handleMoveToRank = async (sourceId: string, newRank: number) => {
    if (isNaN(newRank) || newRank < 1) return;
    const currentList = [...projects];
    const sourceIndex = currentList.findIndex((p) => p.id === sourceId);
    if (sourceIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(currentList.length - 1, newRank - 1));
    if (sourceIndex === targetIndex) return;

    const targetItem = currentList[targetIndex];
    if (targetItem) {
      await reorderProjects(sourceId, targetItem.id);
    }
  };

  // Jump to Top (Rank #1)
  const handleMoveToTop = (sourceId: string) => {
    handleMoveToRank(sourceId, 1);
  };

  // Jump to Bottom (Rank #N)
  const handleMoveToBottom = (sourceId: string) => {
    handleMoveToRank(sourceId, projects.length);
  };

  // Step Move Up / Move Down
  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredProjects.length) return;

    const itemA = filteredProjects[index];
    const itemB = filteredProjects[targetIndex];
    if (itemA && itemB) {
      await reorderProjects(itemA.id, itemB.id);
    }
  };

  // Handle Save
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.title.trim()) {
      setEditorError('Project title is required.');
      return;
    }
    if (!currentProject.id.trim()) {
      setEditorError('Project slug / ID is required.');
      return;
    }

    setSaveLoading(true);
    setEditorError(null);

    const updatedProject: ProjectCaseStudy = {
      ...currentProject,
      displayOrder: Number(rankInput) || 999,
      technologies: techInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      metrics: metricsInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      sections: {
        ...currentProject.sections,
        engineeringDecisions: decisionsInput
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        challengesAndFailureModes: failuresInput
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        evaluation: evaluationInput
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        lessonsLearned: lessonsInput
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
    };

    const res = await ProjectService.upsertProject(updatedProject);
    setSaveLoading(false);

    if (res.success) {
      setSaveSuccess(true);
      await loadProjects();
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('list');
      }, 1200);
    } else {
      setEditorError(res.error || 'Failed to save project to Supabase.');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      const res = await ProjectService.deleteProject(id);
      if (res.success) {
        await loadProjects();
      } else {
        alert(res.error || 'Failed to delete project.');
      }
    }
  };

  // Handle 1-Click Seed to Supabase
  const handleSeedStaticProjects = async () => {
    if (!window.confirm('Sync and seed all current static project case studies to your Supabase PostgreSQL database?')) {
      return;
    }

    setSeeding(true);
    setSeedSuccessMessage(null);
    setSeedErrorMessage(null);

    const res = await ProjectService.seedProjectsFromStatic();
    setSeeding(false);

    if (res.success) {
      setSeedSuccessMessage(`Successfully seeded ${res.seededCount} projects to Supabase database!`);
      await loadProjects();
      setTimeout(() => setSeedSuccessMessage(null), 5000);
    } else {
      setSeedErrorMessage(
        res.error?.includes('Could not find the table')
          ? "Table 'public.projects' was not found in Supabase. Please click 'Copy SQL Migration' below, paste it into your Supabase SQL editor, run it, and click Seed again."
          : res.error || 'Failed to seed projects to database.'
      );
    }
  };

  // Handle Screenshot Upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageUploadError(null);

    const res = await ProjectService.uploadScreenshot(file);
    setImageUploading(false);

    if (res.success && res.url) {
      setCurrentProject((prev) => ({ ...prev, coverImage: res.url }));
    } else {
      setImageUploadError(
        res.error?.includes('bucket')
          ? "Storage bucket 'blog-images' not found. You can also paste an image URL directly."
          : res.error || 'Upload failed'
      );
    }
  };

  // Copy SQL script
  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Seed Status Banner if any */}
      {seedSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{seedSuccessMessage}</span>
          </div>
          <button type="button" onClick={() => setSeedSuccessMessage(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </motion.div>
      )}

      {/* Order Ranking Update Banner */}
      {orderMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-semibold shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>{orderMessage}</span>
          </div>
          <button type="button" onClick={() => setOrderMessage(null)}>
            <X className="w-3.5 h-3.5 text-blue-600 cursor-pointer" />
          </button>
        </motion.div>
      )}

      {seedErrorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs text-red-800"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{seedErrorMessage}</span>
            </div>
            <button type="button" onClick={() => setSeedErrorMessage(null)}>
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{sqlCopied ? 'SQL Copied!' : 'Copy Supabase SQL Schema'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}

      {/* Action Bar & Stats */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Projects &amp; Case Studies CMS</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                  isFromDb
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isFromDb ? 'Supabase Database (Live)' : 'Static Fallback Mode'}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Manage Portfolio Projects &amp; Case Studies
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Add new projects, upload screenshots (or auto-generate modern technical placeholders), toggle featured badges, and sync full 10-part architectural case studies.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            {activeTab === 'editor' ? (
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Editor</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Project</span>
                </button>

                <button
                  type="button"
                  disabled={seeding}
                  onClick={handleSeedStaticProjects}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Populate Supabase projects table with existing static case studies"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${seeding ? 'animate-spin' : ''}`} />
                  <span>{seeding ? 'Seeding to DB...' : 'Sync Projects to Database'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                  title="Copy SQL schema for creating projects table in Supabase"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Total Projects</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5">{projects.length}</div>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Featured on Home</div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-0.5">
              {projects.filter((p) => p.featured).length}
            </div>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Categories</div>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-0.5">{categories.length - 1}</div>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">With Custom Image</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">
              {projects.filter((p) => Boolean(p.coverImage)).length}
            </div>
          </div>
        </div>
      </div>

      {/* Main View: List OR Editor */}
      {activeTab === 'list' ? (
        <div className="space-y-6">
          {/* Search, Filter & View Mode Bar */}
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, ID, or technology..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View Switcher: Reorder Mode vs Cards Grid */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('reorder')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'reorder'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Drag & Drop List (Best for rapid reordering of many projects)"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Drag &amp; Drop Reorder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Visual Cards Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Cards Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Guidance Banner */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 text-blue-700">
                <GripVertical className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Drag &amp; Drop Ranking:</strong> Grab any project by its handle or card to drag and drop it into place. Ranks re-number automatically and save to Supabase.
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 shrink-0">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>

          {/* Projects View */}
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Loading projects from database...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-base font-bold text-slate-900">No projects found</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No projects matched your search criteria. Try clearing the filter or add a new project above.
              </p>
            </div>
          ) : viewMode === 'reorder' ? (
            /* ==============================================================
               MODE 1: Drag-and-Drop Reorder List (High productivity for 10-50+ items)
               ============================================================== */
            <div className="space-y-2.5">
              {filteredProjects.map((project, index) => {
                const isDragging = draggedId === project.id;
                const isTarget = dragOverId === project.id && draggedId !== project.id;
                const currentRank = project.displayOrder ?? index + 1;

                return (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={(e) => handleDragOver(e, project.id)}
                    onDragLeave={(e) => handleDragLeave(e, project.id)}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative bg-white rounded-2xl border transition-all duration-150 p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
                      isDragging
                        ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/20 scale-[0.99]'
                        : isTarget
                        ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/50 scale-[1.01] shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    {/* Drop insertion indicator line */}
                    {isTarget && (
                      <div className="absolute -top-1.5 left-4 right-4 h-1 bg-blue-600 rounded-full shadow-sm animate-pulse pointer-events-none" />
                    )}

                    {/* Left: Drag Handle, Rank Badge, Thumbnail, Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Drag Handle */}
                      <div
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                        title="Click and drag to reorder rank"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Rank Badge */}
                      <div className="shrink-0">
                        <span className="inline-flex items-center justify-center min-w-[58px] px-2.5 py-1 rounded-xl bg-blue-600 text-white font-mono text-xs font-black shadow-2xs">
                          Rank #{currentRank}
                        </span>
                      </div>

                      {/* Thumbnail Mini Preview */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900 shadow-2xs relative hidden sm:flex items-center justify-center">
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-blue-400" />
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-950 truncate max-w-sm group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold shrink-0">
                            {project.category}
                          </span>
                          {project.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold shrink-0">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xl">
                          {project.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Numerical Jump & Step Action Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      {/* Direct Jump Rank Input */}
                      <div
                        className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200"
                        title="Type a rank number and hit Enter to jump directly"
                      >
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Rank</span>
                        <input
                          type="number"
                          min={1}
                          max={projects.length}
                          defaultValue={currentRank}
                          key={`${project.id}-${currentRank}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt((e.target as HTMLInputElement).value, 10);
                              if (!isNaN(val)) {
                                handleMoveToRank(project.id, val);
                              }
                            }
                          }}
                          className="w-11 px-1.5 py-0.5 text-center text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>

                      {/* Quick Position Step Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveToTop(project.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Jump directly to Top (Rank #1)"
                        >
                          <ChevronsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveProject(index, 'up')}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Move Up 1 Rank"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredProjects.length - 1}
                          onClick={() => handleMoveProject(index, 'down')}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Move Down 1 Rank"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredProjects.length - 1}
                          onClick={() => handleMoveToBottom(project.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Jump directly to Bottom"
                        >
                          <ChevronsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit & Delete Buttons */}
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(project)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                          title="Edit project details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id, project.title)}
                          className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ==============================================================
               MODE 2: Draggable Cards Grid (Rich Visual View)
               ============================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => {
                const isDragging = draggedId === project.id;
                const isTarget = dragOverId === project.id && draggedId !== project.id;
                const currentRank = project.displayOrder ?? index + 1;

                return (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={(e) => handleDragOver(e, project.id)}
                    onDragLeave={(e) => handleDragLeave(e, project.id)}
                    onDrop={(e) => handleDrop(e, project.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-3xl border overflow-hidden transition-all duration-150 flex flex-col justify-between group ${
                      isDragging
                        ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/20 scale-[0.98]'
                        : isTarget
                        ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/30 scale-[1.01] shadow-lg'
                        : 'border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-card'
                    }`}
                  >
                    <div>
                      {/* Project Screenshot Thumbnail or High-Tech Placeholder */}
                      <div className="p-3.5 pb-0">
                        <ProjectCoverImage
                          coverImage={project.coverImage}
                          title={project.title}
                          category={project.category}
                          metric={project.metrics?.[0]}
                        />
                      </div>

                      <div className="p-5 space-y-3">
                        {/* Status row with Drag Handle & Rank Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            {/* Grip Drag Handle */}
                            <div
                              className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors"
                              title="Drag card to reorder rank"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold shadow-2xs shrink-0">
                              Rank #{currentRank}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold truncate">
                              {project.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {project.featured && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Featured</span>
                              </span>
                            )}
                            {project.isProprietary && (
                              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                                Production
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h3 className="text-base font-bold text-slate-950 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {project.subtitle}
                          </p>
                        </div>

                        {/* Tech Pills */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {project.technologies?.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {tech}
                            </span>
                          ))}
                          {(project.technologies?.length || 0) > 4 && (
                            <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5">
                              +{(project.technologies?.length || 0) - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveToTop(project.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Jump directly to Top (Rank #1)"
                        >
                          <ChevronsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveProject(index, 'up')}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Move Up 1 Rank"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredProjects.length - 1}
                          onClick={() => handleMoveProject(index, 'down')}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Move Down 1 Rank"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredProjects.length - 1}
                          onClick={() => handleMoveToBottom(project.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                          title="Jump directly to Bottom"
                        >
                          <ChevronsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(project)}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                          title="Edit project details & rank"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id, project.title)}
                          className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Project Editor Form */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-xs space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editorMode === 'create' ? 'Creating New Project' : `Editing: ${currentProject.title}`}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight mt-1.5">
                {editorMode === 'create' ? 'Add Project Case Study' : 'Edit Project Details & Case Study'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PROJECTS.some((p) => p.id === currentProject.id) && (
                <button
                  type="button"
                  onClick={handleSyncFromCode}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Loads the latest case study text and architecture notes from code while preserving your uploaded screenshot"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sync from Code (Keeps Image)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={saveLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {editorError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2.5">
              <div className="flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  {editorError.includes('public.projects') || editorError.includes('PGRST205')
                    ? "Table 'public.projects' was not found in your Supabase database. Run the SQL schema script below in your Supabase SQL Editor to initialize it."
                    : editorError}
                </span>
              </div>
              {(editorError.includes('public.projects') || editorError.includes('PGRST205')) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{sqlCopied ? 'SQL Schema Copied!' : 'Copy 1-Click SQL Schema'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSaveProject} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                1. General Project Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={currentProject.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setCurrentProject((prev) => ({
                        ...prev,
                        title: newTitle,
                        id:
                          editorMode === 'create'
                            ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                            : prev.id,
                      }));
                    }}
                    placeholder="Driver Drowsiness Detection System"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Slug / Unique ID *</label>
                  <input
                    type="text"
                    required
                    disabled={editorMode === 'edit'}
                    value={currentProject.id}
                    onChange={(e) => setCurrentProject((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="driver-drowsiness-detection"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs disabled:opacity-75"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Subtitle / One-Line Summary</label>
                <input
                  type="text"
                  value={currentProject.subtitle}
                  onChange={(e) => setCurrentProject((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Real-time edge computer vision on Raspberry Pi with eye-aspect-ratio tracking and acoustic alerts."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={currentProject.category}
                    onChange={(e) => setCurrentProject((prev) => ({ ...prev, category: e.target.value as ProjectCaseStudy['category'] }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs"
                  >
                    <option value="Computer Vision & Edge">Computer Vision &amp; Edge</option>
                    <option value="LLM & Agentic AI">LLM &amp; Agentic AI</option>
                    <option value="Production Platforms">Production Platforms</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Display Rank (#1 = First)</label>
                  <input
                    type="number"
                    min={1}
                    value={rankInput}
                    onChange={(e) => setRankInput(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentProject.featured}
                      onChange={(e) => setCurrentProject((prev) => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>Featured on Home Page</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentProject.isProprietary || false}
                      onChange={(e) => setCurrentProject((prev) => ({ ...prev, isProprietary: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>Production / Proprietary System</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Screenshot Image Option & Live Preview */}
            <div className="p-5 sm:p-6 bg-slate-50/70 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Project Screenshot / Image (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload a real screenshot or leave empty to automatically display our sleek high-tech engineering schematic placeholder.
                  </p>
                </div>

                {/* Input Mode Toggle */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('upload')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      imageUploadMode === 'upload' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('url')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      imageUploadMode === 'url' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Input controls */}
                <div className="space-y-3">
                  {imageUploadMode === 'upload' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Upload Screenshot to Cloud Storage
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        disabled={imageUploading}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      {imageUploading && (
                        <div className="text-xs font-mono text-blue-600 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading screenshot to Supabase Storage CDN...</span>
                        </div>
                      )}
                      {imageUploadError && (
                        <div className="text-xs text-red-600">{imageUploadError}</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Image / Screenshot CDN URL</label>
                      <input
                        type="url"
                        value={currentProject.coverImage || ''}
                        onChange={(e) => setCurrentProject((prev) => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="https://... or /assets/projects/my-screenshot.png"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 shadow-xs"
                      />
                    </div>
                  )}

                  {currentProject.coverImage && (
                    <button
                      type="button"
                      onClick={() => setCurrentProject((prev) => ({ ...prev, coverImage: '' }))}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Screenshot (Revert to High-Tech Placeholder)</span>
                    </button>
                  )}
                </div>

                {/* Right: Live Interactive Card Preview */}
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-500 uppercase font-semibold">
                    Live Visual Preview (Exactly how readers see it):
                  </div>
                  <ProjectCoverImage
                    coverImage={currentProject.coverImage}
                    title={currentProject.title || 'Project Preview'}
                    category={currentProject.category || 'Computer Vision'}
                    metric={metricsInput.split(',')[0]?.trim()}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Links, Tech, and Benchmarks */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                2. Benchmarks, Stack &amp; Links
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={currentProject.repoUrl || ''}
                    onChange={(e) => setCurrentProject((prev) => ({ ...prev, repoUrl: e.target.value }))}
                    placeholder="https://github.com/Mohitsharma1214/..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Live Demo URL</label>
                  <input
                    type="url"
                    value={currentProject.demoUrl || ''}
                    onChange={(e) => setCurrentProject((prev) => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://demo..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Documentation / Gazette Patent URL</label>
                  <input
                    type="url"
                    value={currentProject.docUrl || ''}
                    onChange={(e) => setCurrentProject((prev) => ({ ...prev, docUrl: e.target.value }))}
                    placeholder="https://copyright.gov.in/..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Key Performance Benchmarks (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={metricsInput}
                    onChange={(e) => setMetricsInput(e.target.value)}
                    placeholder="<150ms End-to-End Latency, Govt. of India Copyright (SW-19841/2024), 100% Offline"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Technologies Applied (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Python, PyTorch, OpenCV, Dlib, Raspberry Pi"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Architecture Case Study Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                3. Technical Architecture &amp; Case Study Breakdown
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Problem Statement *</label>
                <textarea
                  rows={3}
                  value={currentProject.problemStatement}
                  onChange={(e) => setCurrentProject((prev) => ({ ...prev, problemStatement: e.target.value }))}
                  placeholder="Detail the technical constraint, latency requirement, or edge limitation..."
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Solution &amp; Engineering Design *</label>
                <textarea
                  rows={3}
                  value={currentProject.solution}
                  onChange={(e) => setCurrentProject((prev) => ({ ...prev, solution: e.target.value }))}
                  placeholder="Explain the technical solution, model design, and architecture..."
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Engineering Decisions (One decision per line)
                  </label>
                  <textarea
                    rows={4}
                    value={decisionsInput}
                    onChange={(e) => setDecisionsInput(e.target.value)}
                    placeholder="Decision 1: ROI cropping vs full frame...&#10;Decision 2: Deterministic thresholding vs RNN..."
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Challenges &amp; Failure Modes (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={failuresInput}
                    onChange={(e) => setFailuresInput(e.target.value)}
                    placeholder="Challenge 1: Glare and low light contrast...&#10;Challenge 2: Thick spectacle occlusion..."
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Quantitative Evaluation (One bullet per line)
                  </label>
                  <textarea
                    rows={3}
                    value={evaluationInput}
                    onChange={(e) => setEvaluationInput(e.target.value)}
                    placeholder="Sub-150ms latency on Raspberry Pi 4 Model B&#10;Govt. of India Copyright SW-19841/2024"
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Lessons Learned (One bullet per line)
                  </label>
                  <textarea
                    rows={3}
                    value={lessonsInput}
                    onChange={(e) => setLessonsInput(e.target.value)}
                    placeholder="Edge AI demands ruthless efficiency: 640x480 resolution ROI tracking outperforms heavy neural nets."
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project &amp; Publish</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
