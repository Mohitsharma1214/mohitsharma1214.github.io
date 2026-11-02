import React, { useState } from 'react';
import { Camera, Cpu, Layers, Activity } from 'lucide-react';

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
  coverImage,
  title,
  category,
  metric,
  className = '',
  aspectRatio = 'aspect-[16/9] sm:aspect-[2/1]',
}) => {
  const [imgError, setImgError] = useState(false);
  const hasScreenshot = Boolean(coverImage && coverImage.trim() && !imgError);

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden rounded-2xl bg-slate-950 border border-slate-200/80 shadow-xs group select-none ${className}`}>
      {hasScreenshot ? (
        <div className="relative w-full h-full">
          <img
            src={coverImage}
            alt={`${title} project preview`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Telemetry Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
            <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
        /* High-Tech Blueprint Fallback */
        <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 text-white bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              <span>{category}</span>
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3 h-3 text-emerald-400" />
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

