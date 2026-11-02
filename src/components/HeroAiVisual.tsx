import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  Server,
  Activity,
} from 'lucide-react';

interface PipelineStage {
  step: string;
  name: string;
  spec: string;
  badge: string;
  latency: string;
  hardware: string;
  details: string;
  logic: string;
}

interface PipelinePreset {
  id: 'edge' | 'segmentation' | 'rag';
  name: string;
  tag: string;
  throughput: string;
  sla: string;
  stages: [PipelineStage, PipelineStage, PipelineStage, PipelineStage];
}

const PRESETS: PipelinePreset[] = [
  {
    id: 'edge',
    name: 'Edge Vision (Drowsiness)',
    tag: 'ARM / Offline',
    throughput: '30 FPS Real-Time',
    sla: '<150ms End-to-End',
    stages: [
      {
        step: '01',
        name: 'CSI Sensor Ingestion',
        spec: '640x480 @ 30 FPS',
        badge: 'Zero Cloud',
        latency: '4.2ms',
        hardware: 'CSI Camera Interface',
        details: 'Hardware video capture frame buffering with synchronized timestamping.',
        logic: 'V4L2 Video Buffer -> Region-of-Interest (ROI) Cropping',
      },
      {
        step: '02',
        name: 'Landmark Localization',
        spec: '68-Pt Ocular Mesh',
        badge: 'Dlib / HOG',
        latency: '36.8ms',
        hardware: 'Raspberry Pi 4 Quad-Core',
        details: 'Facial bounding box isolation with localized 68-point shape prediction.',
        logic: 'Face ROI -> 68 Facial Landmarks -> Bilateral Eye Coordinates',
      },
      {
        step: '03',
        name: 'EAR Temporal Buffer',
        spec: 'Time-Series Window',
        badge: 'Vectorized',
        latency: '1.8ms',
        hardware: 'NumPy / C-Accelerated',
        details: 'Calculates Euclidean Eye Aspect Ratio across a sliding circular buffer.',
        logic: 'EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|) with 1.5s threshold',
      },
      {
        step: '04',
        name: 'Safety Alert Dispatch',
        spec: 'Isolated Audio Thread',
        badge: 'SW-19841/2024',
        latency: '<12ms',
        hardware: 'GPIO / Audio Out',
        details: 'Dispatches acoustic buzzers asynchronously without blocking visual loop.',
        logic: 'Threaded Dispatch -> Non-blocking audio loop -> Driver Warning',
      },
    ],
  },
  {
    id: 'segmentation',
    name: 'Micro-Segmentation (Trichology)',
    tag: 'TensorRT / CUDA',
    throughput: '5,000+ Imgs/Day',
    sla: '<120ms P95 Latency',
    stages: [
      {
        step: '01',
        name: 'Dermatoscope Ingestion',
        spec: '1024x1024 Polarized Tile',
        badge: 'specular filter',
        latency: '8.4ms',
        hardware: 'CUDA Pinned Memory',
        details: 'High-resolution polarized trichoscopy ingest with adaptive CLAHE filtering.',
        logic: 'Raw Sensor Tile -> CLAHE Contrast Equalization -> Dynamic Micro-Batch',
      },
      {
        step: '02',
        name: 'ResNet-50-FPN Backbone',
        spec: 'Multi-scale P2-P6 Maps',
        badge: 'PyTorch / FPN',
        latency: '42.5ms',
        hardware: 'NVIDIA T4 Tensor Cores',
        details: 'Extracts hierarchical visual representations preserving fine 3-5px strand edges.',
        logic: 'ResNet-50 Feature Pyramid -> High-aspect RPN Anchors [0.1 .. 10.0]',
      },
      {
        step: '03',
        name: 'TensorRT FP16 Engine',
        spec: 'Sub-pixel RoIAlign',
        badge: 'FP16 Quantized',
        latency: '26.1ms',
        hardware: 'TensorRT 8.6 Graph Fused',
        details: 'Bilinear RoIAlign with graph-fused kernels eliminates spatial quantization.',
        logic: 'ONNX Graph Fusion -> FP32 to FP16 -> Sub-pixel RoIAlign Head',
      },
      {
        step: '04',
        name: 'Instance Strand Masks',
        spec: '0.84 mAP Precision',
        badge: 'Overlaps Resolved',
        latency: '6.7ms',
        hardware: 'GPU Post-Processing',
        details: 'Generates per-instance binary masks separating acute crossing fiber junctions.',
        logic: 'Per-instance Mask Head -> Boundary Penalty Loss -> Foliage Caliper',
      },
    ],
  },
  {
    id: 'rag',
    name: 'Grounded Logistics RAG',
    tag: 'ChromaDB / Strict SLAs',
    throughput: 'Sub-2s Query Latency',
    sla: '0.35 Gating Threshold',
    stages: [
      {
        step: '01',
        name: 'Document Ingestion',
        spec: 'Multi-Page Bill of Lading',
        badge: 'Async Parser',
        latency: '45ms',
        hardware: 'FastAPI Async Worker',
        details: 'Parses complex multi-page freight bills and invoices into semantic chunks.',
        logic: 'RecursiveCharacterSplitter(chunk=1000, overlap=200) -> UUID Tags',
      },
      {
        step: '02',
        name: 'Dense Vector Isolation',
        spec: 'MiniLM-L6 (384-dim)',
        badge: 'Document UUID',
        latency: '18ms',
        hardware: 'ChromaDB HNSW Index',
        details: 'Strict document-level vector isolation prevents cross-document data leaks.',
        logic: 'Sentence-Transformers -> Top-8 Cosine Search WHERE doc_id = target_id',
      },
      {
        step: '03',
        name: 'Hybrid Confidence Gate',
        spec: '40% Dist + 60% LLM',
        badge: 'Hallucination Gate',
        latency: '120ms',
        hardware: 'OpenRouter Llama-3/Gemini',
        details: 'Weighted confidence algorithm gates model reasoning against fabricated context.',
        logic: 'Normalized Distance (0.4) + Self-Assessed Certainty (0.6) >= 0.35',
      },
      {
        step: '04',
        name: 'Verified Structured Payload',
        spec: 'Pydantic Strict Contract',
        badge: 'Zero Hallucination',
        latency: '14ms',
        hardware: 'JSON Contract Validator',
        details: 'Guaranteed valid extraction or deterministic refusal alert for downstream ERP.',
        logic: 'Strict Schema Assertion -> Audit Trail Log -> Live Frontend Sync',
      },
    ],
  },
];

