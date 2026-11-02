import React, { useState } from 'react';
import { Camera, Cpu, Layers, Activity, Image as ImageIcon, Zap } from 'lucide-react';
import { CvProjectIllustration } from './CvProjectIllustration';

interface ProjectCoverImageProps {
  projectId?: string;
  coverImage?: string;
  title: string;
  category: string;
  metric?: string;
  className?: string;
  aspectRatio?: string;
}

export const ProjectCoverImage: React.FC<ProjectCoverImageProps> = ({
  projectId,
  coverImage,
  title,
  category,
  metric,
  className = '',
  aspectRatio = 'aspect-[16/9] sm:aspect-[2/1]',
}) => {
  // Infer projectId if not explicitly provided
  const resolvedProjectId =
    projectId ||
    (() => {
      const t = title.toLowerCase();
      if (t.includes('drowsiness') || t.includes('driver')) return 'driver-drowsiness-detection';
      if (t.includes('hair') || t.includes('strand') || t.includes('segmentation')) return 'hair-strand-detection';
      if (t.includes('doc') || t.includes('logistics') || t.includes('rag')) return 'ultra-doc-intelligence';
      if (t.includes('testing') || t.includes('agent') || t.includes('health')) return 'autonomous-testing-health-agents';
      return '';
    })();

  const hasAnimation = Boolean(resolvedProjectId);
  const [imgError, setImgError] = useState(false);
  const hasScreenshot = Boolean(coverImage && coverImage.trim() && !imgError);

  // Default to screenshot if available and not errored, otherwise animation
  const [viewMode, setViewMode] = useState<'image' | 'animation'>(
    hasScreenshot ? 'image' : 'animation'
  );

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden rounded-2xl bg-slate-950 border border-slate-200/80 shadow-xs group select-none ${className}`}>
      {/* View Mode Switcher Pill (when both screenshot and animation exist) */}
      {hasScreenshot && hasAnimation && (
        <div className="absolute top-3 right-3 z-30 flex items-center bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-md">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('image');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
              viewMode === 'image'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="View production screenshot preview"
          >
            <ImageIcon className="w-3 h-3" />
            <span className="hidden sm:inline">Image</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('animation');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
              viewMode === 'animation'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="View animated computer vision inspection / pipeline scanner"
          >
            <Zap className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>CV Scan</span>
          </button>
        </div>
      )}

      {/* Mode A: Animated Computer Vision / AI Pipeline Illustration */}
      {viewMode === 'animation' && hasAnimation ? (
        <div className="w-full h-full">
          <CvProjectIllustration projectId={resolvedProjectId} className="w-full h-full" />
        </div>
      ) : hasScreenshot ? (
        /* Mode B: Real Production Screenshot */
        <div className="relative w-full h-full">
          <img
            src={coverImage}
            alt={`${title} project preview`}
            loading="lazy"
            onError={() => {
              setImgError(true);
              if (hasAnimation) setViewMode('animation');
            }}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Telemetry Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
            <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified System Preview</span>
            </span>
            {metric && (
              <span className="bg-blue-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-blue-400/30 text-[10px] text-blue-300 font-bold">
                {metric}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Mode C: High-Tech Schematic Fallback */
        <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 text-white bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              <span>{category}</span>
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Production Arch</span>
            </div>
          </div>

          <div className="my-auto text-center space-y-1.5 py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-white shadow-lg">
              <Camera className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-white tracking-tight line-clamp-1">
              {title}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/10 pt-2.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Case Study Verified</span>
            </span>
            {metric && (
              <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {metric}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
