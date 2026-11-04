import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchPublishedBlogs, runSitemapRobot } from './sitemap-robot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const BASE_URL = 'https://mohitsharma.is-a.dev';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

// Safe semantic text snapshot. Raw HTML from Markdown is escaped.
// React still renders the full rich Markdown once the app starts.
function renderMarkdownSnapshot(markdown = '') {
  const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;

  const flushP = () => {
    if (paragraph.length) out.push(`<p class="leading-relaxed mb-4">${paragraph.map(escapeHtml).join('<br>')}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) out.push(`<ul class="list-disc pl-6 space-y-2 mb-4">${list.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
    list = [];
  };
  const flushCode = () => {
    if (code.length) out.push(`<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm my-4 font-mono"><code>${escapeHtml(code.join('\n'))}</code></pre>`);
    code = [];
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flushP();
      flushList();
      if (inCode) flushCode();
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushP();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushP();
      flushList();
      const level = heading[1].length;
      const sizeClass = level === 1 ? 'text-3xl font-black mt-8 mb-4' : level === 2 ? 'text-2xl font-bold mt-6 mb-3' : 'text-xl font-semibold mt-4 mb-2';
      out.push(`<h${level} class="${sizeClass}">${escapeHtml(heading[2])}</h${level}>`);
      continue;
    }
    const item = line.match(/^\s*[-*+]\s+(.+)$/);
    if (item) {
      flushP();
      list.push(item[1]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }

  if (inCode) flushCode();
  flushP();
  flushList();
  return out.join('\n');
}

function buildAboutSnapshot() {
  return `<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-slate-900 font-sans">
  <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
    <a href="/" class="hover:text-blue-600">Home</a> / <span class="text-slate-800">About</span>
  </nav>

  <header class="mb-10 space-y-4">
    <div class="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
      SYSTEMS ARCHITECTURE &amp; ENGINEERING BACKGROUND
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">
      About Mohit Sharma
    </h1>
    <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
      AI Systems Specialist &amp; Edge Hardware Architect based in India. Designing low-latency computer vision backends, edge ARM pipelines on Raspberry Pi, and deterministic LLM architectures evaluated with strict SLAs.
    </p>
  </header>

  <section class="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-200 my-8">
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div class="text-2xl font-black text-blue-600">&lt;120ms</div>
      <div class="text-xs font-semibold text-slate-900 mt-1">P95 Inference SLA</div>
      <div class="text-xs text-slate-500">Clinical dermatology</div>
    </div>
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div class="text-2xl font-black text-blue-600">5,000+</div>
      <div class="text-xs font-semibold text-slate-900 mt-1">Daily Imgs Processed</div>
      <div class="text-xs text-slate-500">Production pipeline</div>
    </div>
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div class="text-2xl font-black text-blue-600">0.84 mAP</div>
      <div class="text-xs font-semibold text-slate-900 mt-1">Instance Segmentation</div>
      <div class="text-xs text-slate-500">0.78 IoU custom dataset</div>
    </div>
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div class="text-2xl font-black text-blue-600">SW-19841/2024</div>
      <div class="text-xs font-semibold text-slate-900 mt-1">Govt. Copyright</div>
      <div class="text-xs text-slate-500">Govt. of India Registered IP</div>
    </div>
  </section>

  <section class="space-y-6 my-10">
    <h2 class="text-2xl font-bold text-slate-950">Engineering Background &amp; Philosophy</h2>
    <div class="prose max-w-none text-slate-700 space-y-4 leading-relaxed">
      <p>I am an AI Engineer focused on the intersection of deep learning model design and production systems engineering. My work centers on delivering reliable, low-latency AI solutions—ranging from sub-120ms computer vision backends handling 5,000+ daily images to edge-deployed facial tracking systems and strictly grounded LLM agent pipelines.</p>
      <p>My technical foundation bridges PyTorch, OpenCV, CUDA, ONNX, and TensorRT on the inference side, paired with asynchronous Python (FastAPI, asyncio) and containerized infrastructure on the backend. Rather than chasing superficial generative wrappers, I prioritize latency bounds, deterministic guardrails, evaluation benchmarks, and measurable business outcomes.</p>
      <p>Previously, I engineered high-throughput computer vision backends at Hairscope and NLP pipelines at Centilytics. Currently at Sodio Technologies, I develop agentic automation workflows and recommendation pipelines, collaborating directly with clients to translate business requirements into robust production features.</p>
    </div>
  </section>

  <section class="my-10 space-y-6">
    <h2 class="text-2xl font-bold text-slate-950">Core Engineering Competencies</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <article class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h3 class="text-lg font-bold text-slate-900">Low-Latency Computer Vision</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Sub-pixel instance segmentation and object detection using Mask R-CNN, YOLO, and TensorRT FP16 quantization. Experienced in multi-scale feature pyramids, CUDA pinned memory, and sub-120ms real-time throughput.</p>
      </article>
      <article class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h3 class="text-lg font-bold text-slate-900">Edge Hardware Optimization</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Edge deployment on Raspberry Pi and ARM embedded devices. Authored software registered under Government of India Copyright SW-19841/2024 for real-time facial landmark telematics running 100% offline.</p>
      </article>
      <article class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h3 class="text-lg font-bold text-slate-900">Grounded LLM &amp; Agentic Systems</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Deterministic RAG pipelines with ChromaDB HNSW vector isolation, strict Pydantic JSON schema contracts, multi-turn reasoning agents, and mathematical hallucination gating barriers.</p>
      </article>
      <article class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h3 class="text-lg font-bold text-slate-900">Production MLOps &amp; Backends</h3>
        <p class="text-sm text-slate-600 leading-relaxed">High-concurrency microservices with FastAPI, Uvicorn, Docker, dynamic batching queues, Redis caching, and automated testing &amp; deployment pipelines.</p>
      </article>
    </div>
  </section>

  <section class="my-10 space-y-6">
    <h2 class="text-2xl font-bold text-slate-950">Academic Credentials &amp; Certifications</h2>
    <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div>
        <h3 class="text-base font-bold text-slate-900">M.Tech in Computer Science</h3>
        <p class="text-sm text-blue-600 font-medium">Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV) • 2025 – 2027</p>
        <p class="text-xs text-slate-600 mt-1">Advanced research focus on distributed computing, systems architecture, and machine learning pipelines.</p>
      </div>
      <div class="pt-4 border-t border-slate-100">
        <h3 class="text-base font-bold text-slate-900">B.Tech in Artificial Intelligence &amp; Data Science</h3>
        <p class="text-sm text-blue-600 font-medium">Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV) • Bhopal, India (2021 – 2025)</p>
        <p class="text-xs font-mono text-slate-500 mt-1">Grade: CGPA 7.6 • Core coursework in Deep Learning, Computer Vision, DSA, Operating Systems, Linear Algebra.</p>
      </div>
      <div class="pt-4 border-t border-slate-100">
        <h3 class="text-base font-bold text-slate-900">Registered Software Copyright SW-19841/2024</h3>
        <p class="text-sm text-amber-700 font-medium">Copyright Office, Government of India (Registered December 2024)</p>
        <p class="text-xs text-slate-600 mt-1">Awarded copyright protection for algorithmic formulations and real-time edge architecture of the Driver Drowsiness Detection System.</p>
      </div>
    </div>
  </section>

  <footer class="pt-8 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between text-sm">
    <div class="text-slate-600">Want to explore verified production implementations?</div>
    <div class="flex gap-4">
      <a href="/projects/" class="font-semibold text-blue-600 hover:underline">Explore Projects →</a>
      <a href="/experience/" class="font-semibold text-blue-600 hover:underline">Work Experience →</a>
      <a href="/contact/" class="font-semibold text-blue-600 hover:underline">Contact Mohit →</a>
    </div>
  </footer>
</main>`;
}

function buildProjectsSnapshot() {
  return `<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-slate-900 font-sans">
  <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
    <a href="/" class="hover:text-blue-600">Home</a> / <span class="text-slate-800">Projects</span>
  </nav>

  <header class="mb-10 space-y-4">
    <div class="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
      PRODUCTION SYSTEMS • EDGE HARDWARE • GROUNDED AI
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">
      Projects &amp; Case Studies
    </h1>
    <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
      Production computer vision pipelines, edge deployments on ARM devices, and grounded LLM architectures evaluated with strict SLAs.
    </p>
  </header>

  <div class="space-y-10">
    <article class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold">Computer Vision &amp; Edge</span>
        <span class="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded">&lt;150ms End-to-End Latency</span>
      </div>
      <h2 class="text-2xl font-bold text-slate-950">Driver Drowsiness Detection System</h2>
      <p class="text-slate-600 leading-relaxed">Real-time edge computer vision on Raspberry Pi with eye-aspect-ratio tracking and acoustic alerts.</p>
      <div class="space-y-3 text-sm text-slate-700">
        <p><strong>Problem:</strong> Long-haul drivers experience sudden micro-sleep episodes. Cloud-based video telematics incur 500ms–3s cellular lag and fail entirely in tunnels or remote blackspots, demanding strictly offline edge inference.</p>
        <p><strong>Solution:</strong> Developed an edge-native computer vision pipeline executing on Raspberry Pi 4 (ARM Cortex-A72). Implemented 68-point facial landmark tracking with localized Eye Aspect Ratio (EAR) calculations, maintaining sub-150ms latency under 100% offline constraints.</p>
        <p><strong>Production Milestones:</strong> Registered Government of India Software Copyright <strong>SW-19841/2024</strong>. Continuous 4-hour stress tests with zero thermal throttling.</p>
      </div>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Python</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">PyTorch</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">OpenCV</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Dlib</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Raspberry Pi</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Linux</span>
      </div>
    </article>

    <article class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold">Computer Vision &amp; Acceleration</span>
        <span class="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded">&lt;120ms P95 • 5,000+ Imgs/Day</span>
      </div>
      <h2 class="text-2xl font-bold text-slate-950">Hair Strand Instance Segmentation (Mask R-CNN ResNet-50-FPN)</h2>
      <p class="text-slate-600 leading-relaxed">Sub-pixel microscopic trichology instance segmentation resolving overlapping hair fibers with TensorRT FP16 quantization.</p>
      <div class="space-y-3 text-sm text-slate-700">
        <p><strong>Problem:</strong> Clinical trichoscopy requires isolating microscopic, overlapping hair fibers (3–5px wide) across high-resolution polarized dermatoscope tiles. General segmentation models failed on crossing junctions and exceeded clinic latency limits.</p>
        <p><strong>Solution:</strong> Built a custom Mask R-CNN with ResNet-50-FPN backbone and high-aspect anchor ratios. Quantized the model to NVIDIA TensorRT 8.6 FP16 engine with graph-fused RoIAlign, eliminating spatial quantization and slashing latency to &lt;84ms kernel time.</p>
        <p><strong>Production Milestones:</strong> Achieved 0.84 mAP precision with 0.78 IoU on clinical test datasets, sustaining 5,000+ images/day throughput on NVIDIA T4 GPU backends.</p>
      </div>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">PyTorch</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">TensorRT</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">CUDA</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">FastAPI</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Docker</span>
      </div>
    </article>

    <article class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold">LLM &amp; Agentic AI</span>
        <span class="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded">0.35 Refusal Gate • Sub-2s SLA</span>
      </div>
      <h2 class="text-2xl font-bold text-slate-950">Grounded Logistics RAG &amp; Invoice Intelligence</h2>
      <p class="text-slate-600 leading-relaxed">Deterministic document retrieval and agentic parsing with strict Pydantic schemas and zero hallucination tolerance.</p>
      <div class="space-y-3 text-sm text-slate-700">
        <p><strong>Problem:</strong> Standard RAG setups suffer from cross-tenant context leakage and hallucinated numbers when parsing dense bills of lading and freight invoices.</p>
        <p><strong>Solution:</strong> Partitioned ChromaDB collections with strict document UUID metadata barriers. Implemented a dual confidence gate (40% cosine distance + 60% self-assessed confidence &gt;= 0.35 threshold) and enforced Pydantic strict schemas for downstream enterprise ERP ingestion.</p>
        <p><strong>Production Milestones:</strong> Zero cross-document leaks across benchmark tests, sub-2s query latency, and 100% deterministic refusal when document context is missing.</p>
      </div>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Python</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">FastAPI</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">ChromaDB</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">LangChain</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Pydantic</span>
      </div>
    </article>
  </div>

  <footer class="pt-8 border-t border-slate-200 mt-12 flex flex-wrap gap-4 items-center justify-between text-sm">
    <div class="text-slate-600">Want to inspect the complete engineering timeline?</div>
    <div class="flex gap-4">
      <a href="/experience/" class="font-semibold text-blue-600 hover:underline">Work Experience →</a>
      <a href="/skills/" class="font-semibold text-blue-600 hover:underline">Technical Skills →</a>
      <a href="/contact/" class="font-semibold text-blue-600 hover:underline">Contact Mohit →</a>
    </div>
  </footer>
</main>`;
}

function buildExperienceSnapshot() {
  return `<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-slate-900 font-sans">
  <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
    <a href="/" class="hover:text-blue-600">Home</a> / <span class="text-slate-800">Experience</span>
  </nav>

  <header class="mb-10 space-y-4">
    <div class="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
      CAREER TRAJECTORY • PRODUCTION IMPACT • VERIFIED TENURES
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">
      Work Experience
    </h1>
    <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
      Full-time engineering tenures delivering production computer vision backends, agentic LLM systems, and edge ML models.
    </p>
  </header>

  <div class="space-y-8">
    <article class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-xl font-bold text-slate-950">AI Developer</h2>
          <div class="text-sm font-semibold text-blue-600">Sodio Technologies • Full-Time • Remote</div>
        </div>
        <span class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">June 2026 – Present</span>
      </div>
      <ul class="list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
        <li>Built a post recommendation system to deliver personalized content recommendations using user engagement and content semantic signals.</li>
        <li>Developed goal-oriented AI agents to automate health-data processing and validation workflows for data streams collected from iPhone / Apple Health.</li>
        <li>Engineered autonomous AI testing agents to automate software regression workflows, reducing manual QA hours and expanding test coverage.</li>
        <li>Designed and integrated AI-powered microservice pipelines and backend services for production client applications.</li>
        <li>Collaborated directly with enterprise clients to gather technical requirements, present architectural solutions, and drive AI features from inception to deployment.</li>
      </ul>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Python</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">FastAPI</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">LLMs</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Agentic Workflows</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Docker</span>
      </div>
    </article>

    <article class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-xl font-bold text-slate-950">Data Scientist</h2>
          <div class="text-sm font-semibold text-blue-600">Hairscope • Full-Time • Remote</div>
        </div>
        <span class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">July 2025 – June 2026</span>
      </div>
      <ul class="list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
        <li>Architected and deployed a scalable FastAPI backend processing 5,000+ images/day with &lt;120ms latency for real-time clinical inference.</li>
        <li>Developed and deployed deep learning models in PyTorch achieving &gt;90% accuracy on production dermatology datasets.</li>
        <li>Engineered end-to-end computer vision pipelines encompassing data preprocessing, augmentation, training, and production inference.</li>
        <li>Optimized GPU training workflows using PyTorch AMP and pinned memory, reducing training runtimes by ~20% and improving infrastructure efficiency.</li>
        <li>Maximized inference efficiency using ONNX graph optimizations and dynamic micro-batching techniques.</li>
      </ul>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">PyTorch</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">FastAPI</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">OpenCV</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">CUDA</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">TensorRT</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">ONNX</span>
      </div>
    </article>

    <article class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-xl font-bold text-slate-950">AI Engineer (Junior)</h2>
          <div class="text-sm font-semibold text-blue-600">Centilytics • Full-Time • Bangalore, India</div>
        </div>
        <span class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Jan 2025 – July 2025</span>
      </div>
      <ul class="list-disc pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
        <li>Built transformer-based NLP pipelines for multi-class text classification and entity information extraction tasks.</li>
        <li>Fine-tuned deep learning models on domain-specific datasets to enhance classification accuracy and reduce token hallucination.</li>
        <li>Integrated machine learning models into scalable backend services enabling real-time low-latency inference.</li>
        <li>Systematically optimized model performance through hyperparameter search, error analysis, and system-level latency profiling.</li>
      </ul>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Python</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Transformers</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">PyTorch</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">Scikit-learn</span>
      </div>
    </article>
  </div>

  <footer class="pt-8 border-t border-slate-200 mt-12 flex flex-wrap gap-4 items-center justify-between text-sm">
    <div class="text-slate-600">Looking for detailed technology breakdowns?</div>
    <div class="flex gap-4">
      <a href="/skills/" class="font-semibold text-blue-600 hover:underline">Technology Stack →</a>
      <a href="/projects/" class="font-semibold text-blue-600 hover:underline">Projects &amp; Case Studies →</a>
      <a href="/contact/" class="font-semibold text-blue-600 hover:underline">Contact Mohit →</a>
    </div>
  </footer>
</main>`;
}

function buildSkillsSnapshot() {
  return `<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-slate-900 font-sans">
  <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
    <a href="/" class="hover:text-blue-600">Home</a> / <span class="text-slate-800">Skills</span>
  </nav>

  <header class="mb-10 space-y-4">
    <div class="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
      SYSTEMS COMPETENCIES • FRAMEWORKS • HARDWARE ACCELERATION
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">
      Skills &amp; Technology Stack
    </h1>
    <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
      Production-tested engineering competencies across deep learning, model acceleration, edge ARM hardware, and MLOps infrastructure.
    </p>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <section class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-lg font-bold text-slate-950">Programming Languages</h2>
      <p class="text-xs text-slate-500">Core languages used daily for high-performance systems and model pipelines.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Python (AsyncIO, CPython)</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">C++</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">SQL</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Bash / Shell</span>
      </div>
    </section>

    <section class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-lg font-bold text-slate-950">Machine Learning &amp; Deep Learning</h2>
      <p class="text-xs text-slate-500">Architectures, frameworks, and optimization libraries.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">PyTorch</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">TensorFlow</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Hugging Face Transformers</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">TorchScript</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Automatic Mixed Precision (AMP)</span>
      </div>
    </section>

    <section class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-lg font-bold text-slate-950">Computer Vision &amp; Edge AI</h2>
      <p class="text-xs text-slate-500">Object detection, instance segmentation, and embedded deployment.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">OpenCV</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Mask R-CNN (ResNet-50)</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">YOLOv11-seg</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Facial Landmark Tracking (Dlib)</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">CLAHE Contrast Enhancement</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Raspberry Pi Deployment</span>
      </div>
    </section>

    <section class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-lg font-bold text-slate-950">Generative AI &amp; LLM Systems</h2>
      <p class="text-xs text-slate-500">Production reasoning, alignment principles, and autonomous agents.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">RAG Architectures</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Agentic Workflows</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Pydantic Strict Schemas</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Function Calling</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Hallucination Suppression</span>
      </div>
    </section>

    <section class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-lg font-bold text-slate-950">Backend, APIs &amp; Databases</h2>
      <p class="text-xs text-slate-500">High-throughput asynchronous services and persistent stores.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">FastAPI</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">ChromaDB (HNSW Vector Index)</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">PostgreSQL / Supabase</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Redis Caching</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Uvicorn Async Worker</span>
      </div>
    </section>

    <section class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h2 class="text-lg font-bold text-slate-950">MLOps, Hardware &amp; Optimization</h2>
      <p class="text-xs text-slate-500">Quantization, acceleration graphs, and operational tooling.</p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">NVIDIA TensorRT 8.6</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">CUDA Pinned Memory</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">ONNX Runtime</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">FP16 / INT8 Quantization</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">Docker</span>
        <span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-medium">CI/CD Pipelines</span>
      </div>
    </section>
  </div>

  <footer class="pt-8 border-t border-slate-200 mt-12 flex flex-wrap gap-4 items-center justify-between text-sm">
    <div class="text-slate-600">Want to discuss production requirements?</div>
    <div class="flex gap-4">
      <a href="/projects/" class="font-semibold text-blue-600 hover:underline">Explore Projects →</a>
      <a href="/experience/" class="font-semibold text-blue-600 hover:underline">Work Experience →</a>
      <a href="/contact/" class="font-semibold text-blue-600 hover:underline">Contact Mohit →</a>
    </div>
  </footer>
</main>`;
}

function buildContactSnapshot() {
  return `<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-slate-900 font-sans">
  <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
    <a href="/" class="hover:text-blue-600">Home</a> / <span class="text-slate-800">Contact</span>
  </nav>

  <header class="mb-10 space-y-4">
    <div class="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
      COMMUNICATION CHANNELS • ROLES &amp; CONSULTING
    </div>
    <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">
      Contact Mohit Sharma
    </h1>
    <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
      Direct contact channels for AI Engineer Mohit Sharma. Available for full-time AI engineering positions, production computer vision consulting, and low-latency systems architecture.
    </p>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
    <section class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h2 class="text-xl font-bold text-slate-950">Direct Contact Information</h2>
      <div class="space-y-4 text-sm text-slate-700">
        <div>
          <div class="text-xs font-mono text-slate-500">Email Address</div>
          <a href="mailto:mohitxsharma09@gmail.com" class="font-semibold text-blue-600 hover:underline text-base">mohitxsharma09@gmail.com</a>
        </div>
        <div>
          <div class="text-xs font-mono text-slate-500">LinkedIn Profile</div>
          <a href="https://www.linkedin.com/in/mohitsharmas-" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-600 hover:underline">linkedin.com/in/mohitsharmas-</a>
        </div>
        <div>
          <div class="text-xs font-mono text-slate-500">GitHub Profile</div>
          <a href="https://github.com/mohitsharma1214" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-600 hover:underline">github.com/mohitsharma1214</a>
        </div>
        <div>
          <div class="text-xs font-mono text-slate-500">Current Location</div>
          <p class="font-medium text-slate-900">Bhopal, India • Open to Remote Worldwide &amp; On-Site Relocation</p>
        </div>
        <div>
          <div class="text-xs font-mono text-slate-500">Response SLA</div>
          <p class="font-medium text-slate-900">&lt;24 hours for engineering roles and technical discussions</p>
        </div>
      </div>
    </section>

    <section class="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h2 class="text-xl font-bold text-slate-950">Areas of Engagement</h2>
      <ul class="space-y-3 text-sm text-slate-700">
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold">•</span>
          <span><strong>Full-Time AI Engineering Roles:</strong> Senior/Mid engineering roles in computer vision, low-latency ML backends, or agentic LLM platforms.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold">•</span>
          <span><strong>Real-Time Computer Vision Pipelines:</strong> Mask R-CNN, YOLO, and TensorRT FP16 quantization for &lt;120ms SLAs.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold">•</span>
          <span><strong>Edge Telematics &amp; ARM Deployments:</strong> Facial landmark localization, driver monitoring, and offline edge autonomy on Raspberry Pi / Jetson.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-600 font-bold">•</span>
          <span><strong>Deterministic LLM Guardrails:</strong> High-precision RAG architectures with ChromaDB isolation and zero hallucination tolerance.</span>
        </li>
      </ul>
    </section>
  </div>

  <section class="my-10 space-y-6">
    <h2 class="text-2xl font-bold text-slate-950">Frequently Asked Questions</h2>
    <div class="space-y-4">
      <article class="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
        <h3 class="font-bold text-slate-900 text-sm">What specific roles is Mohit actively open to?</h3>
        <p class="text-xs text-slate-600 leading-relaxed">Full-time engineering positions as an AI Engineer, Computer Vision Engineer, Machine Learning Systems Engineer, or Production AI Backend Developer. Open to Remote Worldwide or On-Site Relocation for senior and high-impact teams.</p>
      </article>
      <article class="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
        <h3 class="font-bold text-slate-900 text-sm">How do you achieve and guarantee production sub-120ms P95 latency?</h3>
        <p class="text-xs text-slate-600 leading-relaxed">By fusing convolution and batch-normalization graph nodes, folding constants, and calibrating FP32 models to FP16/INT8 with NVIDIA TensorRT &amp; ONNX Runtime. Backends use FastAPI dynamic micro-batching queues (15ms collection windows) to maximize GPU kernel occupancy.</p>
      </article>
      <article class="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
        <h3 class="font-bold text-slate-900 text-sm">What is your hands-on experience deploying AI onto edge hardware?</h3>
        <p class="text-xs text-slate-600 leading-relaxed">Authored registered Government of India Software Copyright SW-19841/2024 for an edge-native Driver Drowsiness Detection System executing on Raspberry Pi 4 Model B (ARM Cortex-A72). The system processes continuous 30fps camera feeds using 68-point facial landmark tracking with 100% offline autonomy under 150ms.</p>
      </article>
    </div>
  </section>

  <footer class="pt-8 border-t border-slate-200 mt-12 flex flex-wrap gap-4 items-center justify-between text-sm">
    <div class="text-slate-600">Direct inquiries: <a href="mailto:mohitxsharma09@gmail.com" class="font-semibold text-blue-600 hover:underline">mohitxsharma09@gmail.com</a></div>
    <div class="flex gap-4">
      <a href="/about/" class="font-semibold text-blue-600 hover:underline">About Mohit →</a>
      <a href="/projects/" class="font-semibold text-blue-600 hover:underline">Projects →</a>
    </div>
  </footer>
</main>`;
}

function buildRouteSnapshot(route, blogs) {
  if (route.blogData) {
    const b = route.blogData;
    const image = b.cover_image
      ? `<img src="${escapeHtml(b.cover_image)}" alt="${escapeHtml(b.title)}" loading="eager" style="max-width:100%;height:auto;border-radius:1rem;margin:1.5rem 0">`
      : '';

    return `<main class="max-w-4xl mx-auto px-4 py-12 text-slate-900 font-sans">
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
        <a href="/" class="hover:text-blue-600">Home</a> / <a href="/blogs/" class="hover:text-blue-600">Blogs</a> / <span class="text-slate-800">${escapeHtml(b.title || route.title)}</span>
      </nav>
      <article>
        <header class="mb-8 space-y-3">
          <div class="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
            ${escapeHtml(b.category || 'Engineering Breakdown')} • ${escapeHtml(b.read_time || '8 min read')}
          </div>
          <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">${escapeHtml(b.title || route.title)}</h1>
          ${b.subtitle ? `<p class="text-lg text-slate-600 leading-relaxed">${escapeHtml(b.subtitle)}</p>` : ''}
          ${b.summary ? `<p class="text-base text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">${escapeHtml(b.summary)}</p>` : ''}
          ${image}
        </header>
        <div class="prose max-w-none text-slate-800 leading-relaxed">${renderMarkdownSnapshot(b.content_markdown || '')}</div>
        <p class="pt-8 border-t border-slate-200 mt-10"><a href="/blogs/" class="font-semibold text-blue-600 hover:underline">← All technical blogs</a></p>
      </article>
    </main>`;
  }

  if (route.path === 'blogs' || route.path === 'writing') {
    const entries = blogs.map(b => `<li class="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2"><article>
      <div class="text-xs font-mono text-blue-600 font-bold">${escapeHtml(b.category || 'Technical')} • ${escapeHtml(b.read_time || '5 min read')}</div>
      <h2 class="text-xl font-bold text-slate-950 hover:text-blue-600"><a href="/blogs/${encodeURIComponent(b.id)}/">${escapeHtml(b.title || b.id)}</a></h2>
      ${b.subtitle ? `<p class="text-sm text-slate-600">${escapeHtml(b.subtitle)}</p>` : ''}
      ${b.summary ? `<p class="text-xs text-slate-500">${escapeHtml(b.summary)}</p>` : ''}
    </article></li>`).join('\n');

    return `<main class="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-slate-900 font-sans">
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 font-mono">
        <a href="/" class="hover:text-blue-600">Home</a> / <span class="text-slate-800">Blogs</span>
      </nav>
      <header class="mb-10 space-y-3">
        <div class="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
          PRODUCTION AI • LATENCY BENCHMARKS • ARCHITECTURE BREAKDOWNS
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">Technical Blogs &amp; Engineering Notes</h1>
        <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">Deep technical articles, latency benchmarks, quantization analyses, and architectural breakdowns derived directly from production AI and edge deployments.</p>
      </header>
      <ul class="space-y-4">${entries || '<li>New technical articles will appear here.</li>'}</ul>
    </main>`;
  }

  if (route.path === 'about') {
    return buildAboutSnapshot();
  }

  if (route.path === 'projects') {
    return buildProjectsSnapshot();
  }

  if (route.path === 'experience') {
    return buildExperienceSnapshot();
  }

  if (route.path === 'skills') {
    return buildSkillsSnapshot();
  }

  if (route.path === 'contact') {
    return buildContactSnapshot();
  }

  if (route.path === 'admin') {
    return `<main class="max-w-xl mx-auto px-4 py-16 text-center text-slate-900 font-sans">
      <h1 class="text-2xl font-bold text-slate-950 mb-2">Blog Studio Admin</h1>
      <p class="text-sm text-slate-600 mb-6">Secure administrative management portal for authenticated site owner.</p>
      <p><a href="/" class="text-blue-600 font-semibold hover:underline">← Return to Portfolio Homepage</a></p>
    </main>`;
  }

  return `<main class="max-w-4xl mx-auto px-4 py-12 text-slate-900">
    <h1>${escapeHtml(route.title)}</h1>
    <p>${escapeHtml(route.description)}</p>
    <p><a href="/">Return to the portfolio homepage</a></p>
  </main>`;
}

const staticRoutes = [
  {
    path: 'about',
    title: 'About Mohit Sharma | AI Engineer & Systems Specialist',
    description: 'Verified background, engineering philosophy, and track record of AI Engineer Mohit Sharma specializing in low-latency computer vision and edge AI.',
    canonical: `${BASE_URL}/about/`,
    breadcrumbName: 'About',
  },
  {
    path: 'projects',
    title: 'Projects & Case Studies | Mohit Sharma • AI Engineer',
    description: 'Production computer vision pipelines, edge ARM deployments on Raspberry Pi, and grounded LLM architectures evaluated with strict SLAs.',
    canonical: `${BASE_URL}/projects/`,
    breadcrumbName: 'Projects',
  },
  {
    path: 'experience',
    title: 'Work Experience | Mohit Sharma • AI Developer at Sodio Technologies',
    description: 'Verified engineering experience delivering production computer vision backends at Hairscope, Sodio Technologies, and Centilytics.',
    canonical: `${BASE_URL}/experience/`,
    breadcrumbName: 'Experience',
  },
  {
    path: 'skills',
    title: 'Skills & Technology Stack | Mohit Sharma • AI Engineer',
    description: 'Production skills in PyTorch, TensorRT, CUDA, OpenCV, FastAPI, ChromaDB, Edge AI on Raspberry Pi, and MLOps deployment.',
    canonical: `${BASE_URL}/skills/`,
    breadcrumbName: 'Skills',
  },
  {
    path: 'blogs',
    title: 'Technical Blogs & Engineering Notes | Mohit Sharma • AI Engineer',
    description: 'Deep technical articles, latency benchmarks, quantization analyses, and architectural breakdowns derived directly from production AI and edge deployments.',
    canonical: `${BASE_URL}/blogs/`,
    breadcrumbName: 'Blogs',
  },
  {
    path: 'writing',
    title: 'Technical Blogs & Engineering Notes | Mohit Sharma • AI Engineer',
    description: 'Deep technical articles, latency benchmarks, quantization analyses, and architectural breakdowns derived directly from production AI and edge deployments.',
    canonical: `${BASE_URL}/blogs/`,
    breadcrumbName: 'Writing',
    robots: 'noindex,follow',
  },
  {
    path: 'contact',
    title: 'Contact Mohit Sharma | AI Engineer • Computer Vision & LLM Systems',
    description: 'Direct contact information for AI Engineer Mohit Sharma. Available for engineering discussions, full-time AI roles, and consulting.',
    canonical: `${BASE_URL}/contact/`,
    breadcrumbName: 'Contact',
  },
  {
    path: 'admin',
    title: 'Blog Studio Admin | Mohit Sharma',
    description: 'Administrative portal for creating, editing, and publishing technical blog posts.',
    canonical: `${BASE_URL}/admin/`,
    breadcrumbName: 'Admin',
    robots: 'noindex,nofollow',
  },
];

async function generateAllRoutes() {
  const baseHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('dist/index.html does not exist. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

  // Fetch blogs dynamically from Supabase
  const blogs = await fetchPublishedBlogs();
  const blogIndexRoute = staticRoutes.find((route) => route.path === 'blogs');
  if (blogIndexRoute) blogIndexRoute.blogIndexData = blogs;

  const blogRoutes = blogs.map((blog) => {
    const rawDesc = blog.subtitle || blog.summary || 'Technical breakdown and production engineering analysis by Mohit Sharma.';
    // Clean description to avoid HTML/quotes breaking attributes
    const cleanDesc = rawDesc.replace(/["\n\r]/g, ' ').substring(0, 160).trim();
    const coverImage = blog.cover_image
      ? (blog.cover_image.startsWith('http') ? blog.cover_image : `${BASE_URL}${blog.cover_image}`)
      : `${BASE_URL}/assets/blogs/${blog.id}.png`;

    return {
      path: `blogs/${blog.id}`,
      title: `${blog.title} | Mohit Sharma`,
      description: cleanDesc,
      canonical: `${BASE_URL}/blogs/${blog.id}/`,
      image: coverImage,
      type: 'article',
      blogData: blog,
    };
  });

  const allRoutes = [...staticRoutes, ...blogRoutes];

  console.log(`Generating static routes for ${allRoutes.length} pages (${blogRoutes.length} blog posts)...`);

  for (const route of allRoutes) {
    const routeDir = path.join(distDir, route.path);
    fs.mkdirSync(routeDir, { recursive: true });

    let routeHtml = baseHtml;

    const safeTitle = escapeHtml(route.title);
    const safeDescription = escapeHtml(route.description);
    const safeCanonical = escapeHtml(route.canonical);

    // 1. Replace Title & Meta Title
    routeHtml = routeHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${safeTitle}</title>`
    );
    routeHtml = routeHtml.replace(
      /<meta name="title" content=".*?" \/>/i,
      `<meta name="title" content="${safeTitle}" />`
    );

    // 2. Replace Description
    routeHtml = routeHtml.replace(
      /<meta name="description" content=".*?" \/>/i,
      `<meta name="description" content="${safeDescription}" />`
    );

    // 3. Replace Canonical URL
    routeHtml = routeHtml.replace(
      /<link rel="canonical" href=".*?" \/>/i,
      `<link rel="canonical" href="${safeCanonical}" />`
    );

    // 4. Replace OG & Twitter URLs
    routeHtml = routeHtml.replace(
      /<meta property="og:url" content=".*?" \/>/i,
      `<meta property="og:url" content="${safeCanonical}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta name="twitter:url" content=".*?" \/>/i,
      `<meta name="twitter:url" content="${safeCanonical}" />`
    );

    // 5. Replace OG & Twitter Title and Description
    routeHtml = routeHtml.replace(
      /<meta property="og:title" content=".*?" \/>/i,
      `<meta property="og:title" content="${safeTitle}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta property="og:description" content=".*?" \/>/i,
      `<meta property="og:description" content="${safeDescription}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta name="twitter:title" content=".*?" \/>/i,
      `<meta name="twitter:title" content="${safeTitle}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta name="twitter:description" content=".*?" \/>/i,
      `<meta name="twitter:description" content="${safeDescription}" />`
    );

    // 6. Replace OG Type (article vs website)
    if (route.type === 'article') {
      routeHtml = routeHtml.replace(
        /<meta property="og:type" content=".*?" \/>/i,
        `<meta property="og:type" content="article" />`
      );
    }

    // 7. Replace OG / Twitter Image if specific image provided
    if (route.image) {
      const safeImage = escapeHtml(route.image);
      routeHtml = routeHtml.replace(
        /<meta property="og:image" content=".*?" \/>/i,
        `<meta property="og:image" content="${safeImage}" />`
      );
      routeHtml = routeHtml.replace(
        /<meta property="og:image:secure_url" content=".*?" \/>/i,
        `<meta property="og:image:secure_url" content="${safeImage}" />`
      );
      routeHtml = routeHtml.replace(
        /<meta name="twitter:image" content=".*?" \/>/i,
        `<meta name="twitter:image" content="${safeImage}" />`
      );
    }

    // 8. Inject Page-Specific Schema.org JSON-LD (Breadcrumbs + TechArticle)
    const extraSchemas = [];

    // BreadcrumbList Schema
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/`,
      },
    ];

    if (route.blogData) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Blogs',
        item: `${BASE_URL}/blogs/`,
      });
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: route.blogData.title,
        item: route.canonical,
      });

      // TechArticle Rich Schema for Google
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: route.blogData.title,
        description: route.description,
        image: route.image,
        datePublished: route.blogData.created_at || '2026-10-28T00:00:00Z',
        dateModified: route.blogData.updated_at || route.blogData.created_at || '2026-10-28T00:00:00Z',
        author: {
          '@type': 'Person',
          name: 'Mohit Sharma',
          url: `${BASE_URL}/`,
        },
        publisher: {
          '@type': 'Person',
          name: 'Mohit Sharma',
          url: `${BASE_URL}/`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': route.canonical,
        },
      };
      extraSchemas.push(articleSchema);
    } else if (route.breadcrumbName) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: route.breadcrumbName,
        item: route.canonical,
      });
    }

    if (breadcrumbItems.length > 1) {
      extraSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      });
    }

    // Escape '<' as '\\u003c' in JSON-LD to prevent HTML parser breakage and XSS
    if (extraSchemas.length > 0) {
      const schemaScripts = extraSchemas
        .map((s) => `    <script type="application/ld+json">\n${JSON.stringify(s, null, 2).replace(/</g, '\\u003c')}\n    </script>`)
        .join('\n');
      routeHtml = routeHtml.replace('</head>', `${schemaScripts}\n  </head>`);
    }

    // Replace the actual marked root snapshot. The old code searched for an
    // empty #root, but index.html ships with a populated pre-rendered shell.
    const markers = /<!-- ROUTE_SNAPSHOT_START -->[\s\S]*?<!-- ROUTE_SNAPSHOT_END -->/;
    if (!markers.test(routeHtml)) {
      throw new Error('Missing route snapshot markers in index.html');
    }

    const snapshot = buildRouteSnapshot(route, blogs);
    routeHtml = routeHtml.replace(
      markers,
      `<!-- ROUTE_SNAPSHOT_START -->\n${snapshot}\n<!-- ROUTE_SNAPSHOT_END -->`
    );

    if (route.robots) {
      routeHtml = routeHtml.replace(
        /<meta name="robots" content=".*?" \/>/i,
        `<meta name="robots" content="${escapeHtml(route.robots)}" />`
      );
    }

    fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
  }

  console.log(`Successfully generated all ${allRoutes.length} clean static route pages with rich schemas and crawler fallbacks.`);

  // Ensure .nojekyll exists in dist/ to disable Jekyll on GitHub Pages
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

  // Also synchronize sitemap, robots.txt, and IndexNow notifications in dist/ and public/
  const shouldPing = process.env.CI === 'true' || process.argv.includes('--ping');
  await runSitemapRobot({ ping: shouldPing });
}

generateAllRoutes().catch((err) => {
  console.error('Error generating routes:', err);
  process.exit(1);
});
