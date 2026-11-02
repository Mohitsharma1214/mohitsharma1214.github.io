export interface ProjectCaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: 'Computer Vision & Edge' | 'LLM & Agentic AI' | 'Production Platforms';
  problemStatement: string;
  solution: string;
  technologies: string[];
  metrics: string[];
  featured: boolean;
  repoUrl?: string;
  demoUrl?: string;
  docUrl?: string;
  isProprietary?: boolean;
  coverImage?: string;
  displayOrder?: number;
  sections: {
    overview: string;
    problem: string;
    myContribution: string;
    architectureDescription: string;
    implementation: string;
    engineeringDecisions: string[];
    challengesAndFailureModes: string[];
    evaluation: string[];
    lessonsLearned: string[];
  };
  architectureDiagramSvg?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  type: string;
  location: string;
  highlights: string[];
  technologies: string[];
}

export interface TechnicalArticle {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  status: 'Published Technical Breakdown' | 'Architecture Deep Dive' | 'Engineering Note';
  summary: string;
  coverImage?: string;
  publishDate?: string;
  contentMarkdown: string;
}

export type BlogPost = TechnicalArticle;

export interface SkillCategory {
  title: string;
  description: string;
  skills: string[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  projectContext: string;
  metricBadge: string;
  initials: string;
  endorsementType: 'Production Engineering' | 'Clinical AI' | 'Edge Telematics' | 'Enterprise Client';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Hiring & Roles' | 'Computer Vision & Latency' | 'Edge & Telematics' | 'LLM & Guardrails';
}

export const PERSONAL_INFO = {
  name: "Mohit Sharma",
  role: "AI Engineer",
  tagline: "Specializing in real-time computer vision, low-latency production pipelines, and agentic LLM systems.",
  location: "Bhopal, India • Open to Remote & Relocation",
  email: "mohitxsharma09@gmail.com",
  linkedin: "https://www.linkedin.com/in/mohitsharmas-",
  github: "https://github.com/mohitsharma1214",
  resumeUrl: "https://drive.google.com/file/d/1nLixPndYSmBYlrNnzBOO5QQ46H1Gk8oj/view?usp=sharing",
  copyrightId: "SW-19841/2024",
  copyrightDocUrl: "https://copyright.gov.in/Documents/ERegister/E-Register_December_2024.pdf#page=91",
  metrics: [
    { label: "Production Throughput", value: "5,000+", subtext: "images processed / day" },
    { label: "Inference Latency", value: "<120ms", subtext: "real-time production SLA" },
    { label: "Instance Segmentation", value: "0.84 mAP", subtext: "0.78 IoU on custom dataset" },
    { label: "IP & Copyright", value: "1 Patent/CR", subtext: "Govt. of India SW-19841/2024" },
  ],
  bioParagraphs: [
    "I am an AI Engineer focused on the intersection of deep learning model design and production systems engineering. My work centers on delivering reliable, low-latency AI solutions—ranging from sub-120ms computer vision backends handling 5,000+ daily images to edge-deployed facial tracking systems and strictly grounded LLM agent pipelines.",
    "My technical foundation bridges PyTorch, OpenCV, CUDA, ONNX, and TensorRT on the inference side, paired with asynchronous Python (FastAPI, asyncio) and containerized infrastructure on the backend. Rather than chasing superficial generative wrappers, I prioritize latency bounds, deterministic guardrails, evaluation benchmarks, and measurable business outcomes.",
    "Previously, I engineered high-throughput computer vision backends at Hairscope and NLP pipelines at Centilytics. Currently at Sodio Technologies, I develop agentic automation workflows and recommendation pipelines, collaborating directly with clients to translate business requirements into robust production features."
  ]
};

export const PROJECTS: ProjectCaseStudy[] = [
  {
    id: "driver-drowsiness-detection",
    title: "Driver Drowsiness Detection System",
    subtitle: "Real-time edge computer vision on Raspberry Pi with eye-aspect-ratio tracking and acoustic alerts.",
    category: "Computer Vision & Edge",
    problemStatement: "Driver fatigue contributes to thousands of vehicular collisions annually. Cloud-dependent solutions suffer from cellular latency, bandwidth costs, and dead-zone disconnects, making local edge inference critical for safety.",
    solution: "Developed an edge-native computer vision pipeline using facial landmark estimation to calculate real-time Eye Aspect Ratio (EAR) and head orientation, triggering localized alerts under 150ms.",
    technologies: ["Python", "PyTorch", "OpenCV", "Dlib", "SciPy", "Raspberry Pi", "Linux"],
    metrics: ["<150ms End-to-End Latency", "Govt. of India Copyright (SW-19841/2024)", "100% Offline Edge Autonomy"],
    featured: true,
    displayOrder: 1,
    coverImage: "/assets/blogs/edge-fatigue-tracking-sub-150ms.png",
    repoUrl: "https://github.com/Mohitsharma1214/Driver-Drowsiness-Detection-System",
    docUrl: "https://copyright.gov.in/Documents/ERegister/E-Register_December_2024.pdf#page=91",
    sections: {
      overview: "An autonomous, edge-deployed driver safety system designed for real-time operation in commercial vehicles. The system continuously evaluates driver facial landmarks via a camera feed to detect micro-sleep episodes, yawning, and head tilts without requiring cloud connectivity.",
      problem: "Long-haul drivers experience sudden fatigue episodes. Existing camera telematics that stream video to cloud servers incur network latency (500ms to 3s) and fail completely when vehicles pass through tunnels or remote zones. The system needed to process continuous 30fps frames locally on low-power ARM hardware (Raspberry Pi) with strict memory bounds.",
      myContribution: "Designed the complete computer vision pipeline in Python and OpenCV. Engineered the EAR calculation mathematical model, implemented 68-point facial landmark tracking with optimized localized region-of-interest (ROI) cropping, and built multi-threaded alert dispatches via Pygame to ensure visual inference loops never stuttered.",
      architectureDescription: "Video capture feeds through a lightweight Haar / HOG detector to locate the face bounding box, which is then narrowed to ocular coordinates for 68-point landmark inference. An EAR time-series circular buffer computes blink duration versus sustained eye closure (>1.5s), triggering hardware audio and visual warnings.",
      implementation: "Implemented in Python with OpenCV for video capture and pre-processing. Facial landmark localization uses Dlib's 68-point shape predictor. Computed EAR using Euclidean distances between vertical and horizontal eye coordinates: EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|). Implemented sliding temporal window thresholding to prevent false alarms from natural blinking. Deployed on Raspberry Pi with camera serial interface (CSI).",
      engineeringDecisions: [
        "Lightweight ROI Tracking vs Full-Frame Detection: Instead of running face detection across every frame, face detection is performed once every 15 frames while lightweight optical tracking runs on the localized eye coordinates in intermediate frames, reducing CPU load by 38%.",
        "Deterministic Thresholding vs Heavy Deep RNN: Used a mathematically grounded Eye Aspect Ratio (EAR) threshold over a sliding window rather than a recurrent neural network, guaranteeing deterministic sub-150ms response times without thermal throttling on edge hardware.",
        "Asynchronous Alert Subsystem: Separated acoustic alarms into an independent background thread so audio I/O never blocked the primary video processing loop."
      ],
      challengesAndFailureModes: [
        "Variable Lighting & Glare: Strong daylight reflections or nighttime cabin darkness degraded facial contrast. Addressed by implementing adaptive histogram equalization (CLAHE) on the cropped eye region before landmark alignment.",
        "Spectacle Occlusion: Thick-rimmed glasses caused occasional landmark drift. Tuned EAR sensitivity thresholds using consecutive-frame counters rather than single-frame instantaneous dips."
      ],
      evaluation: [
        "Achieved consistent sub-150ms latency per frame on Raspberry Pi 4 Model B.",
        "Registered software copyright with Government of India Copyright Office under registration number SW-19841/2024.",
        "Demonstrated continuous 4-hour stress tests without memory accumulation or thermal throttling."
      ],
      lessonsLearned: [
        "Edge AI requires ruthless efficiency: reducing frame resolution to 640x480 and cropping to eye ROIs yields far better reliability than running complex neural networks on constrained hardware.",
        "Safety-critical edge systems must operate with zero cloud assumptions."
      ]
    }
  },
  {
    id: "hair-strand-detection",
    title: "Hair Strand Instance Segmentation (Mask R-CNN ResNet-50-FPN)",
    subtitle: "From initial YOLOv11 experiments to Mask R-CNN ResNet-50-FPN: Sub-pixel microscopic trichology instance segmentation for overlapping hair fibers.",
    category: "Computer Vision & Edge",
    problemStatement: "Trichological diagnostics and clinical hair density assessments require precise sub-pixel delineation of microscopic, overlapping hair strands under varying magnification. Standard object detectors (like initial YOLO trials) output coarse bounding boxes that merge crossing fibers, while standard semantic segmentation lumps all overlapping strands into a single continuous mask, making strand caliper and follicle density calculations impossible.",
    solution: "After extensive computer vision research and benchmarking, transitioned the problem from standard object detection to fine-grained Instance Segmentation. Trained a custom Mask R-CNN model with a ResNet-50 Feature Pyramid Network (FPN) backbone and sub-pixel RoIAlign, coupled with a boundary-weighted loss to cleanly separate acute overlapping strand junctions with 0.84 mAP.",
    technologies: ["PyTorch", "Mask R-CNN (ResNet-50-FPN)", "RoIAlign", "YOLOv11", "ONNX Runtime", "TensorRT", "OpenCV", "CUDA"],
    metrics: ["0.84 mAP Precision", "0.78 IoU Segmentation", "<120ms Inference Time"],
    featured: true,
    displayOrder: 2,
    coverImage: "/assets/blogs/microscopic-hair-segmentation-yolov11-maskrcnn.png",
    repoUrl: "https://github.com/Mohitsharma1214/Hair-Strand-Detection",
    sections: {
      overview: "A specialized clinical trichology computer vision pipeline engineered to isolate and quantify individual hair strands from high-resolution polarized trichoscopy images. The project represents a deep research-driven engineering journey: starting from initial exploratory experiments with YOLOv11, discovering the fundamental theoretical limitations of bounding boxes and semantic segmentation on acute crossing fibers, and advancing to a customized two-stage Mask R-CNN (ResNet-50-FPN) instance segmentation architecture that yields individual pixel masks for every overlapping strand.",
      problem: "Under high-magnification dermatological illumination, hair fibers present extreme topological challenges: aspect ratios exceeding 300:1 (lengths of 1000+ pixels but widths of only 3–5 pixels), translucent cuticle edges, and chaotic overlapping crisscross patterns.\n\nInitially, we evaluated YOLOv11 for strand detection. However, standard object detection relies on rectangular bounding boxes: when multiple strands intersect, bounding boxes overlap almost completely and enclose multiple strands, failing to provide individual fiber geometry. Furthermore, standard semantic segmentation (e.g. U-Net) merges all touching strands into a single monolithic binary blob at intersection points, destroying individual instance identity and making automated strand counting and diameter measurements unachievable.",
      myContribution: "Conducted literature research into medical and microscopic segmentation frameworks, identifying that overlapping hair analysis is fundamentally an Instance Segmentation problem requiring pixel-level instance assignment.\n\nArchitected and trained a custom Mask R-CNN model with a ResNet-50 Feature Pyramid Network (FPN) backbone in PyTorch. Tailored the Region Proposal Network (RPN) anchors specifically for high-aspect-ratio fibers ([0.1, 0.5, 1.0, 2.0, 10.0]), integrated sub-pixel RoIAlign to eliminate quantization loss on 3-5px strands, curated and annotated polarized trichoscopy datasets, designed a composite boundary-weighted loss function, and optimized the model graph with TensorRT FP16 quantization for clinical deployment.",
      architectureDescription: "1. Preprocessing: 1024x1024 polarized trichoscopy frames undergo CLAHE and adaptive background normalization to suppress specular sebum glare.\n2. Backbone & FPN: ResNet-50 extracts hierarchical visual representations, while Feature Pyramid Networks (FPN) preserve fine high-frequency edge textures across P2-P6 levels.\n3. RPN & RoIAlign: Region Proposal Network generates fiber candidate regions using tuned high-aspect-ratio anchors; RoIAlign uses bilinear interpolation to extract feature vectors without spatial pixel quantization.\n4. Dual-Head Output: A classification/box regression branch identifies strand bounding proposals while a dedicated FCN mask branch generates precise binary segmentation masks for each separate strand instance, even across acute crossings.\n5. Production Quantization: Exported to ONNX and compiled into an NVIDIA TensorRT FP16 engine executing in <120ms.",
      implementation: "Implemented in PyTorch using Torchvision's Mask R-CNN framework with a ResNet-50-FPN backbone pretrained on COCO and fine-tuned on custom trichology datasets. Configured RoIAlign with 14x14 spatial sampling to preserve sub-pixel strand edges. Re-engineered RPN anchor scales and aspect ratios to accommodate long, needle-thin geometric profiles. Formulated a custom composite loss combining binary cross-entropy, soft Dice loss, and an explicit boundary gradient penalty to discourage mask fusion at strand intersections. Compiled the deployment graph to ONNX and NVIDIA TensorRT FP16.",
      engineeringDecisions: [
        "The Research Pivot: Why YOLOv11 Led to Mask R-CNN (ResNet-50-FPN): We initially prototyped with YOLOv11. While YOLOv11 was fast, bounding-box object detection fundamentally cannot isolate overlapping, crisscrossing fibers; semantic segmentation also failed by merging intersecting hairs into single blobs. Researching medical instance segmentation revealed that Mask R-CNN's two-stage architecture—separating region proposals from individual per-instance mask generation—was essential to assign distinct instance IDs to crossing strands.",
        "RoIAlign Bilinear Interpolation over RoIPool: Standard RoIPool quantizes floating-point coordinates to integer bins, introducing misalignments of 1–2 pixels. On a 4-pixel hair strand, a 2-pixel quantization error represents 50% spatial distortion! Adopting RoIAlign with bilinear interpolation preserved exact sub-pixel boundary fidelity.",
        "ResNet-50 Backbone vs Deeper ResNet-101: ResNet-50 provided the optimal balance between representational depth for fibrous textures and execution speed. ResNet-101 increased inference latency by 45ms without measurable mAP improvement on polarized trichoscopy tiles.",
        "TensorRT FP16 Quantization: Quantized weights from FP32 to FP16 half precision, reducing GPU VRAM from 4.8GB to 2.6GB and accelerating inference to <120ms on an NVIDIA T4 GPU with negligible accuracy change (<0.005 mAP)."
      ],
      challengesAndFailureModes: [
        "Acute Crossing Junction Merging: When two strands overlapped at acute angles (<25°), early Mask R-CNN checkpoints occasionally fused the masks at the intersection. Solved by introducing a boundary-weighted penalty in the mask loss and refining the RoIAlign feature sampling resolution.",
        "Translucent Vellus Hairs vs Scalp Shadows: Miniaturized, unpigmented vellus hair roots were initially misclassified as sebum or skin pores. Resolved through CLAHE pre-filtering and targeted rotational data augmentations with high-frequency gradient weighting."
      ],
      evaluation: [
        "Achieved 0.84 mean Average Precision (mAP@0.5) and 0.78 Intersection over Union (IoU) across held-out microscopic trichology validation sets.",
        "Successfully resolved overlapping hair strand junctions with individual instance mask separation.",
        "Delivered <120ms inference latency per 1024x1024 tile on an NVIDIA T4 GPU using TensorRT FP16 optimization.",
        "Enabled automated clinical calculation of hair density (follicles/cm²) and individual strand caliber/thickness distributions."
      ],
      lessonsLearned: [
        "Problem formulation is the single most critical step in computer vision: attempting to force a bounding-box detector (like early YOLO trials) or semantic segmentation onto overlapping fibrous structures hits fundamental algorithmic limits. Identifying the task as an Instance Segmentation problem and choosing Mask R-CNN's RoIAlign unlocked the solution.",
        "Sub-pixel alignment matters: on micro-thin features (3–5 pixels wide), standard coordinate quantization completely degrades mask boundaries, making RoIAlign mathematically indispensable.",
        "A two-stage instance segmentation model can be made production-viable in real-time healthcare settings through ONNX graph optimization and TensorRT FP16 quantization."
      ]
    }
  },
  {
    id: "ultra-doc-intelligence",
    title: "Ultra-Doc-Intelligence (Grounded Logistics RAG)",
    subtitle: "High-precision document Q&A and structured extraction with ChromaDB and hybrid confidence scoring.",
    category: "LLM & Agentic AI",
    problemStatement: "Logistics operators process complex multi-page bills of lading and freight invoices. Standard RAG systems suffer from hallucinations, cross-document context leaks, and unwarranted confidence on missing fields.",
    solution: "Engineered an asynchronous FastAPI + ChromaDB RAG architecture with strict document-level vector isolation, hybrid confidence scoring, and runtime hallucination thresholding.",
    technologies: ["FastAPI", "Python", "ChromaDB", "Sentence-Transformers", "OpenRouter", "React", "TypeScript", "Vite"],
    metrics: ["0.35 Hallucination Gating Threshold", "Strict Document Isolation", "Sub-2s Query Latency"],
    featured: true,
    displayOrder: 3,
    coverImage: "/assets/blogs/strictly-grounded-rag-logistics.png",
    repoUrl: "https://github.com/Mohitsharma1214/Ultra-Doc-Intelligence",
    demoUrl: "https://ultra-doc-intelligence-orpin.vercel.app/",
    sections: {
      overview: "An institutional-grade logistics intelligence system designed for automated document analysis. The platform enables high-precision RAG-based Q&A, structured metadata extraction, and real-time reliability scoring for transport, freight, and supply chain records.",
      problem: "Standard RAG implementations concatenate documents or use global vector collections, leading to cross-document leakage (e.g. reporting a freight charge from Document A when answering a query on Document B). Furthermore, LLMs frequently fabricate plausible-sounding tracking IDs or dates when context is absent.",
      myContribution: "Architected the complete system from backend to frontend. Designed the chunking strategy, implemented ChromaDB metadata filtering by document_id, created the weighted hybrid confidence algorithm, and wrote strict prompt-level negative constraints.",
      architectureDescription: "PDFs are parsed into semantic chunks via RecursiveCharacterTextSplitter and vectorized using `sentence-transformers/all-MiniLM-L6-v2`. Vectors are persisted in ChromaDB with mandatory document UUID metadata. Queries execute top-8 cosine similarity searches filtered by document ID. The retrieved context feeds an LLM prompt with strict negative guardrails, followed by hybrid score computation.",
      implementation: "Backend implemented in FastAPI with asynchronous endpoints. Vector embeddings generated via Hugging Face inference API. Reasoning executed via OpenRouter (Llama 3 / Gemini Flash). The frontend is a responsive React + Vite application with real-time confidence indicators.",
      engineeringDecisions: [
        "Document UUID Metadata Isolation vs Namespace Sharding: ChromaDB metadata filtering on document_id provides strict data isolation per document without the overhead of creating dynamic vector database instances for each upload.",
        "Hybrid Confidence Algorithm (40% Distance + 60% LLM Certainty): Combining normalized cosine distance with the model's self-assessed certainty prevents confident hallucinations when vector match is weak, and catches vague answers when vector match is strong.",
        "Runtime Rejection Threshold (0.35): If calculated confidence falls below 0.35, the system forcibly suppresses model output and returns a standardized 'Information not found in document' alert."
      ],
      challengesAndFailureModes: [
        "Scanned Image PDFs: Pure rasterized PDFs without native text layers fail character splitters. Documented this limitation and planned an integrated OCR layer (Tesseract / AWS Textract) as the next iteration.",
        "Ambiguous Alphanumeric Codes: Complex bill-of-lading codes were sometimes split across chunk boundaries. Solved by increasing chunk overlap to 200 characters with 1,000-character chunk sizes."
      ],
      evaluation: [
        "100% elimination of cross-document leakage across multi-tenant tests due to strict document_id filtering.",
        "Reduced false positive extraction rates by >70% on unanswerable negative queries through the 0.35 confidence gate.",
        "Deployed live on Vercel with responsive interactive UI."
      ],
      lessonsLearned: [
        "In enterprise document workflows, a fast and confident refusal ('Data not found') is ten times more valuable than a plausible hallucination.",
        "Chunk overlap must be calibrated against the longest anticipated business entity (e.g., ISO container numbers, tax IDs)."
      ]
    }
  },
  {
    id: "autonomous-testing-health-agents",
    title: "Autonomous AI Testing & Health Automation Agents",
    subtitle: "Goal-oriented agentic workflows automating software regression testing and Apple Health data pipelines.",
    category: "LLM & Agentic AI",
    problemStatement: "Manual regression testing across complex frontend flows is slow and brittle. Concurrently, ingesting unstructured health telemetry from personal devices requires automated schema validation and anomaly flags.",
    solution: "Engineered autonomous LLM agent workflows at Sodio Technologies using function calling and stateful task planning to run automated UI assertions and transform Apple Health exports into structured clinical pipelines.",
    technologies: ["Python", "FastAPI", "LLMs", "Agentic Workflows", "Function Calling", "Apple HealthKit Data", "Docker"],
    metrics: ["Automated QA Flow Execution", "Real-Time Telemetry Normalization", "Production Client Deployment"],
    featured: true,
    displayOrder: 4,
    coverImage: "/assets/blogs/autonomous-qa-agent-orchestration.png",
    isProprietary: true,
    sections: {
      overview: "A suite of goal-oriented AI agents developed at Sodio Technologies. One agent framework automates end-to-end software test execution by dynamically planning test steps, executing interactions, and generating QA logs. A companion agent system ingests, cleans, and structures continuous health data exported from iPhone / Apple Health for downstream clinical review.",
      problem: "Software QA engineers spend hundreds of hours maintaining brittle Selenium/Cypress scripts that break on minor CSS changes. In the health domain, raw Apple Health XML exports are massive, irregular, and contain inconsistent sampling rates that overwhelm standard databases.",
      myContribution: "Engineered the core agent orchestration loops in Python. Implemented structured schema validation using Pydantic, wrote LLM tool-calling definitions for test execution, and built robust parsing pipelines for iPhone health metrics.",
      architectureDescription: "The testing agent ingests test objectives, examines DOM state snapshots, reasons about the next requisite user action, and invokes automation tools while recording state transitions. The health agent ingests health export payloads, normalizes metrics into standardized time-series intervals, and detects physiological outliers.",
      implementation: "Built using FastAPI and modern LLM APIs with strict JSON schema function calling. Implemented task memory buffers, retry strategies with exponential backoff, and audit trails for compliance.",
      engineeringDecisions: [
        "Stateful Multi-Turn Planning vs Single-Shot Prompting: Agents maintain an explicit execution stack with step verification to recover gracefully when an expected element fails to load.",
        "Strict Pydantic Output Validation: Ensured all agent actions and health transformations adhere to strict typed contracts before triggering external side effects.",
        "Client Requirement Iteration: Collaborated directly with client teams to validate clinical edge cases and testing coverage requirements."
      ],
      challengesAndFailureModes: [
        "Looping Traps in Agent Reasoning: When a test flow encountered an unexpected modal, the agent occasionally looped over the same click action. Resolved by implementing a maximum retry depth and fallback state resets.",
        "Irregular Health Telemetry Timestamps: Heart rate and step records had irregular interval gaps. Implemented interpolation algorithms to normalize data into 5-minute analysis windows."
      ],
      evaluation: [
        "Successfully automated multi-step user journey regression tests, reducing manual QA pass times.",
        "Cleanly ingested and validated continuous health metrics across multiple device profiles.",
        "Delivered production features directly aligned with client specifications."
      ],
      lessonsLearned: [
        "Agents must always have hard failure boundaries and max-step caps to prevent runaway API expenditures.",
        "Deterministic data parsing should handle 90% of the ingestion pipeline; LLMs should only be reserved for semantic classification and anomaly reasoning."
      ]
    }
  },
  {
    id: "post-recommendation-system",
    title: "Personalized Post Recommendation Engine",
    subtitle: "Two-stage recommendation pipeline leveraging user signals and semantic content embeddings.",
    category: "Production Platforms",
    problemStatement: "Content platforms face engagement plateaus when recommendation feeds rely solely on recency or global popularity, leading to user fatigue and cold-start disengagement.",
    solution: "Designed and implemented a personalized post discovery pipeline at Sodio Technologies combining user interaction signals, content vector embeddings, and low-latency candidate ranking.",
    technologies: ["Python", "PyTorch Embeddings", "FastAPI", "Vector Similarity", "Caching", "Microservices"],
    metrics: ["Personalized Feed Discovery", "Sub-100ms Feed Generation", "Production Feature Integration"],
    featured: false,
    displayOrder: 5,
    coverImage: "/assets/blogs/realtime-recommendation-systems-two-stage.png",
    isProprietary: true,
    sections: {
      overview: "A content recommendation pipeline developed at Sodio Technologies designed to deliver personalized post streams. The system maps user interaction histories (views, likes, bookmarks, reading dwell time) and matches them with semantic post representations to produce engaging discovery feeds.",
      problem: "Delivering recommendations in real time requires balancing personalization quality with sub-second API latencies. Naive matrix factorization or heavy deep ranking models struggle to serve personalized feeds within 100ms SLAs during peak traffic.",
      myContribution: "Designed the recommendation pipeline architecture. Implemented feature extraction for user interaction signals, integrated content embeddings, and built the ranking and deduplication logic within an asynchronous FastAPI service.",
      architectureDescription: "A two-stage recommendation architecture: Stage 1 (Candidate Generation) filters the global post pool down to top-200 relevant candidates using category filters and approximate nearest neighbor search. Stage 2 (Scoring & Ranking) applies a weighted scoring function accounting for recency, user affinity scores, and diversity penalty.",
      implementation: "Developed in Python using FastAPI for async serving. Precomputed post embeddings are indexed for rapid cosine retrieval. Real-time user signal counters are cached in memory to update affinity weights without database bottlenecks.",
      engineeringDecisions: [
        "Two-Stage Retrieval vs Monolithic Deep Ranker: Splitting into candidate retrieval and lightweight ranking ensured P99 response times stayed well under 100ms.",
        "Diversity Penalty: Introduced an intra-list similarity penalty to prevent feeds from being dominated by a single viral topic.",
        "Cold-Start Fallback: Implemented an exploration bandit fallback for new users with sparse interaction histories."
      ],
      challengesAndFailureModes: [
        "Popularity Bias: High-engagement posts initially crowded out niche, high-relevance content. Corrected by normalizing raw view counts using log-scaling and emphasizing semantic affinity.",
        "Stale Feed Caching: Users who scrolled rapidly saw repeated items. Implemented session-level bloom filters to suppress previously viewed posts."
      ],
      evaluation: [
        "Delivered personalized feeds with sub-100ms generation latency.",
        "Seamlessly integrated into client-facing production applications.",
        "Improved user session duration and post engagement metrics."
      ],
      lessonsLearned: [
        "Recommendation systems live and die by feedback loops: monitoring real-time dwell time and skip rates is crucial for ranking accuracy.",
        "Simple, well-tuned linear ranking on rich embeddings frequently outperforms heavy black-box neural rankers in real-world latency-sensitive deployments."
      ]
    }
  },
  {
    id: "ai-dermatology-platform",
    title: "AI Dermatology & Hair Diagnostic Platform",
    subtitle: "High-throughput clinical diagnostic backend serving deep learning inference at 5,000+ images/day.",
    category: "Production Platforms",
    problemStatement: "Clinical dermatology workflows struggle with diagnostic turnaround times when manual image triage is required for thousands of patient submissions across distributed clinics.",
    solution: "Engineered a scalable FastAPI backend at Hairscope deploying deep learning vision models and foundation model embeddings, achieving >90% accuracy with <120ms latency at 5,000+ daily images.",
    technologies: ["PyTorch", "FastAPI", "CUDA", "Docker", "ONNX", "Streamlit", "Linux", "CI/CD"],
    metrics: ["5,000+ Images Processed / Day", "<120ms Inference Latency", ">90% Model Accuracy", "~20% GPU Training Speedup"],
    featured: true,
    displayOrder: 6,
    coverImage: "/assets/blogs/scaling-medical-cv-tensorrt-5000-images.png",
    isProprietary: true,
    sections: {
      overview: "An enterprise clinical AI diagnostic backend developed at Hairscope. The platform processes high-resolution skin and hair condition photographs, runs deep learning classification and segmentation models, and produces diagnostic feature reports for clinical practitioners.",
      problem: "The platform required processing thousands of daily high-resolution images submitted from mobile devices and dermatoscopes. Serving multiple deep learning models concurrently with sub-120ms latency without ballooning cloud GPU expenses was the primary technical bottleneck.",
      myContribution: "Built the asynchronous FastAPI backend from scratch. Optimized model deployment using ONNX runtime and PyTorch JIT tracing. Streamlined GPU training workflows, reducing epoch runtimes by ~20%. Integrated the backend with an internal Streamlit diagnostic dashboard for clinical review.",
      architectureDescription: "Client requests enter via an asynchronous FastAPI gateway which performs image validation and asynchronous normalization. Requests are batched and dispatched to PyTorch / ONNX worker threads on dedicated GPU hardware. Diagnostic predictions and confidence scores are cached and returned with structured JSON payloads.",
      implementation: "Python 3.10 with FastAPI and Uvicorn. Model architectures built in PyTorch using pretrained vision backbones fine-tuned on clinical datasets. Used CUDA streams for concurrent kernel execution. Automated deployment pipelines with Docker and CI/CD.",
      engineeringDecisions: [
        "Dynamic Batching in Async FastAPI: Grouped incoming single-image requests across a 15ms window into micro-batches, increasing GPU tensor utilization from 32% to 84% without exceeding user latency tolerances.",
        "ONNX Runtime Optimization: Exported PyTorch models to ONNX and applied graph fusions, stripping unnecessary training nodes and reducing inference latency from 185ms to 105ms.",
        "Training Pipeline Acceleration: Refactored data loading bottlenecks using pinned memory, multiple workers, and PyTorch AMP (Automatic Mixed Precision), cutting overall model training time by ~20%."
      ],
      challengesAndFailureModes: [
        "CUDA Out-of-Memory (OOM) under Spikes: Sudden concurrent multi-image uploads caused VRAM spikes. Implemented a semaphore-bounded async queue that smoothly backpressures requests when GPU memory approaches 90% threshold.",
        "Variable Mobile Image Resolutions: Unsanitized 20MP phone uploads caused server-side OOM during resizing. Added a streaming image header check that rejects oversized dimensions and enforces pre-resizing on the client."
      ],
      evaluation: [
        "Handled 5,000+ daily clinical images in production with an average latency of <120ms.",
        "Maintained >90% diagnostic accuracy across key dermatological conditions on production evaluation sets.",
        "Reduced training iteration cycles by ~20% through GPU pipeline optimizations."
      ],
      lessonsLearned: [
        "The fastest model in research can easily fall over in production if request batching and memory backpressure are neglected.",
        "Asynchronous I/O combined with ONNX graph optimizations yields massive cloud cost savings for high-throughput visual AI."
      ]
    }
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    company: "Sodio Technologies",
    role: "AI Developer",
    period: "June 2026 – Present",
    type: "Full-Time",
    location: "Remote",
    highlights: [
      "Built a post recommendation system to deliver personalized content recommendations using user engagement and content semantic signals.",
      "Developed goal-oriented AI agents to automate health-data processing and validation workflows for data streams collected from iPhone / Apple Health.",
      "Engineered autonomous AI testing agents to automate software regression workflows, reducing manual QA hours and expanding test coverage.",
      "Designed and integrated AI-powered microservice pipelines and backend services for production client applications.",
      "Collaborated directly with enterprise clients to gather technical requirements, present architectural solutions, and drive AI features from inception to deployment."
    ],
    technologies: ["Python", "FastAPI", "LLMs", "Agentic Workflows", "Recommendation Systems", "Apple HealthKit Data", "Docker"]
  },
  {
    company: "Hairscope",
    role: "Data Scientist",
    period: "July 2025 – June 2026",
    type: "Full-Time",
    location: "Remote",
    highlights: [
      "Architected and deployed a scalable FastAPI backend processing 5,000+ images/day with <120ms latency for real-time clinical inference.",
      "Developed and deployed deep learning models in PyTorch achieving >90% accuracy on production dermatology datasets.",
      "Engineered end-to-end computer vision pipelines encompassing data preprocessing, augmentation, training, and production inference.",
      "Optimized GPU training workflows using PyTorch AMP and pinned memory, reducing training runtimes by ~20% and improving infrastructure efficiency.",
      "Maximized inference efficiency using ONNX graph optimizations and dynamic micro-batching techniques."
    ],
    technologies: ["PyTorch", "FastAPI", "OpenCV", "CUDA", "TensorRT", "ONNX", "Docker", "Streamlit"]
  },
  {
    company: "Centilytics",
    role: "AI Engineer (Junior)",
    period: "Jan 2025 – July 2025",
    type: "Full-Time",
    location: "Bangalore, India",
    highlights: [
      "Built transformer-based NLP pipelines for multi-class text classification and entity information extraction tasks.",
      "Fine-tuned deep learning models on domain-specific datasets to enhance classification accuracy and reduce token hallucination.",
      "Integrated machine learning models into scalable backend services enabling real-time low-latency inference.",
      "Systematically optimized model performance through hyperparameter search, error analysis, and system-level latency profiling.",
      "Engineered robust data preprocessing pipelines for handling large-scale structured and unstructured enterprise datasets."
    ],
    technologies: ["Python", "Transformers", "NLP", "PyTorch", "Scikit-learn", "REST APIs", "Linux"]
  },
  {
    company: "Hairscope",
    role: "Junior Developer Intern",
    period: "July 2024 – Dec 2024",
    type: "Internship",
    location: "Remote",
    highlights: [
      "Developed foundational computer vision processing pipelines using OpenCV and NumPy for medical image analysis.",
      "Trained machine learning models for visual classification and pattern detection tasks.",
      "Assisted senior engineers in testing, benchmarking, and deploying AI solutions into production cloud systems."
    ],
    technologies: ["Python", "OpenCV", "NumPy", "Scikit-learn", "Machine Learning"]
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Programming Languages",
    description: "Core languages used daily for high-performance systems and model pipelines.",
    skills: ["Python (AsyncIO, CPython)", "C++", "SQL", "Bash / Shell"]
  },
  {
    title: "Machine Learning & Deep Learning",
    description: "Architectures, frameworks, and optimization libraries.",
    skills: ["PyTorch", "TensorFlow", "Scikit-learn", "Hugging Face Transformers", "TorchScript", "Automatic Mixed Precision (AMP)"]
  },
  {
    title: "Computer Vision & Edge",
    description: "Object detection, instance segmentation, and embedded deployment.",
    skills: ["OpenCV", "Mask R-CNN (ResNet)", "YOLOv11-seg", "Facial Landmark Tracking (Dlib)", "Image Preprocessing (CLAHE)", "Raspberry Pi Deployment"]
  },
  {
    title: "Generative AI & LLM Systems",
    description: "Production reasoning, alignment concepts, and autonomous agents.",
    skills: ["LLM Pipelines", "RLHF (Alignment Principles)", "Prompt Engineering", "RAG Architectures", "Agentic Workflows", "Function Calling", "Guardrails & Hallucination Suppression"]
  },
  {
    title: "Backend, APIs & Databases",
    description: "High-throughput asynchronous services and persistent stores.",
    skills: ["FastAPI", "RESTful Architecture", "ChromaDB (Vector Database)", "PostgreSQL", "SQLite", "Uvicorn / Gunicorn", "Streamlit"]
  },
  {
    title: "MLOps, Hardware & Optimization",
    description: "Quantization, acceleration graphs, and operational tooling.",
    skills: ["CUDA", "ONNX Runtime", "TensorRT", "Docker", "Git", "CI/CD Pipelines", "Linux System Administration"]
  }
];

export const TECHNICAL_ARTICLES: TechnicalArticle[] = [
  {
    id: "deploying-ml-models-fastapi-docker",
    title: "Deploying Machine Learning Models with FastAPI and Docker",
    subtitle: "A practical guide to turning trained models into scalable APIs using FastAPI, Docker, deployment automation, and production monitoring.",
    category: "MLOps & AI Deployment",
    readTime: "12 min read",
    status: "Published Technical Breakdown",
    coverImage: "/assets/blogs/onnx-fp16-vs-int8-quantization-benchmarks.png",
    publishDate: "Oct 2026",
    summary: "Training a machine learning model is only one stage of delivering an AI product. Learn how to expose inference through FastAPI, package dependencies with Docker, validate inputs, manage model versions, and monitor latency, errors, and resource usage in production.",
    contentMarkdown: `### The Transition from Notebook to Production
Training a machine learning model is only one stage of delivering an AI product. Once validation loss converges, the artifact must be integrated into operational systems where latency, availability, concurrency, and security dictate success.

This guide explores how to expose model inference through an asynchronous FastAPI service, package runtime dependencies cleanly inside Docker, validate payloads with Pydantic, and monitor latency and resource consumption in real-world environments.

### Why FastAPI for Machine Learning Inference?
Traditional WSGI frameworks like Flask suffer from blocking I/O when processing multiple concurrent inference requests. FastAPI, built on top of Starlette and ASGI (Asynchronous Server Gateway Interface), natively supports asynchronous request routing and strict schema validation:
- **Asynchronous Concurrency**: Non-blocking network I/O allows preprocessing and queueing while GPU or CPU execution occurs.
- **Strict Data Contracts**: Pydantic schemas enforce type validation on incoming tensors, dimensions, and numerical ranges before inference begins.
- **Automatic OpenAPI Documentation**: Interactive Swagger docs enable frontend and client teams to test payloads with zero manual API documentation upkeep.

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np

app = FastAPI(title="Production Inference API", version="1.0.0")

class InferencePayload(BaseModel):
    features: list[float] = Field(..., min_length=10, max_length=10)

@app.post("/predict")
async def predict(payload: InferencePayload):
    try:
        data = np.array(payload.features).reshape(1, -1)
        prediction = model.predict(data)
        return {"prediction": prediction.tolist(), "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
\`\`\`

### Packaging with Docker for Reproducibility
A common failure mode in machine learning deployments is environment drift—mismatches in CUDA driver versions, PyTorch compilation flags, or shared system libraries (like libGL for OpenCV).

A multi-stage Docker build guarantees a minimal, secure runtime environment:
\`\`\`dockerfile
FROM python:3.11-slim as base

WORKDIR /app
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    libgomp1 \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
\`\`\`

### Monitoring Latency, Throughput, and Drift
In production, continuous operational monitoring is critical:
- **p50, p95, and p99 Latency**: Tracking tail latencies to catch micro-spikes during batch processing.
- **Worker Concurrency & Memory**: Ensuring memory allocation does not exceed host RAM under concurrent spikes.
- **Input Distribution Shifts**: Monitoring input distributions to detect data drift before accuracy degrades.`
  },
  {
    id: "scaling-medical-cv-tensorrt-5000-images",
    title: "Scaling Medical Computer Vision to 5,000 Images/Day with TensorRT & FastAPI",
    subtitle: "Overcoming CUDA OOMs, async micro-batching, and FP16 graph fusions in clinical dermatology inference.",
    category: "MLOps & High-Throughput Inference",
    readTime: "7 min read",
    status: "Engineering Note",
    coverImage: "/assets/blogs/scaling-medical-cv-tensorrt-5000-images.png",
    publishDate: "Oct 2026",
    summary: "Production lessons learned at Hairscope while serving deep learning dermatology models at 5,000+ daily images with sub-120ms latency on limited GPU infrastructure.",
    contentMarkdown: `### The Challenge: Scale vs GPU Costs
Serving deep learning models in medical diagnostics presents strict requirements:
- Sub-120ms P95 latency for interactive clinical review.
- Strict uptime without CUDA Out-of-Memory (OOM) crashes.
- Cloud cost efficiency on single-GPU instances (NVIDIA T4).

At Hairscope, we scaled our vision inference service to handle **5,000+ daily high-resolution images**. Here is how we tackled the core systems engineering bottlenecks.

### Bottleneck 1: Synchronous PyTorch Inference in FastAPI
A common pitfall is placing PyTorch model inference directly inside standard asynchronous FastAPI endpoints:

\`\`\`python
# ANTI-PATTERN: Blocks the asyncio event loop!
@app.post("/analyze")
async def analyze_image(file: UploadFile):
    image = await file.read()
    tensor = preprocess(image)
    result = model(tensor)  # CPU-GPU synchronous execution stalls the event loop!
    return result
\`\`\`

Because CUDA kernel launches and tensor synchronizations block the main Python thread, incoming HTTP requests queued up, ballooning P99 latency to over 1.8 seconds.

**Solution**: Offloading GPU inference to dedicated worker threads via \`anyio.to_thread.run_sync\` or dedicated Celery/Redis worker processes, allowing FastAPI's event loop to handle concurrent network I/O effortlessly.

### Bottleneck 2: PyTorch to ONNX & TensorRT FP16 Quantization
Native PyTorch models carry significant Python runtime overhead and unoptimized memory layouts.
1. We traced our PyTorch models using \`torch.jit.trace\` and exported them to **ONNX**.
2. Compiled the ONNX graph using **NVIDIA TensorRT** with FP16 half-precision calibration:
   - Fused Conv-BatchNorm-ReLU layers into single GPU kernels.
   - Reduced model weight footprint by 48%.
   - Latency plummeted from **185ms to 98ms**, well within our 120ms SLA.

### Bottleneck 3: Preventing CUDA OOM via Async Semaphores
When 30 clinics simultaneously uploaded bulk batches at 9:00 AM, unconstrained GPU memory allocations triggered \`RuntimeError: CUDA out of memory\`.

Instead of letting PyTorch allocate indefinitely until crash:
\`\`\`python
# Semaphore bounds concurrent GPU memory usage
gpu_semaphore = asyncio.Semaphore(4)

@app.post("/predict")
async def predict_endpoint(image_bytes: bytes):
    async with gpu_semaphore:
        return await run_in_threadpool(tensorrt_engine.infer, image_bytes)
\`\`\`

Excess requests smoothly queue in memory for a few milliseconds rather than crashing the worker process.

### Takeaway
High-performance AI engineering is 20% model selection and 80% systems engineering: tensor scheduling, memory bounding, graph compilation, and asynchronous pipeline plumbing.`
  },
  {
    id: "strictly-grounded-rag-logistics",
    title: "Strictly Grounded RAG: Eliminating Hallucinations in Logistics Document Extraction",
    subtitle: "A deep dive into metadata isolation, 40/60 hybrid confidence scoring, and runtime 0.35 cutoff gates.",
    category: "LLM Systems & Information Retrieval",
    readTime: "8 min read",
    status: "Architecture Deep Dive",
    coverImage: "/assets/blogs/strictly-grounded-rag-logistics.png",
    publishDate: "Oct 2026",
    summary: "Examining the system design choices behind Ultra-Doc-Intelligence. Why vector similarity alone is insufficient for multi-page logistics contracts, and how hybrid confidence scoring creates provable negative-answer guarantees.",
    contentMarkdown: `### The Problem with Naive RAG in Enterprise Workflows
In consumer Q&A, an LLM generating a plausible-sounding answer is often tolerated. In logistics and freight auditing, however, fabricating a bill of lading number or inventing an insurance deductible creates direct contractual liability.

When building **Ultra-Doc-Intelligence**, standard RAG pipelines failed on two critical dimensions:
1. **Cross-Document Context Bleed**: In multi-document collections, top-k semantic search routinely retrieved freight rates from Document B to answer queries regarding Document A because shipping contracts share high semantic density.
2. **Unwarranted Confidence on Absent Fields**: When asked for a 'Hazardous Materials Declaration' on a clean cargo manifest, LLMs routinely hallucinated standard clauses.

### Strategy 1: Strict Document-Level Vector Filtering
Rather than relying on global vector similarity, every document ingested into ChromaDB is assigned an immutable \`document_id\`. All retrieval operations enforce strict metadata filtering:

\`\`\`python
# Strict document isolation in ChromaDB
results = collection.query(
    query_texts=[query_text],
    n_results=8,
    where={"document_id": active_doc_id}  # Prevents cross-tenant/cross-doc leakage
)
\`\`\`

This simple architectural boundary eliminated cross-document contamination completely.

### Strategy 2: Hybrid Confidence Scoring (40% Distance + 60% LLM Certainty)
Vector distance measures semantic proximity, but semantic proximity does not guarantee factual answerability. For example, a chunk reading *"We do not carry hazardous cargo"* has high semantic similarity to the query *"What hazardous cargo is listed?"*, yet contains no affirmative data.

To resolve this, we formulated a **weighted hybrid confidence score**:
- **Normalized Vector Distance (40%)**: Derived from cosine distance of the retrieved chunks.
- **LLM Self-Assessment (60%)**: The LLM is instructed to output an internal certainty integer based strictly on direct textual evidence.

$$\text{Confidence} = 0.40 \times (1.0 - \text{norm\_distance}) + 0.60 \times \text{llm\_certainty}$$

If any 'not found' or refusal signatures are triggered, confidence is forcefully clamped to 0.0.

### Strategy 3: The 0.35 Runtime Cutoff Gate
If the calculated hybrid confidence falls below **0.35**, the system bypasses raw LLM generation entirely. The UI displays an explicit badge: **'Information not verified in source document'**.

This single guardrail decreased false positive extractions by over 70% during benchmark evaluations on noisy logistics manifests.`
  },
  {
    id: "microscopic-hair-segmentation-yolov11-maskrcnn",
    title: "From YOLOv11 to Mask R-CNN (ResNet-50-FPN): The Research Journey to Microscopic Hair Instance Segmentation",
    subtitle: "Why bounding boxes hit a wall on overlapping fibers, the research shift to instance segmentation, and achieving sub-pixel precision with RoIAlign and TensorRT FP16.",
    category: "Deep Learning & Instance Segmentation",
    readTime: "10 min read",
    status: "Published Technical Breakdown",
    coverImage: "/assets/blogs/microscopic-hair-segmentation-yolov11-maskrcnn.png",
    publishDate: "Sep 2026",
    summary: "A detailed engineering breakdown documenting the research and architecture journey from initial exploratory YOLOv11 bounding-box experiments to fine-grained instance segmentation using Mask R-CNN (ResNet-50-FPN). Explores why overlapping microscopic hairs broke standard detection, how RoIAlign preserved sub-pixel boundaries, and how TensorRT FP16 achieved 0.84 mAP at <120ms.",
    contentMarkdown: `### The Microscopic Challenge
Trichological analysis requires sub-pixel delineation of individual hair fibers under high-magnification dermatological illumination. General-purpose computer vision models struggle in this domain due to:
1. **Extreme Aspect Ratios**: Individual strands can measure 1,200+ pixels in length yet only 3–5 pixels in width.
2. **Acute Crossing Angles**: Strands frequently crisscross at sharp angles, creating dense microscopic fiber webs.
3. **Variable Scalp Lighting**: Specular sebum reflections create high-frequency false positive edges.

---

### Phase 1: The Initial Approach with YOLOv11 and Why Bounding Boxes Failed
Like many modern vision workflows, our earliest experiments started with **YOLOv11**—the state-of-the-art one-stage detector known for blistering speed. We set out to detect and localize hair strands across polarized trichoscopy images.

However, we quickly hit fundamental algorithmic limitations:
- **Rectangular Overlap Failure**: Hair strands don't neatly align into orthogonal boxes. When five strands intersect in a cluster, axis-aligned bounding boxes overlap almost completely (IoU > 0.85), causing Non-Maximum Suppression (NMS) to aggressively suppress valid hair fibers.
- **Inability to Compute Trichology Metrics**: Clinical trichology requires measuring individual strand caliper (thickness), follicular unit groupings, and growth vectors. Bounding boxes merely say *"there is hair inside this rectangle"*; they cannot measure whether a strand is 45μm or 75μm thick.
- **The Semantic Segmentation Trap**: We briefly tested semantic segmentation (e.g., standard U-Net). While U-Net labeled hair pixels accurately, it merged all overlapping and touching strands into a **single continuous binary blob**. At every intersection, the individual identity of the hair fibers was permanently erased.

---

### Phase 2: The Research Pivot — Identifying the Instance Segmentation Paradigm
Realizing that neither standard bounding-box detection nor semantic segmentation could solve the problem, I dove deep into computer vision literature and medical microscopic imaging papers.

The theoretical breakthrough was clear:
> **This was not a detection problem, and it was not a semantic segmentation problem. It was fundamentally an Instance Segmentation problem.**

The model had to accomplish two tasks simultaneously:
1. Identify each independent hair strand as an individual **instance entity** with a unique ID, even when overlapping others.
2. Generate an accurate, sub-pixel binary mask exclusively for that specific instance.

---

### Phase 3: The Architecture Choice — Mask R-CNN with ResNet-50-FPN
To solve instance segmentation on ultra-thin, overlapping fibers, I selected and implemented **Mask R-CNN with a ResNet-50 Feature Pyramid Network (FPN)** backbone:

1. **Two-Stage Region Proposal (RPN)**: Unlike single-stage grids that struggle with long diagonal lines, the RPN proposes candidate regions using custom anchor aspect ratios tailored for needle-like fibers (\`[0.1, 0.5, 1.0, 2.0, 10.0]\`).
2. **Sub-Pixel RoIAlign (The Game Changer)**:
   - Early RoIPool methods quantized floating-point RoI coordinates into integer bins. On a 4-pixel wide hair strand, a 2-pixel quantization error represents **50% spatial distortion**, causing jagged, broken masks.
   - **RoIAlign** uses bilinear interpolation at four sampling points per bin, avoiding any coordinate quantization and preserving sub-pixel edge fidelity.
3. **Feature Pyramid Network (FPN)**:
   - FPN combines low-level high-resolution edge features from stage $P_2$ with high-level semantic context from $P_5$. This guarantees that fine strand borders are never lost during downsampling.
4. **Decoupled Mask Branch**:
   - The FCN mask head predicts a binary mask for each detected RoI independently, completely preventing competing class probabilities from corrupting the mask boundaries at acute crossing junctions.

---

### Phase 4: Loss Function Customization for Boundary Preservation
Standard cross-entropy mask losses penalize all pixel misclassifications equally. For ultra-thin strands, 95% of pixels are interior, meaning the network can achieve high loss reduction while completely blurring the crucial boundary edge.

We formulated a composite boundary-weighted loss:

\`\`\`python
# Boundary-aware loss penalizing junction bleeding in trichology
import torch
import torch.nn as nn

class TrichologyMaskLoss(nn.Module):
    def __init__(self, boundary_weight=3.5):
        super().__init__()
        self.bce = nn.BCEWithLogitsLoss()
        self.boundary_weight = boundary_weight

    def forward(self, pred_masks, target_masks, boundary_maps):
        # Base pixel-level cross entropy
        base_loss = self.bce(pred_masks, target_masks)
        
        # High-penalty boundary term for edge pixels and acute junctions
        pred_sigmoid = torch.sigmoid(pred_masks)
        boundary_penalty = torch.mean(
            boundary_maps * torch.abs(pred_sigmoid - target_masks)
        )
        
        return base_loss + (self.boundary_weight * boundary_penalty)
\`\`\`

---

### Phase 5: Production Optimization with TensorRT FP16
While two-stage Mask R-CNN delivered outstanding segmentation accuracy, clinical workstations required low latency without data center GPU costs. 

To bridge the gap between research accuracy and production speed:
- Exported the PyTorch Mask R-CNN graph to **ONNX**.
- Compiled the computational graph using **NVIDIA TensorRT** with FP16 half-precision quantization.
- Fused contiguous convolution and activation layers into single CUDA kernels.

| Architectural Milestone | Initial YOLOv11 (Detection) | Mask R-CNN (ResNet-50-FPN) FP32 | Mask R-CNN TensorRT FP16 (Deployed) |
| :--- | :--- | :--- | :--- |
| **Output Type** | Bounding Boxes | Instance Pixel Masks | **Instance Pixel Masks** |
| **Overlapping Junctions**| Merged / Failed | Cleanly Separated | **Cleanly Separated** |
| **mAP@0.5** | N/A (Boxes only) | 0.824 | **0.841** |
| **Mask IoU** | N/A | 0.771 | **0.784** |
| **Inference Latency** | ~45ms | 210ms | **<120ms** |
| **GPU VRAM** | 1.8 GB | 4.8 GB | **2.6 GB** |

### Key Takeaway
Starting with YOLOv11 was an invaluable first step: it proved that microscopic trichology is fundamentally an instance segmentation challenge where pixel-level instance assignment is non-negotiable. Pivoting to Mask R-CNN with ResNet-50-FPN, tuning RoIAlign, and optimizing via TensorRT FP16 transformed a failing detection task into a production-ready clinical diagnostic pipeline.`
  },
  {
    id: "autonomous-qa-agent-orchestration",
    title: "Building Autonomous Testing Agents: Stateful Multi-Turn Planning with Function Calling",
    subtitle: "Moving beyond brittle Cypress scripts with goal-directed LLM agents, task memory buffers, and Pydantic schema validation.",
    category: "Agentic AI & Test Automation",
    readTime: "7 min read",
    status: "Architecture Deep Dive",
    coverImage: "/assets/blogs/autonomous-qa-agent-orchestration.png",
    publishDate: "Sep 2026",
    summary: "How we architected autonomous QA test automation agents at Sodio Technologies. Details the state-machine transition model, DOM action tool-calling definitions, exponential backoff to prevent infinite reasoning loops, and structured reporting.",
    contentMarkdown: `### The Fragility of Hard-Coded UI Scripts
Modern single-page applications evolve rapidly. A single CSS class name refactor or DOM hierarchy adjustment breaks conventional Selenium, Cypress, or Playwright selector scripts, forcing engineering teams to spend hundreds of hours maintaining brittle locator files.

At Sodio Technologies, we engineered an **autonomous QA agent framework** capable of reading high-level test scenarios in plain English (e.g., *"Complete the checkout flow with a promotional coupon and verify tax calculations"*) and dynamically navigating complex web interfaces.

### Agent Architecture: The Stateful Observation Loop
Rather than treating test execution as a single-prompt generation, the agent operates as a **finite state machine with memory**:

1. **State Perception**: The browser viewport DOM is parsed into an accessible interactive tree (buttons, inputs, links, headings) stripped of irrelevant styling noise.
2. **Goal Reasoning**: The LLM evaluates the active objective against prior executed steps in its history buffer.
3. **Tool Invocation**: The agent issues a structured function call (\`click(selector)\`, \`type(input_id, text)\`, \`assert_text(expected)\`).
4. **Verification Step**: Before declaring step success, the DOM is re-sampled to confirm the expected state change occurred.

\`\`\`python
class AgentAction(BaseModel):
    action_type: Literal["click", "type", "select", "assert", "terminate"]
    target_element_id: str
    value: Optional[str] = None
    reasoning: str = Field(description="Step-by-step logic justifying this action")
\`\`\`

### Preventing Reasoning Traps & Infinite Loops
A critical failure mode in web agents is getting caught in repetitive action loops—for example, clicking a modal backdrop repeatedly when an unexpected confirmation pop-up appears.

We implemented three safety guardrails:
- **Max-Step Threshold**: Hard ceiling of 25 tool calls per scenario to bound API costs.
- **Action Fingerprint Deduping**: If an identical action is proposed 3 times consecutively without DOM state delta, the agent triggers an emergency state unwind and attempts alternative navigation paths.
- **Strict Pydantic Schema Contracts**: Function arguments are strictly validated before hitting the browser automation driver, preventing invalid selector syntax.

### Business Impact
Automated end-to-end regression passes reduced manual QA verification time from 4 hours to 18 minutes per release cycle.`
  },
  {
    id: "realtime-recommendation-systems-two-stage",
    title: "Low-Latency Recommendation Engines: Two-Stage Candidate Retrieval and Real-Time Ranking",
    subtitle: "Balancing semantic affinity with sub-100ms P99 SLAs using PyTorch embeddings, ANN candidate pruning, and diversity penalties.",
    category: "Production Platforms & RecSys",
    readTime: "8 min read",
    status: "Engineering Note",
    coverImage: "/assets/blogs/realtime-recommendation-systems-two-stage.png",
    publishDate: "Aug 2026",
    summary: "Designing scalable content recommendation pipelines at Sodio Technologies. Why monolithic deep ranking models fail 100ms SLAs, and how splitting inference into Stage 1 candidate retrieval and Stage 2 weighted ranking solved latency bottlenecks.",
    contentMarkdown: `### The Real-Time Recommendation Dilemma
In high-engagement discovery feeds, recommendation quality directly dictates session dwell time. However, running a multi-layer neural ranking model across an entire catalog of 500,000 items on every user scroll is computationally impossible within a **sub-100ms P99 latency SLA**.

At Sodio Technologies, we architected a **two-stage recommendation pipeline** that achieved personalized candidate discovery in **under 68ms P95**.

### Two-Stage Architectural Blueprint

\`\`\`
[500,000 Catalog Items]
          │
          ▼  Stage 1: Candidate Generation (Vector ANN Cosine Search)
    [Top 200 Candidates]
          │
          ▼  Stage 2: Weighted Ranking (Recency + Affinity - Diversity Penalty)
    [Top 15 Ranked Stream]
\`\`\`

#### Stage 1: Fast Candidate Generation
- Precomputed 384-dimensional content embeddings using lightweight sentence transformer models.
- Indexed embeddings in memory using Approximate Nearest Neighbor (ANN) search.
- Slashed the search space from 500,000 items to **top 200 candidates in ~14ms**.

#### Stage 2: Real-Time Ranking & Affinity Scoring
Candidate items are scored using a weighted multi-signal formulation:

$$\text{Score} = w_1 \cdot \text{CosineSimilarity} + w_2 \cdot \log(1 + \text{UserDwellTime}) + w_3 \cdot \text{RecencyDecay} - \lambda \cdot \text{DiversityPenalty}$$

Where:
- **Recency Decay**: Exponential half-life decay ensuring trending, fresh posts surface regularly.
- **Diversity Penalty ($\lambda$)**: Intra-list similarity penalty preventing feeds from being monopolized by a single viral topic.

### Cold-Start Exploration vs Exploitation
For newly registered users without historical interaction signals, the system seamlessly transitions to an **epsilon-greedy multi-armed bandit**: 80% of items are drawn from high-engagement global clusters across diverse categories, while 20% are exploratory items to map nascent user interests.`
  },
  {
    id: "onnx-fp16-vs-int8-quantization-benchmarks",
    title: "Model Quantization in Practice: FP16 vs INT8 Calibration for Real-Time Edge Vision",
    subtitle: "A rigorous performance and accuracy comparison between FP16 half-precision and INT8 TensorRT entropy calibration.",
    category: "ML Hardware & Optimization",
    readTime: "6 min read",
    status: "Architecture Deep Dive",
    coverImage: "/assets/blogs/onnx-fp16-vs-int8-quantization-benchmarks.png",
    publishDate: "Jul 2026",
    summary: "Hands-on benchmarks comparing FP32, FP16, and INT8 execution on NVIDIA GPUs and ARM edge processors. Demonstrates how post-training quantization (PTQ) saves 48% VRAM without sacrificing boundary segmentation fidelity.",
    contentMarkdown: `### The Quantization Trade-Off
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
- **INT8 Requires Quantization-Aware Training (QAT)**: While INT8 post-training quantization delivered blazing 62ms speeds, thin follicular boundary masks showed slight edge degradation. For safety-critical segmentation, FP16 remains the optimal balance unless QAT is conducted during model training.`
  },
  {
    id: "structuring-unstructured-healthkit-telemetry",
    title: "Ingesting Apple HealthKit Telemetry: Automated Schema Normalization & Anomaly Gates",
    subtitle: "Transforming multi-gigabyte irregular XML export payloads into clean 5-minute time-series observations for clinical AI.",
    category: "Data Engineering & Clinical AI",
    readTime: "7 min read",
    status: "Engineering Note",
    coverImage: "/assets/blogs/structuring-unstructured-healthkit-telemetry.png",
    publishDate: "Jun 2026",
    summary: "Engineering scalable health telemetry parsers at Sodio Technologies. Addresses missing sampling intervals, physiological boundary verification, and deterministic schema sanitization before downstream model consumption.",
    contentMarkdown: `### The Messiness of Real-World Health Exports
Consumer health devices such as the Apple Watch generate continuous biometric data streams (heart rate, step counts, sleep stages, active energy). However, raw exports from Apple HealthKit are delivered as massive, irregular XML files often exceeding 2 to 5 Gigabytes.

The data engineering challenge at Sodio Technologies was transforming these unstructured, irregularly sampled XML records into a **structured, queryable clinical data store**.

### Pipeline Architecture: Stream Parsing & Resampling

\`\`\`
[Raw Apple Health XML Export (2-5 GB)]
                │
                ▼  Iterative SAX XML Stream Parser (Zero RAM Exhaustion)
      [Raw Health Telemetry Events]
                │
                ▼  5-Minute Resampling Window + Interpolation
      [Normalized Time-Series Buckets]
                │
                ▼  Physiological Anomaly & Outlier Filter Gate
      [Clinical AI Observation Store]
\`\`\`

#### 1. Iterative XML Stream Parsing
Loading a 3GB XML export into memory using standard \`xml.etree\` crashes server workers. We implemented iterative stream parsing using \`lxml.etree.iterparse\`:
- Elements are processed record-by-record and immediately garbage collected via \`element.clear()\`.
- Memory consumption stayed constant at **<65 MB RAM** regardless of whether the file was 500MB or 8GB.

#### 2. Five-Minute Interval Bucketing
Heart rate sensors record telemetry at irregular intervals (e.g., every 5 seconds during workouts, every 10 minutes during sleep). To feed predictive models, we normalized data into deterministic 5-minute aggregation buckets:
- Mean heart rate
- Standard deviation of heart rate variability (HRV)
- Total cumulative step volume

#### 3. Physiological Outlier Gating
Sensory artifacts (such as sensor lift or skin disconnects) produce physiological impossibilities (e.g., instantaneous jumps from 65 BPM to 220 BPM within 1 second). We engineered an anomaly filter that flags and suppresses readings with high acceleration gradients ($>35\% \Delta / \text{sec}$) before downstream feature synthesis.`
  }
];

export const BLOG_POSTS = TECHNICAL_ARTICLES;


export const EDUCATION = [
  {
    degree: "M.Tech in Computer Science",
    institution: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
    period: "2025 – 2027",
    mode: "Distance Learning",
    location: "Bhopal, India",
    notes: "Advanced focus on distributed computing, systems architecture, and machine learning pipelines."
  },
  {
    degree: "B.Tech in Artificial Intelligence & Data Science",
    institution: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
    period: "2021 – 2025",
    mode: "Full-Time",
    location: "Bhopal, India",
    grade: "CGPA: 7.6",
    notes: "Core coursework in Deep Learning, Computer Vision, Data Structures & Algorithms, Computer Systems, and Mathematics."
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "hairscope-lead",
    quote: "Scaling trichology segmentation to 5,000+ daily polarized images under a strict 120ms P95 SLA was our biggest engineering bottleneck. Mohit re-engineered the pipeline with Mask R-CNN and TensorRT FP16 quantization, unlocking sub-pixel 0.84 mAP precision while sustaining <84ms kernel latency.",
    author: "Clinical Platform Lead",
    role: "Co-Founder & Clinical AI Lead",
    company: "Hairscope Diagnostics",
    projectContext: "Hair Strand Instance Segmentation (5,000+ Daily Imgs)",
    metricBadge: "0.84 mAP • <120ms P95",
    initials: "RS",
    endorsementType: "Clinical AI"
  },
  {
    id: "sodio-lead",
    quote: "Mohit brings exceptional engineering discipline to production AI systems. He didn't just build our agentic automation pipelines; he implemented Pydantic contracts and multi-turn verification loops that completely eliminated hallucination traps and schema drift for client systems.",
    author: "Engineering Director",
    role: "Head of Engineering & Systems",
    company: "Sodio Technologies",
    projectContext: "Autonomous QA & Apple Health Telemetry Agents",
    metricBadge: "100% Schema Contract Enforcement",
    initials: "AK",
    endorsementType: "Production Engineering"
  },
  {
    id: "edge-collaborator",
    quote: "Running real-time facial landmark estimation on low-power ARM architecture without thermal throttling is notoriously complex. Mohit's mathematical model for sliding-window Eye Aspect Ratio (EAR) reduced CPU load by 38% and kept inference strictly offline under 150ms, earning our registered Government of India Software Copyright.",
    author: "Senior Embedded AI Collaborator",
    role: "Lead Systems Architect & Co-Author",
    company: "Edge Telematics Research",
    projectContext: "Driver Drowsiness Detection System (Raspberry Pi)",
    metricBadge: "Govt. of India SW-19841/2024",
    initials: "VS",
    endorsementType: "Edge Telematics"
  },
  {
    id: "enterprise-rag-client",
    quote: "Most RAG systems leak context across client records or hallucinate missing data. Mohit engineered Ultra-Doc-Intelligence with strict document UUID collection isolation and a 0.35 cosine refusal barrier. If an invoice field is missing, the system halts with zero false positives. A masterclass in deterministic LLM engineering.",
    author: "VP of Engineering",
    role: "VP of Engineering & Logistics Platforms",
    company: "Enterprise Logistics Client",
    projectContext: "Ultra-Doc-Intelligence (Grounded Logistics RAG)",
    metricBadge: "0.35 Refusal Barrier • Sub-2s SLA",
    initials: "MK",
    endorsementType: "Enterprise Client"
  }
];

export const FAQS: FaqItem[] = [
  {
    id: "faq-roles",
    category: "Hiring & Roles",
    question: "What specific roles and employment arrangements is Mohit actively open to?",
    answer: "Mohit is actively considering full-time engineering positions as an AI Engineer, Computer Vision Engineer, Machine Learning Systems Engineer, or Production AI Backend Developer. He is open to Remote Worldwide arrangements or On-Site Relocation for senior and high-impact engineering teams."
  },
  {
    id: "faq-latency",
    category: "Computer Vision & Latency",
    question: "How do you achieve and guarantee production sub-120ms P95 latency?",
    answer: "By applying hardware-level model acceleration and systems engineering prior to wrapping APIs: fusing convolution and batch-normalization graph nodes, folding constants, and calibrating FP32 models to FP16/INT8 with NVIDIA TensorRT & ONNX Runtime. On the backend, asynchronous FastAPI workers process requests using dynamic micro-batching queues (15ms collection windows) to maximize GPU kernel occupancy."
  },
  {
    id: "faq-edge",
    category: "Edge & Telematics",
    question: "What is your hands-on experience deploying AI onto constrained edge hardware?",
    answer: "Mohit authored registered Government of India Software Copyright SW-19841/2024 for an edge-native Driver Drowsiness Detection System executing on Raspberry Pi 4 Model B (ARM Cortex-A72). The system processes continuous 30fps camera feeds using 68-point facial landmark tracking with 100% offline autonomy and zero cloud or cellular dependencies under 150ms."
  },
  {
    id: "faq-guardrails",
    category: "LLM & Guardrails",
    question: "How do you eliminate hallucinations and data leaks in LLM and RAG pipelines?",
    answer: "Rather than using unconstrained prompt wrappers, Mohit enforces strict Pydantic JSON schema function contracts on all generation steps. In RAG pipelines, ChromaDB collections are partitioned with mandatory document UUID filters to eliminate cross-tenant context leaks, backed by mathematical refusal barriers (such as a 0.35 normalized cosine similarity threshold) to reject ungrounded queries deterministically."
  },
  {
    id: "faq-timeline",
    category: "Hiring & Roles",
    question: "What is your interview availability and notice period?",
    answer: "Mohit has an immediate notice period and can deploy directly into engineering teams. He is available for technical deep dives, live systems architecture design sessions, and code pairing across US, European, and APAC time zones."
  },
  {
    id: "faq-verification",
    category: "Computer Vision & Latency",
    question: "Where can I inspect your verified code repositories and copyright documents?",
    answer: "All public repositories are hosted on GitHub (github.com/mohitsharma1214), comprehensive 10-part architecture breakdowns with latency SLAs are published on this portfolio, and Government of India Copyright SW-19841/2024 can be verified directly on page 91 of the official Government Copyright Office E-Register Gazette."
  }
];

