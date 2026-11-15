import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Briefcase, Calendar, MapPin, CheckCircle2, Building2, ArrowRight, Layers, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { EXPERIENCES } from '../data/portfolioData';
import type { ProjectCaseStudy } from '../data/portfolioData';
import { InteractiveJourneyRoadmap } from '../components/InteractiveJourneyRoadmap';

interface ExperiencePageProps {
  onSelectProject?: (project: ProjectCaseStudy) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 },
  },
};

export const ExperiencePage: React.FC<ExperiencePageProps> = ({ onSelectProject }) => {
  const [viewMode, setViewMode] = useState<'roadmap' | 'timeline'>('roadmap');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12"
    >
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
              <span>Career Trajectory &bull; Production Impact &bull; Verified Tenures</span>
            </div>
            <h1 className="font-display text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 uppercase tracking-tight break-words">
              Work Experience
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Full-time engineering tenures delivering production computer vision backends, agentic LLM systems, and edge ML models.
            </p>
          </div>

          {/* Quick summary badge */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 self-start md:self-auto shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-950">3 Organizations</div>
              <div className="text-xs text-slate-500 font-mono font-medium">Production AI Roles</div>
            </div>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Availability Status</div>
            <div className="text-sm font-bold text-emerald-700 mt-1">Looking for Opportunities</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Specialization</div>
            <div className="text-sm font-bold text-slate-900 mt-1">CV Backends &bull; Edge &bull; Agents</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Scale Handled</div>
            <div className="text-sm font-bold text-slate-900 mt-1">5,000+ Daily Clinical Images</div>
          </div>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
          {viewMode === 'roadmap' ? '🗺️ Interactive Milestone Roadmap' : '📋 Chronological Employment Timeline'}
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'roadmap'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Roadmap</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chronological Resume</span>
          </button>
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'roadmap' ? (
        <InteractiveJourneyRoadmap onSelectProject={onSelectProject} />
      ) : (
        /* Timeline Section */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-12"
        >
        {EXPERIENCES.map((exp, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="relative pl-6 sm:pl-10 group"
          >
            {/* Timeline Indicator Dot */}
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 group-hover:bg-blue-600 transition-all shadow-xs"></div>

            {/* Experience Card */}
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="modern-card bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-300 hover:shadow-card transition-all"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {exp.type}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {exp.location}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mt-2">
                    {exp.role}
                  </h2>
                  <div className="text-base font-semibold text-blue-600 flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>{exp.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{exp.period}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Key Production Contributions &amp; Architectural Outcomes
                </div>
                <ul className="space-y-3">
                  {exp.highlights.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div className="pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2.5 font-semibold">
                  Technologies &amp; Frameworks Applied
                </div>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:border-blue-300 transition-colors font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    )}

      {/* Footer Call to Action */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">Interested in technical details?</h3>
          <p className="text-xs sm:text-sm text-slate-600">Read deep dives on architecture tradeoffs and benchmarks.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <NavLink
            to="/projects"
            className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <span>View Case Studies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
          <NavLink
            to="/skills"
            className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-xs"
          >
            <span>Explore Skills Stack</span>
          </NavLink>
        </div>
      </div>
    </motion.div>
  );
};
