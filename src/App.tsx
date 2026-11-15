import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { TECHNICAL_ARTICLES } from './data/portfolioData';
import type { ProjectCaseStudy, TechnicalArticle } from './data/portfolioData';

// Code-split subpages to minimize critical path bundle size (<80KB initial load)
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage').then((m) => ({ default: m.ExperiencePage })));
const SkillsPage = lazy(() => import('./pages/SkillsPage').then((m) => ({ default: m.SkillsPage })));
const BlogsPage = lazy(() => import('./pages/BlogsPage').then((m) => ({ default: m.BlogsPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

// Lazy-load heavy overlay modals
const CaseStudyModal = lazy(() => import('./components/CaseStudyModal').then((m) => ({ default: m.CaseStudyModal })));
const ArticleModal = lazy(() => import('./components/ArticleModal').then((m) => ({ default: m.ArticleModal })));
import { ResumeModalProvider, useResumeModal } from './context/ResumeModalContext';
import { ResumeModal } from './components/ResumeModal';
import { BrandFaviconLoader } from './components/BrandFaviconLoader';
import { NeuralNetworkCanvas } from './components/NeuralNetworkCanvas';
import { MohitNeuralTwinChatbot } from './components/MohitNeuralTwinChatbot';

// Minimal non-intrusive loading fallback for asynchronously loaded routes
function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Helper component to scroll window to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}

import { trackVisitorLanding } from './services/visitorTelemetryService';

// Background visitor telemetry tracker for real-time Telegram alerts
function VisitorTelemetryTracker() {
  useEffect(() => {
    trackVisitorLanding();
  }, []);

  return null;
}

// Dynamic Document Title updater for client-side routing
function PageMetadataUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Mohit Sharma | AI Engineer • Computer Vision & LLM Systems',
      '/about': 'About Mohit Sharma | AI Engineer & Systems Specialist',
      '/projects': 'Projects & Case Studies | Mohit Sharma • AI Engineer',
      '/experience': 'Work Experience | Mohit Sharma • AI Systems Engineer',
      '/skills': 'Skills & Technology Stack | Mohit Sharma • AI Engineer',
      '/blogs': 'Technical Blogs & Case Studies | Mohit Sharma • AI Engineer',
      '/writing': 'Technical Blogs & Case Studies | Mohit Sharma • AI Engineer',
      '/contact': "Contact Mohit Sharma | AI Engineer • Computer Vision & LLM Systems",
      '/admin': 'Blog Studio Admin | Mohit Sharma • AI Engineer',
    };

    let title = titles[pathname];
    if (!title && pathname.startsWith('/blogs/')) {
      const blogId = pathname.replace('/blogs/', '').replace(/\/$/, '');
      const matched = TECHNICAL_ARTICLES.find((b) => b.id === blogId);
      if (matched) {
        title = `${matched.title} | Mohit Sharma`;
      }
    }

    document.title = title || 'Mohit Sharma | AI Engineer • Computer Vision & LLM Systems';
  }, [pathname]);

  return null;
}

function WritingIdRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/blogs/${id}` : '/blogs'} replace />;
}

function AppContent() {
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<TechnicalArticle | null>(null);
  const location = useLocation();

  const handleOpenProject = (project: ProjectCaseStudy) => {
    setSelectedProject(project);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-x-clip modern-grid">
      {!isAdminRoute && <BrandFaviconLoader />}
      {!isAdminRoute && <NeuralNetworkCanvas />}
      {!isAdminRoute && <MohitNeuralTwinChatbot />}
      {/* Subtle modern light-theme watercolor ambient glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[450px] rounded-full bg-blue-400/[0.07] blur-[140px]" />
        <div className="absolute top-[35%] right-[-5%] w-[550px] h-[550px] rounded-full bg-indigo-300/[0.08] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[500px] rounded-full bg-sky-300/[0.06] blur-[140px]" />
      </div>

      <ScrollToTop />
      <PageMetadataUpdater />
      <VisitorTelemetryTracker />
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow relative z-10">
        <Suspense fallback={<RouteLoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage onSelectProject={handleOpenProject} />} />
              <Route path="/about" element={<AboutPage onSelectProject={handleOpenProject} />} />
              <Route path="/projects" element={<ProjectsPage onSelectProject={handleOpenProject} />} />
              <Route path="/experience" element={<ExperiencePage onSelectProject={handleOpenProject} />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs/:id" element={<BlogPostPage />} />
              <Route path="/writing" element={<Navigate to="/blogs" replace />} />
              <Route path="/writing/:id" element={<WritingIdRedirect />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Interactive Case Study Modal (Lazy-Loaded) */}
      {selectedProject && (
        <Suspense fallback={null}>
          <CaseStudyModal project={selectedProject} onClose={handleCloseProject} />
        </Suspense>
      )}

      {/* Interactive Technical Writing Reader Modal (Lazy-Loaded) */}
      {selectedArticle && (
        <Suspense fallback={null}>
          <ArticleModal article={selectedArticle} onClose={handleCloseArticle} />
        </Suspense>
      )}

      {/* Global In-Site Resume Modal */}
      <GlobalResumeModal />
    </div>
  );
}

function GlobalResumeModal() {
  const { isOpen, closeResumeModal, settings } = useResumeModal();
  return (
    <ResumeModal
      isOpen={isOpen}
      onClose={closeResumeModal}
      resumeUrl={settings.resumeUrl}
      calendlyUrl={settings.calendlyUrl}
    />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ResumeModalProvider>
        <AppContent />
      </ResumeModalProvider>
    </BrowserRouter>
  );
}

export default App;
