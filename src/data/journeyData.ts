export interface JourneyMilestone {
  id: string;
  year: string;
  period: string;
  title: string;
  role: string;
  organization: string;
  location: string;
  category: 'foundations' | 'edge-ip' | 'nlp-systems' | 'clinical-scale' | 'agents-recommendation';
  categoryLabel: string;
  badge: string;
  iconName: 'GraduationCap' | 'Award' | 'Cpu' | 'Activity' | 'Bot' | 'Rocket';
  headline: string;
  story: string;
  engineeringBreakthroughs: string[];
  metrics: {
    label: string;
    value: string;
    subtext?: string;
  }[];
  stack: string[];
  recruiterValue: {
    summary: string;
    competenciesProven: string[];
  };
  proofLinks?: {
    label: string;
    url: string;
    isExternal: boolean;
    projectId?: string;
  }[];
}

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: "foundations-btech",
    year: "2021",
    period: "2021 – 2025",
    title: "Rigorous Mathematical & AI Foundations",
    role: "B.Tech in Artificial Intelligence & Data Science",
    organization: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
    location: "Bhopal, India",
    category: "foundations",
    categoryLabel: "Academic & Systems Grounding",
    badge: "Degree Foundation",
    iconName: "GraduationCap",
    headline: "Mastering deep learning theory, computer systems, and numerical optimization from first principles.",
    story: "Built deep engineering fundamentals in linear algebra, multivariable calculus, data structures, and computer architecture. Rather than treating neural networks as opaque libraries, focused on loss gradients, CUDA concurrency, memory layouts, and algorithmic complexity.",
    engineeringBreakthroughs: [
      "Deep Dive in CV & Neural Architectures: Implemented custom CNNs, backpropagation loops, and edge detection kernels from scratch in C++ and Python.",
      "Systems & Concurrency Discipline: Studied Linux process scheduling, memory virtualization, and parallel computing that later proved vital for high-throughput GPU inference.",
      "Academic Excellence: Maintained a strong 7.6 CGPA with rigorous coursework in Computer Vision, Deep Learning, and Distributed Databases."
    ],
    metrics: [
      { label: "Degree Program", value: "B.Tech AI & DS", subtext: "Core Computer Science & ML" },
      { label: "Academic Standing", value: "7.6 CGPA", subtext: "Solid engineering record" },
      { label: "Core Foundation", value: "C++ & Python", subtext: "Algorithms & Math" },
    ],
    stack: ["Python", "C++", "PyTorch", "NumPy", "Data Structures", "Linux", "Linear Algebra"],
    recruiterValue: {
      summary: "Unlike self-taught developers who rely strictly on high-level APIs, Mohit possesses a formal computer science and AI engineering degree with deep algorithmic grounding.",
      competenciesProven: [
        "First-principles mathematical understanding of deep learning models",
        "Clean, optimized algorithmic design and memory awareness",
        "Ability to read, evaluate, and implement academic AI research papers"
      ]
    }
  },
  {
    id: "edge-breakthrough-copyright",
    year: "2024",
    period: "2024 (Registered Dec 2024)",
    title: "Edge Hardware Telematics & Govt. Software Copyright",
    role: "Lead Systems Architect & Author",
    organization: "Government of India Copyright Office",
    location: "Bhopal, India",
    category: "edge-ip",
    categoryLabel: "Edge AI & Intellectual Property",
    badge: "Govt. Registered Copyright",
    iconName: "Award",
    headline: "Invented, mathematically formulated, and deployed real-time driver fatigue monitoring on constrained ARM silicon.",
    story: "Recognizing that commercial fleet drivers travel through remote corridors with zero cellular connectivity, built an autonomous edge computer vision telematics system on a Raspberry Pi 4 that operates 100% offline with under 150ms response times. Formalized the mathematical framework and was granted official Government of India Copyright registration SW-19841/2024.",
    engineeringBreakthroughs: [
      "Mathematical Geometric Formulation: Formulated instantaneous ocular state via the Eye Aspect Ratio (EAR) metric, avoiding heavy 3D CNNs that would cause thermal throttling on ARM hardware.",
      "1-in-15 Frame Tracking Optimization: Scheduled full HOG face detection only once every 15 frames while lightweight optical ROI tracking ran on intermediate frames, slashing frame cycle time from 122ms to 34ms (a 38% CPU reduction).",
      "Asynchronous Alert Subsystem: Isolated audio and visual alerting routines into separate background threads so I/O never blocked the primary 30 FPS video pipeline.",
      "Government Copyright Granted: Awarded official Software Copyright registration SW-19841/2024 by the Government of India."
    ],
    metrics: [
      { label: "Response Latency", value: "<150ms", subtext: "Real-time edge execution" },
      { label: "Connectivity", value: "100% Offline", subtext: "Zero cloud dependencies" },
      { label: "Official IP", value: "SW-19841/2024", subtext: "Govt. of India Copyright" },
    ],
    stack: ["Python", "OpenCV", "Dlib", "Raspberry Pi", "Linux ARM", "SciPy", "Multithreading"],
    recruiterValue: {
      summary: "Proves exceptional self-driven ownership. Mohit doesn't just write scripts—he conceives end-to-end architectures, optimizes for constrained physical hardware, and produces legally protected intellectual property.",
      competenciesProven: [
        "Edge AI deployment on low-power ARM architectures (Raspberry Pi)",
        "Zero-cloud offline autonomy and real-time latency optimization",
        "Demonstrated software authorship with registered Government IP"
      ]
    },
    proofLinks: [
      {
        label: "View Driver Drowsiness Case Study",
        url: "#project-modal",
        isExternal: false,
        projectId: "driver-drowsiness-detection"
      },
      {
        label: "Official Govt. Gazette (Page 91)",
        url: "https://copyright.gov.in/Documents/ERegister/E-Register_December_2024.pdf#page=91",
        isExternal: true
      },
      {
        label: "GitHub Source Repository",
        url: "https://github.com/Mohitsharma1214/Driver-Drowsiness-Detection-System",
        isExternal: true
      }
    ]
  },
  {
    id: "enterprise-nlp-centilytics",
    year: "2025",
    period: "Jan 2025 – July 2025",
    title: "Enterprise NLP & High-Concurrency Microservices",
    role: "AI Engineer (Junior)",
    organization: "Centilytics",
    location: "Bangalore, India",
    category: "nlp-systems",
    categoryLabel: "NLP & Cloud Microservices",
    badge: "Enterprise Production",
    iconName: "Cpu",
    headline: "Fine-tuning transformers and deploying low-latency text intelligence services for enterprise data.",
    story: "Stepped into enterprise production systems at Centilytics, developing transformer-based NLP pipelines for multi-class enterprise document classification and named entity extraction. Integrated models into scalable REST microservices with rigorous latency profiling.",
    engineeringBreakthroughs: [
      "Transformer Domain Adaptation: Fine-tuned pretrained transformer backbones on domain-specific unstructured enterprise corpora, substantially boosting classification recall and mitigating token hallucinations.",
      "Low-Latency Service Integration: Wrapped models into asynchronous backend services with batching and caching, meeting strict enterprise latency thresholds.",
      "Data Pipeline Engineering: Engineered resilient ingestion and sanitization pipelines capable of parsing massive heterogeneous enterprise datasets without pipeline degradation."
    ],
    metrics: [
      { label: "Domain", value: "Enterprise NLP", subtext: "Transformers & Classification" },
      { label: "Architecture", value: "REST Microservices", subtext: "Async Python & PyTorch" },
      { label: "Deployment", value: "Production Cloud", subtext: "Centilytics Enterprise Stack" },
    ],
    stack: ["Python", "Hugging Face Transformers", "PyTorch", "Scikit-learn", "REST APIs", "Docker", "Linux"],
    recruiterValue: {
      summary: "Demonstrates practical production experience handling messy, real-world enterprise text datasets, fine-tuning large models, and deploying low-latency microservices beyond prototype notebooks.",
      competenciesProven: [
        "Modern NLP pipelines and Transformer fine-tuning",
        "Microservice architecture and API latency optimization",
        "Enterprise-grade data ingestion and quality enforcement"
      ]
    }
  },
  {
    id: "clinical-scale-hairscope",
    year: "2025",
    period: "July 2025 – June 2026",
    title: "Scaling Clinical Computer Vision to 5,000+ Imgs/Day",
    role: "Data Scientist / AI Systems Engineer",
    organization: "Hairscope",
    location: "Remote",
    category: "clinical-scale",
    categoryLabel: "High-Throughput Vision & TensorRT",
    badge: "5,000+ Imgs/Day • <120ms P95",
    iconName: "Activity",
    headline: "Architecting a clinical diagnostic backend delivering sub-120ms P95 inference across 5,000+ daily images.",
    story: "Served as the primary AI engineer responsible for Hairscope's visual diagnostic infrastructure. Prototyped strand detection starting with YOLOv11, researched the fundamental limitations on crossing fibers, pivoted to instance segmentation with Mask R-CNN (ResNet-50-FPN), and accelerated GPU pipelines with TensorRT FP16 quantization to achieve <120ms P95 latency.",
    engineeringBreakthroughs: [
      "From YOLOv11 to Mask R-CNN (ResNet-50-FPN): Prototyped with YOLOv11 bounding boxes, identified through computer vision literature that overlapping fibers required fine-grained instance segmentation, and trained Mask R-CNN with ResNet-50-FPN and sub-pixel RoIAlign to achieve 0.84 mAP and 0.78 IoU.",
      "Production Serving at Scale: Architected and deployed an async FastAPI gateway processing 5,000+ high-resolution clinical images daily with a verified P95 latency under 120ms.",
      "GPU Training Cycle Acceleration: Overhauled data loading and training pipelines using pinned host memory and PyTorch Automatic Mixed Precision (AMP), reducing GPU epoch runtimes by ~20%.",
      "TensorRT FP16 Quantization: Converted PyTorch computational graphs to TensorRT FP16, shrinking VRAM footprint by 42% and dropping inference latency from 210ms to 98ms with negligible accuracy loss (<0.005 mAP)."
    ],
    metrics: [
      { label: "Daily Throughput", value: "5,000+", subtext: "Clinical images / day" },
      { label: "P95 Latency SLA", value: "<120ms", subtext: "Real-time production benchmark" },
      { label: "Model Precision", value: "0.84 mAP", subtext: "0.78 IoU microscopic segmentation" },
      { label: "GPU Optimization", value: "~20% Boost", subtext: "Training cycle acceleration" }
    ],
    stack: ["PyTorch", "Mask R-CNN (ResNet-50-FPN)", "RoIAlign", "YOLOv11", "FastAPI", "TensorRT", "ONNX Runtime", "CUDA", "OpenCV", "Docker"],
    recruiterValue: {
      summary: "This is Mohit's flagship production milestone. It proves senior-level systems capability: running high-concurrency visual inference, managing GPU memory constraints, preventing CUDA OOMs, and hitting tight SLAs in mission-critical healthcare.",
      competenciesProven: [
        "Production GPU deployment with ONNX Runtime and TensorRT FP16",
        "High-throughput asynchronous backend engineering (FastAPI, micro-batching)",
        "Advanced computer vision & fine-grained instance segmentation (mAP/IoU)"
      ]
    },
    proofLinks: [
      {
        label: "View Hair Strand Segmentation Case Study",
        url: "#project-modal",
        isExternal: false,
        projectId: "hair-strand-detection"
      },
      {
        label: "View AI Dermatology Platform Case Study",
        url: "#project-modal",
        isExternal: false,
        projectId: "ai-dermatology-platform"
      }
    ]
  },
  {
    id: "agents-recommendation-sodio",
    year: "2026",
    period: "June 2026 – Oct 2026",
    title: "Autonomous Agentic Workflows & Recommendation Engines",
    role: "AI Developer",
    organization: "Sodio Technologies",
    location: "Remote",
    category: "agents-recommendation",
    categoryLabel: "Agentic AI & Client Engineering",
    badge: "Production AI Engineering",
    iconName: "Bot",
    headline: "Deploying autonomous software QA testing agents and continuous Apple Health telematics pipelines.",
    story: "Engineered stateful, goal-directed AI agent frameworks at Sodio Technologies. Built autonomous software testing agents that dynamically execute frontend regression flows, an Apple Health continuous biometric ingestion normalizer, and a two-stage personalized post recommendation engine.",
    engineeringBreakthroughs: [
      "Autonomous QA Testing Agents: Built goal-oriented LLM agents with explicit step execution stacks, DOM state inspection, and rollback barriers that automate multi-step regression testing.",
      "Apple HealthKit Telemetry Pipeline: Engineered ingestion normalizers that parse irregular iPhone biometric XML exports, interpolating gaps into clean 5-minute clinical windows with physiological outlier gating.",
      "Two-Stage Recommendation Engine: Designed candidate generation and semantic embedding ranking delivering personalized feed generation with sub-100ms response times.",
      "Enterprise Client Leadership: Collaborated directly with client stakeholders to translate high-level business requirements into deterministic AI architectures."
    ],
    metrics: [
      { label: "Agentic Autonomy", value: "Multi-Step", subtext: "Automated regression testing" },
      { label: "Telemetry Normalization", value: "Real-Time", subtext: "Apple HealthKit continuous streams" },
      { label: "Feed SLA", value: "<100ms", subtext: "Two-stage recommendation engine" }
    ],
    stack: ["Python", "FastAPI", "LLMs", "Agentic Workflows", "Function Calling", "Vector Embeddings", "ChromaDB", "Docker"],
    recruiterValue: {
      summary: "Demonstrates cutting-edge expertise in autonomous agentic workflows and LLM tool calling with strict deterministic guardrails. Mohit bridges advanced model capability with client-facing commercial deliverables.",
      competenciesProven: [
        "Agentic LLM architectures, tool/function calling, and loop prevention",
        "Complex biometric time-series telemetry normalization",
        "Direct client communication and technical product delivery"
      ]
    },
    proofLinks: [
      {
        label: "View Autonomous Testing Agents Case Study",
        url: "#project-modal",
        isExternal: false,
        projectId: "autonomous-ai-agents"
      },
      {
        label: "View Post Recommendation Case Study",
        url: "#project-modal",
        isExternal: false,
        projectId: "post-recommendation-system"
      }
    ]
  },
  {
    id: "future-horizon-hiring",
    year: "2027",
    period: "Ongoing (2025 – 2027)",
    title: "M.Tech in CS & Immediate Candidate Readiness",
    role: "Master of Technology (Computer Science) Candidate",
    organization: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
    location: "Open to Remote Worldwide & On-Site Relocation",
    category: "foundations",
    categoryLabel: "Current Trajectory & Hiring Readiness",
    badge: "Available Immediately",
    iconName: "Rocket",
    headline: "Advancing distributed computing research while actively open to senior AI & vision engineering positions.",
    story: "Pursuing M.Tech in Computer Science with a focus on distributed machine learning systems and high-throughput inference infrastructure. Ready to immediately step into high-impact engineering teams building real-time vision, edge telematics, or production AI platforms.",
    engineeringBreakthroughs: [
      "Distributed AI Research: Investigating multi-node model parallelization and low-overhead model serving architectures.",
      "Immediate Production Deployment: Ready to contribute from Day 1 with zero ramp-up time on PyTorch, TensorRT, FastAPI, and containerized deployments.",
      "Flexible Work Model: Available immediately for full-time roles, open to remote worldwide or on-site relocation."
    ],
    metrics: [
      { label: "Advanced Degree", value: "M.Tech (CS)", subtext: "Distributed ML Systems (2025-27)" },
      { label: "Availability", value: "Immediate", subtext: "Zero notice period lag" },
      { label: "Work Model", value: "Remote / Relocate", subtext: "Worldwide flexibility" }
    ],
    stack: ["Distributed Systems", "GPU Clusters", "PyTorch", "TensorRT", "FastAPI", "MLOps", "Production SLAs"],
    recruiterValue: {
      summary: "A rare combination of rigorous academic credentials (B.Tech + M.Tech in CS), verified Government IP, and commercial track record handling 5,000+ daily production requests at <120ms latency.",
      competenciesProven: [
        "Immediate readiness for high-velocity AI product teams",
        "Deep architectural foresight bridging research and infrastructure",
        "Proven commitment to continuous learning and excellence"
      ]
    }
  }
];

export const RECRUITER_VALUE_PROPOSITIONS = [
  {
    title: "Sub-120ms P95 Real-Time Execution",
    description: "Battle-tested with TensorRT, ONNX Runtime, and dynamic micro-batching. Mohit designs models that survive in production, not just benchmark notebooks.",
    tag: "Low-Latency SLA"
  },
  {
    title: "Government Registered IP & Edge AI",
    description: "Authored and registered Govt. of India Copyright SW-19841/2024 for edge Raspberry Pi telematics running 100% offline with zero cloud dependency.",
    tag: "Registered Edge IP"
  },
  {
    title: "5,000+ Images/Day Clinical Scale",
    description: "Maintained >90% diagnostic precision on clinical dermatology pipelines while cutting GPU training cycles by ~20% through pinned memory and AMP optimizations.",
    tag: "High-Throughput Scale"
  },
  {
    title: "Grounded Agentic LLMs & Tool Calling",
    description: "Engineered stateful testing and health data agents with strict Pydantic schemas, loop prevention, and cosine similarity hallucination barriers.",
    tag: "Deterministic Agents"
  }
];