export const HeroAiVisual: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activePresetId, setActivePresetId] = useState<'edge' | 'segmentation' | 'rag'>('edge');
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(2); // Default to stage 3 (Acceleration)

  const activePreset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];
  const selectedStage = activePreset.stages[selectedStageIdx];

  // Auto-cycle through stages if user hasn't explicitly clicked
  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setSelectedStageIdx((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, [shouldReduceMotion, activePresetId]);

  return (
    <div className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-card p-4 sm:p-6 overflow-hidden select-none">
      {/* Subtle Background Blueprint Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Production Pipeline Inspector
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold hidden md:inline-block">
            Verified SLAs
          </span>
        </div>

        {/* Preset Selector Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {PRESETS.map((preset) => {
            const isActive = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setActivePresetId(preset.id);
                  setSelectedStageIdx(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {preset.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Stage Horizontal Pipeline Flow */}
      <div className="relative z-10 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {activePreset.stages.map((stage, idx) => {
            const isSelected = selectedStageIdx === idx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setSelectedStageIdx(idx)}
                className={`group relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200/80'
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {stage.step}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold truncate ${
                      isSelected ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {stage.latency}
                  </span>
                </div>

                {/* Stage Name & Spec */}
                <div className="py-2">
                  <div
                    className={`text-xs font-bold leading-tight line-clamp-2 ${
                      isSelected ? 'text-blue-950' : 'text-slate-800'
                    }`}
                  >
                    {stage.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                    {stage.spec}
                  </div>
                </div>

                {/* Badge Tag */}
                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between w-full">
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wide font-medium truncate ${
                      isSelected ? 'text-blue-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {stage.badge}
                  </span>
                  <ArrowRight
                    className={`w-3 h-3 transition-transform ${
                      isSelected
                        ? 'text-blue-600 translate-x-0.5'
                        : 'text-slate-400 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Animated Pipeline Connection Progress Line */}
        <div className="relative mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            initial={false}
            animate={{
              width: `${((selectedStageIdx + 1) / 4) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        </div>
      </div>

      {/* Selected Stage Inspector Drawer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activePreset.id}-${selectedStage.step}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 bg-slate-900 text-white rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-inner"
        >
          {/* Top Row: Stage identity & Hardware */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">Stage {selectedStage.step}:</span>
              <span className="text-white font-semibold">{selectedStage.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Server className="w-3 h-3 text-slate-400" />
                <span>{selectedStage.hardware}</span>
              </span>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                {selectedStage.latency}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {selectedStage.details}
          </p>

          {/* Implementation Logic Code-line */}
          <div className="bg-slate-950/90 rounded-lg px-3 py-2 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-slate-500 select-none font-bold">$</span>
            <span className="truncate">{selectedStage.logic}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Production Metrics Telemetry Bar */}
      <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-slate-500 text-[11px]">Throughput Scale:</span>
          <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
            {activePreset.throughput}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>SLA Target: {activePreset.sla}</span>
        </div>
      </div>
    </div>
  );
};
