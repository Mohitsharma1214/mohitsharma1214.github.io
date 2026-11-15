import React from 'react';
import { ArrowDown, Mail, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { PERSONAL_INFO } from '../data/portfolioData';
import { HeroTelemetryCard } from './HeroTelemetryCard';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden">
      {/* Decorative cyber ambient spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Positioning & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-mono font-medium text-slate-200">
                AI Systems Engineer
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">
                Looking for Opportunities
              </span>
            </div>

            {/* Main Hero Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-3">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>AI Systems • Computer Vision • Agentic Workflows</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.12]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Engineering real-time{' '}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  computer vision
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  {' '}&amp; production AI pipelines.
                </span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Hi, I'm <strong className="text-white font-semibold">{PERSONAL_INFO.name}</strong>. I design low-latency computer vision and grounded LLM systems. Scaled clinical dermatology inference to <strong className="text-cyan-300 font-mono font-medium">5,000+ images/day (&lt;120ms)</strong> and authored Government of India Copyright <strong className="font-mono text-amber-300 font-medium">{PERSONAL_INFO.copyrightId}</strong> for edge driver monitoring on Raspberry Pi.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>View Case Studies</span>
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm px-4 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-500/50 shadow-subtle hover:text-white transition-all backdrop-blur-md"
              >
                <GithubIcon className="w-4 h-4 text-slate-300" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm px-4 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-500/50 shadow-subtle hover:text-white transition-all backdrop-blur-md"
              >
                <LinkedinIcon className="w-4 h-4 text-[#38bdf8]" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="inline-flex items-center gap-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-medium text-sm px-4 py-2.5 rounded-xl border border-cyan-800/60 hover:border-cyan-400/80 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Contact</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive AI Telemetry Inspector */}
          <div className="lg:col-span-5">
            <HeroTelemetryCard />
          </div>
        </div>

        {/* Verified Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          {PERSONAL_INFO.metrics.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/40 rounded-xl p-4 sm:p-5 shadow-card hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all backdrop-blur-md group"
            >
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 group-hover:scale-[1.02] transition-transform">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">
                {item.label}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {item.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Intellectual Property Notice */}
        <div className="flex items-center gap-2.5 mt-4 px-4 py-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 shadow-[0_0_20px_rgba(245,158,11,0.06)] backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Government of India Registered Copyright (<strong className="font-mono text-amber-300 font-bold">{PERSONAL_INFO.copyrightId}</strong>) for Edge-based Driver Drowsiness Detection System on Raspberry Pi.
          </span>
        </div>
      </div>
    </section>
  );
};
