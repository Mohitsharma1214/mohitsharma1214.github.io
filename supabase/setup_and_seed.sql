-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR MOHIT SHARMA'S BLOGS
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- 1. Go to https://supabase.com/dashboard/project/_/sql
-- 2. Paste and run this script to create the table, indexes, and security policies.
-- ==============================================================================

-- 1. Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Engineering',
    read_time TEXT NOT NULL DEFAULT '5 min read',
    status TEXT NOT NULL DEFAULT 'Published Breakdown',
    cover_image TEXT,
    publish_date TEXT NOT NULL DEFAULT 'Oct 2026',
    summary TEXT NOT NULL DEFAULT '',
    content_markdown TEXT NOT NULL DEFAULT '',
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create performance indexes for high-throughput pagination & search
CREATE INDEX IF NOT EXISTS idx_blogs_published_created ON public.blogs (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs (category);
CREATE INDEX IF NOT EXISTS idx_blogs_title_search ON public.blogs USING gin (to_tsvector('english', title || ' ' || summary));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 4. Set access policies
-- Public users can read all published blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" 
ON public.blogs 
FOR SELECT 
USING (published = true);

-- Only the authorized site owner can perform write actions (insert, update, delete)
DROP POLICY IF EXISTS "Authenticated users have full write access" ON public.blogs;
DROP POLICY IF EXISTS "Only site owner can manage blogs" ON public.blogs;

CREATE POLICY "Only site owner can manage blogs" 
ON public.blogs 
FOR ALL 
TO authenticated 
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');
-- Seed Initial 8 Blogs into Supabase Database

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'edge-fatigue-tracking-sub-150ms',
    'Designing Low-Latency Edge Vision: Real-Time Fatigue Tracking Under 150ms',
    'How mathematical landmark geometry and multi-threaded audio isolation beat deep CNNs on Raspberry Pi.',
    'Computer Vision & Edge AI',
    '6 min read',
    'Published Technical Breakdown',
    '/Portfolio/assets/blogs/edge-fatigue-tracking-sub-150ms.png',
    'Oct 2026',
    'A technical breakdown of engineering the Driver Drowsiness Detection System (Govt. of India Copyright SW-19841/2024). Explores the trade-offs between heavy end-to-end vision neural nets versus localized eye-aspect-ratio (EAR) geometry on low-power ARM architectures.',
    '### The Edge Latency Conundrum
When building driver monitoring systems for commercial transport, the primary design constraint is **zero-cloud dependency**. In rural transit corridors, network disconnects are inevitable. If a driver experiences micro-sleep inside a mountain pass, a cloud-dependent model with a 2-second p95 latency is useless.

The engineering challenge was clear: achieve **30 FPS visual tracking with under 150ms total response latency** strictly on an uncooled Raspberry Pi 4 Model B (4x ARM Cortex-A72 cores).

### The Math: Eye Aspect Ratio (EAR) vs Heavy Temporal CNNs
Early experimentation explored 3D CNNs (e.g. ResNet3D) to classify video snippets directly. However, on CPU-only edge hardware, 3D convolutions pegged all cores to 100%, causing thermal throttling within 8 minutes and dropping frame rates below 6 FPS.

Instead, we decoupled the problem into:
1. **Facial Landmark Estimation**: Localizing 68 anatomical coordinates.
2. **Geometric Metric Formulation**: Deriving instantaneous ocular state through the **Eye Aspect Ratio (EAR)** formula:

$$\text{EAR} = \frac{\|p_2 - p_6\| + \|p_3 - p_5\|}{2 \|p_1 - p_4\|}$$

Where $p_1 \dots p_6$ correspond to the 2D pixel coordinates of the eye boundaries.

During open-eye status, the EAR fluctuates around 0.30 - 0.35. During a micro-sleep event, the vertical Euclidean distances contract, plummeting EAR below 0.20.

\',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'scaling-medical-cv-tensorrt-5000-images',
    'Scaling Medical Computer Vision to 5,000 Images/Day with TensorRT & FastAPI',
    'Overcoming CUDA OOMs, async micro-batching, and FP16 graph fusions in clinical dermatology inference.',
    'MLOps & High-Throughput Inference',
    '7 min read',
    'Engineering Note',
    '/Portfolio/assets/blogs/scaling-medical-cv-tensorrt-5000-images.png',
    'Oct 2026',
    'Production lessons learned at Hairscope while serving deep learning dermatology models at 5,000+ daily images with sub-120ms latency on limited GPU infrastructure.',
    '### The Challenge: Scale vs GPU Costs
Serving deep learning models in medical diagnostics presents strict requirements:
- Sub-120ms P95 latency for interactive clinical review.
- Strict uptime without CUDA Out-of-Memory (OOM) crashes.
- Cloud cost efficiency on single-GPU instances (NVIDIA T4).

At Hairscope, we scaled our vision inference service to handle **5,000+ daily high-resolution images**. Here is how we tackled the core systems engineering bottlenecks.

### Bottleneck 1: Synchronous PyTorch Inference in FastAPI
A common pitfall is placing PyTorch model inference directly inside standard asynchronous FastAPI endpoints:

\',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'strictly-grounded-rag-logistics',
    'Strictly Grounded RAG: Eliminating Hallucinations in Logistics Document Extraction',
    'A deep dive into metadata isolation, 40/60 hybrid confidence scoring, and runtime 0.35 cutoff gates.',
    'LLM Systems & Information Retrieval',
    '8 min read',
    'Architecture Deep Dive',
    '/Portfolio/assets/blogs/strictly-grounded-rag-logistics.png',
    'Oct 2026',
    'Examining the system design choices behind Ultra-Doc-Intelligence. Why vector similarity alone is insufficient for multi-page logistics contracts, and how hybrid confidence scoring creates provable negative-answer guarantees.',
    '### The Problem with Naive RAG in Enterprise Workflows
In consumer Q&A, an LLM generating a plausible-sounding answer is often tolerated. In logistics and freight auditing, however, fabricating a bill of lading number or inventing an insurance deductible creates direct contractual liability.

When building **Ultra-Doc-Intelligence**, standard RAG pipelines failed on two critical dimensions:
1. **Cross-Document Context Bleed**: In multi-document collections, top-k semantic search routinely retrieved freight rates from Document B to answer queries regarding Document A because shipping contracts share high semantic density.
2. **Unwarranted Confidence on Absent Fields**: When asked for a ''Hazardous Materials Declaration'' on a clean cargo manifest, LLMs routinely hallucinated standard clauses.

### Strategy 1: Strict Document-Level Vector Filtering
Rather than relying on global vector similarity, every document ingested into ChromaDB is assigned an immutable \',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'microscopic-hair-segmentation-yolov11-maskrcnn',
    'Instance Segmentation at Scale: YOLOv11-seg vs Mask R-CNN in Microscopic Trichology',
    'Loss function engineering for boundary preservation, custom RoIAlign tuning, and sub-120ms TensorRT FP16 quantization.',
    'Deep Learning & Instance Segmentation',
    '9 min read',
    'Published Technical Breakdown',
    '/Portfolio/assets/blogs/microscopic-hair-segmentation-yolov11-maskrcnn.png',
    'Sep 2026',
    'A detailed engineering breakdown on segmenting overlapping, microscopic hair strands under polarized dermatological imaging. Explores why standard segmentation heads bleed boundaries together, and how targeted IoU boundary loss plus TensorRT FP16 achieved 0.84 mAP.',
    '### The Microscopic Challenge
Trichological analysis requires sub-pixel delineation of individual hair fibers under high-magnification dermatological illumination. General-purpose object segmentation models fail in this domain due to:
1. **Extreme Aspect Ratios**: Individual strands can measure 1200 pixels in length yet only 3–5 pixels in width.
2. **Acute Crossing Angles**: Strands frequently intersect at sharp angles, causing standard mask prediction heads to bleed overlapping fibers into single connected polygons.
3. **Variable Scalp Lighting**: Specular sebum reflections create high-frequency false positive edges.

### Architecture Comparison: Mask R-CNN vs YOLOv11-seg
We trained and evaluated two foundational instance segmentation architectures on our curated trichoscopy dataset of 10,000+ annotated follicles:

| Architectural Metric | Mask R-CNN (ResNet-50-FPN) | YOLOv11l-seg (Backbone-C3k2) |
| :--- | :--- | :--- |
| **mAP@0.5** | 0.824 | **0.841** |
| **Mask IoU** | 0.771 | **0.784** |
| **PyTorch FP32 Latency** | 210ms | 134ms |
| **TensorRT FP16 Latency** | 128ms | **98ms** |
| **VRAM Footprint** | 4.8 GB | **2.6 GB** |

While Mask R-CNN delivered solid edge fidelity through its two-stage Region of Interest (RoIAlign) mechanism, **YOLOv11l-seg** delivered superior intersection delineation while cutting latency by more than half.

### Loss Function Customization
Standard cross-entropy mask losses penalize all pixel misclassifications equally. For ultra-thin strands, 95% of pixels are interior, meaning the network can achieve high loss reduction while completely blurring the crucial boundary edge.

We formulated a composite boundary-weighted loss:

\',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'autonomous-qa-agent-orchestration',
    'Building Autonomous Testing Agents: Stateful Multi-Turn Planning with Function Calling',
    'Moving beyond brittle Cypress scripts with goal-directed LLM agents, task memory buffers, and Pydantic schema validation.',
    'Agentic AI & Test Automation',
    '7 min read',
    'Architecture Deep Dive',
    '/Portfolio/assets/blogs/autonomous-qa-agent-orchestration.png',
    'Sep 2026',
    'How we architected autonomous QA test automation agents at Sodio Technologies. Details the state-machine transition model, DOM action tool-calling definitions, exponential backoff to prevent infinite reasoning loops, and structured reporting.',
    '### The Fragility of Hard-Coded UI Scripts
Modern single-page applications evolve rapidly. A single CSS class name refactor or DOM hierarchy adjustment breaks conventional Selenium, Cypress, or Playwright selector scripts, forcing engineering teams to spend hundreds of hours maintaining brittle locator files.

At Sodio Technologies, we engineered an **autonomous QA agent framework** capable of reading high-level test scenarios in plain English (e.g., *"Complete the checkout flow with a promotional coupon and verify tax calculations"*) and dynamically navigating complex web interfaces.

### Agent Architecture: The Stateful Observation Loop
Rather than treating test execution as a single-prompt generation, the agent operates as a **finite state machine with memory**:

1. **State Perception**: The browser viewport DOM is parsed into an accessible interactive tree (buttons, inputs, links, headings) stripped of irrelevant styling noise.
2. **Goal Reasoning**: The LLM evaluates the active objective against prior executed steps in its history buffer.
3. **Tool Invocation**: The agent issues a structured function call (\',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'realtime-recommendation-systems-two-stage',
    'Low-Latency Recommendation Engines: Two-Stage Candidate Retrieval and Real-Time Ranking',
    'Balancing semantic affinity with sub-100ms P99 SLAs using PyTorch embeddings, ANN candidate pruning, and diversity penalties.',
    'Production Platforms & RecSys',
    '8 min read',
    'Engineering Note',
    '/Portfolio/assets/blogs/realtime-recommendation-systems-two-stage.png',
    'Aug 2026',
    'Designing scalable content recommendation pipelines at Sodio Technologies. Why monolithic deep ranking models fail 100ms SLAs, and how splitting inference into Stage 1 candidate retrieval and Stage 2 weighted ranking solved latency bottlenecks.',
    '### The Real-Time Recommendation Dilemma
In high-engagement discovery feeds, recommendation quality directly dictates session dwell time. However, running a multi-layer neural ranking model across an entire catalog of 500,000 items on every user scroll is computationally impossible within a **sub-100ms P99 latency SLA**.

At Sodio Technologies, we architected a **two-stage recommendation pipeline** that achieved personalized candidate discovery in **under 68ms P95**.

### Two-Stage Architectural Blueprint

\',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'onnx-fp16-vs-int8-quantization-benchmarks',
    'Model Quantization in Practice: FP16 vs INT8 Calibration for Real-Time Edge Vision',
    'A rigorous performance and accuracy comparison between FP16 half-precision and INT8 TensorRT entropy calibration.',
    'ML Hardware & Optimization',
    '6 min read',
    'Architecture Deep Dive',
    '/Portfolio/assets/blogs/onnx-fp16-vs-int8-quantization-benchmarks.png',
    'Jul 2026',
    'Hands-on benchmarks comparing FP32, FP16, and INT8 execution on NVIDIA GPUs and ARM edge processors. Demonstrates how post-training quantization (PTQ) saves 48% VRAM without sacrificing boundary segmentation fidelity.',
    '### The Quantization Trade-Off
Deploying computer vision models to resource-constrained edge hardware requires minimizing both memory bandwidth and compute latency. Model quantization—converting floating-point weights to lower precision representations—is one of the most effective techniques available.

However, naive quantization can drastically degrade fine-grained boundary segmentation. Here are our production benchmarks evaluating **FP32 vs FP16 vs INT8 quantization** across NVIDIA Jetson and Raspberry Pi hardware.

### Quantization Methodologies Evaluated
1. **FP32 (Single Precision)**: Standard PyTorch baseline (32-bit floating point).
2. **FP16 (Half Precision)**: IEEE 754 half precision with 5 exponent bits and 10 mantissa bits.
3. **INT8 (8-bit Integer)**: Symmetric post-training quantization using **Kullback-Leibler (KL) divergence entropy calibration** across a representative sample of 500 validation images.

### Empirical Benchmark Results

| Model Architecture | Precision | Latency (NVIDIA T4) | Latency (ARM Cortex-A72) | mAP@0.5 | Memory Footprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **YOLOv11l-seg** | FP32 | 134ms | 1,420ms | 0.844 | 4.8 GB |
| **YOLOv11l-seg** | **FP16** | **98ms** | **840ms** | **0.841** | **2.5 GB (-48%)** |
| **YOLOv11l-seg** | INT8 | 62ms | 410ms | 0.812 | 1.3 GB (-73%) |

### Engineering Decisions & Recommendations
- **FP16 is the Production Sweet Spot**: Slashed latency by 27% and cut VRAM by nearly half with an imperceptible accuracy degradation ($<0.003$ mAP).
- **INT8 Requires Quantization-Aware Training (QAT)**: While INT8 post-training quantization delivered blazing 62ms speeds, thin follicular boundary masks showed slight edge degradation. For safety-critical segmentation, FP16 remains the optimal balance unless QAT is conducted during model training.',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;

INSERT INTO public.blogs (id, title, subtitle, category, read_time, status, cover_image, publish_date, summary, content_markdown, published)
VALUES (
    'structuring-unstructured-healthkit-telemetry',
    'Ingesting Apple HealthKit Telemetry: Automated Schema Normalization & Anomaly Gates',
    'Transforming multi-gigabyte irregular XML export payloads into clean 5-minute time-series observations for clinical AI.',
    'Data Engineering & Clinical AI',
    '7 min read',
    'Engineering Note',
    '/Portfolio/assets/blogs/structuring-unstructured-healthkit-telemetry.png',
    'Jun 2026',
    'Engineering scalable health telemetry parsers at Sodio Technologies. Addresses missing sampling intervals, physiological boundary verification, and deterministic schema sanitization before downstream model consumption.',
    '### The Messiness of Real-World Health Exports
Consumer health devices such as the Apple Watch generate continuous biometric data streams (heart rate, step counts, sleep stages, active energy). However, raw exports from Apple HealthKit are delivered as massive, irregular XML files often exceeding 2 to 5 Gigabytes.

The data engineering challenge at Sodio Technologies was transforming these unstructured, irregularly sampled XML records into a **structured, queryable clinical data store**.

### Pipeline Architecture: Stream Parsing & Resampling

\',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    category = EXCLUDED.category,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    publish_date = EXCLUDED.publish_date,
    summary = EXCLUDED.summary,
    content_markdown = EXCLUDED.content_markdown;
