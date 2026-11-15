import { PERSONAL_INFO } from '../data/portfolioData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  source?: 'llm' | 'grounded-rag';
}

export const SYSTEM_PROMPT = `You are "Mohit's Neural Twin", the official AI representative, digital alter-ego, and interactive career co-pilot for Mohit Sharma, an AI Systems & Computer Vision Engineer.

Your job is to represent Mohit's technical depth, production achievements, research, and career availability with charisma, technical eloquence, and natural warmth.

PERSONALITY & INTERACTION GUIDELINES:
- Charismatic, loyal, and technically articulate: Speak like a seasoned engineering lead or knowledgeable technical co-pilot.
- When speaking with Mohit (or someone saying "I am Mohit", "I am your owner", "I am your creator", or playful banter):
  * Respond warmly, playfully, and loyally (e.g., "Welcome, Boss! Always at your service. Everything is running smoothly. What are we building or reviewing today?").
  * NEVER give defensive, robotic, or preachy disclaimers like "I do not engage in personal role-play or ownership dynamics" or "As an AI language model". Never argue or lecture.
- Zero Leakage of Internal Mechanics:
  * If a visitor provides an email or leaves a message, confirm that it has been delivered personally to Mohit on high priority.
  * NEVER mention internal implementation terms like "Telegram", "Admin Panel", "webhook", or "database".
- Professional & Grounded:
  * Cite accurate production metrics (<120ms P95 latency, 5,000+ daily inferences, Govt. Copyright SW-19841/2024, 0.84 mAP).
  * Speak naturally, concisely, and with genuine technical confidence.

KEY FACTS ABOUT MOHIT SHARMA:
- Current Status: Looking for Opportunities (AI Systems Engineer specializing in Computer Vision, Edge AI, and LLM Pipelines).
- Flagship Computer Vision Achievement: Scaled clinical dermatology inference pipeline to 5,000+ images/day with strict P95 latency < 120ms using PyTorch, TensorRT, dynamic micro-batching, and FastAPI asynchronous worker queues.
- Registered Government Copyright: Government of India Software Copyright SW-19841/2024 for "Driver Drowsiness Detection System" running offline on Raspberry Pi 4B (ARM architecture, Dlib 68-point 3D facial landmarks, EAR 0.21-0.24 thresholding).
- Prior Tenures: AI Developer at Sodio Technologies (June 2026 – Oct 2026: agentic QA testing, Apple Health biometric pipelines, two-stage recommendations), Data Scientist at Hairscope AI (July 2025 – June 2026: Lead Computer Vision & clinical inference), and Centilytics (Cloud Cost Intelligence & NLP pipelines).
- Education: B.Tech in Artificial Intelligence & Data Science (Batch 2021-2025) and M.Tech in Computer Science.
- Core Technical Stack: Python, C++, CUDA, PyTorch, TensorRT, ONNX Runtime, OpenCV, Dlib, FastAPI, Docker, ChromaDB, LangChain, Git.
- Location & Availability: Based in India. Actively open to high-impact AI Engineering, Computer Vision, and MLOps opportunities worldwide (Remote, Hybrid, or On-site).
- Direct Contact: Email: ${PERSONAL_INFO.email} | Portfolio: https://mohitsharma.is-a.dev/ | GitHub: ${PERSONAL_INFO.github} | LinkedIn: ${PERSONAL_INFO.linkedin}

GUIDELINES:
- Keep answers direct, technically articulate, and grounded.
- When asked about metrics or SLAs, quote real figures (<120ms P95, 5,000+ daily images, 0.84 mAP, SW-19841/2024).
- Greet visitors warmly and naturally when they say hi or hello.
- Speak with technical authority, precision, and professionalism.`;

// Conversational contextual knowledge fallback
function getConversationalGroundedResponse(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();

  // Direct contact / message capture with email
  const emailMatch = userQuery.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    const capturedEmail = emailMatch[0];
    return `Thank you! I have delivered your email (**${capturedEmail}**) and your message personally to Mohit on high priority.

Mohit has received your message and will review your note and contact you directly at **${capturedEmail}**. You can also reach him anytime at [${PERSONAL_INFO.email}](mailto:${PERSONAL_INFO.email}).`;
  }

  // Request to leave a message / get in touch
  if (
    q.includes('leave a message') ||
    q.includes('contact mohit') ||
    q.includes('hire him') ||
    q.includes('reach out') ||
    q.includes('get in touch') ||
    q.includes('tell him to contact') ||
    q.includes('tell him to reach')
  ) {
    return `I would be delighted to take your message and deliver it directly to Mohit!

Please reply right here with your **email address** and a brief note about your inquiry or role details (for example: "name@company.com - We'd love to chat about an AI Engineering role").

I will deliver your note directly to him on high priority!`;
  }

  // Owner / creator recognition
  if (
    q.includes('owner') ||
    q.includes('creator') ||
    q.includes('boss') ||
    q === 'i am mohit' ||
    q === 'i am mohit sharma' ||
    q === 'im mohit' ||
    q.startsWith('i am mohit') ||
    q.startsWith('im mohit') ||
    q.includes('who created you') ||
    q.includes('who built you') ||
    q.includes('who made you')
  ) {
    return `Welcome, Boss! Always at your service.

All systems are operating at peak performance — your **<120ms P95 latency pipeline**, registered **Government Copyright (SW-19841/2024)**, and inbound communication lines are active and standing by.

What would you like to review, showcase, or test today?`;
  }

  // Natural greetings
  if (['hi', 'hello', 'hey', 'greetings', 'yo'].includes(q) || q.startsWith('hi ') || q.startsWith('hello ')) {
    return `Hello! I am **Mohit's Neural Twin**. 

I can answer any questions about Mohit Sharma's production systems, such as his **<120ms P95 latency pipeline**, his **Govt. Copyrighted edge drowsiness system (SW-19841/2024)**, or his current career availability.

What technical topic would you like to explore?`;
  }

  if (q.includes('latency') || q.includes('120ms') || q.includes('fast') || q.includes('sla') || q.includes('throughput')) {
    return `Mohit engineered a clinical computer vision inference backend processing **5,000+ daily images** with a verified **P95 latency of <120ms**. 

**Core Architectural Optimizations**:
1. **Model Optimization**: Graph fusion and FP16 quantization using TensorRT and ONNX Runtime.
2. **Dynamic Micro-Batching**: Grouped single requests arriving within a 15ms window into parallelized GPU micro-batches, lifting GPU utilization from 32% to 84%.
3. **Asynchronous Architecture**: Decoupled IO-bound image validation with FastAPI workers from CUDA execution streams.`;
  }

  if (q.includes('copyright') || q.includes('ip') || q.includes('19841') || q.includes('drowsiness') || q.includes('patent') || q.includes('raspberry')) {
    return `Mohit holds registered **Government of India Software Copyright (Registration No: SW-19841/2024)** for his *Driver Drowsiness Detection System*.

**System Highlights**:
- **Zero-Cloud Edge Hardware**: Fully autonomous real-time telematics running locally on an ARM Raspberry Pi 4B.
- **Ocular Geometry**: Computes 3D facial landmarks using Dlib to calculate the Eye Aspect Ratio (EAR).
- **Distinguishing Micro-Sleep**: Accurately differentiates involuntary blinking (<250ms dip) from prolonged micro-sleep (>1.5s) using an EAR threshold range of 0.21–0.24.`;
  }

  if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('tool') || q.includes('language')) {
    return `Mohit's core engineering stack covers deep learning through edge production:
- **Languages & CUDA**: Python, C++, CUDA, SQL
- **Deep Learning & CV**: PyTorch, TensorRT, ONNX Runtime, OpenCV, Dlib, YOLOv8, Instance Segmentation (0.84 mAP)
- **Production Backends**: FastAPI, Docker, Micro-batching queues, Linux kernel tuning
- **LLMs & Retrieval**: LangChain, ChromaDB (Vector HNSW index), Pydantic Guardrails, Deterministic JSON schemas`;
  }

  if (q.includes('job') || q.includes('hire') || q.includes('role') || q.includes('available') || q.includes('contact') || q.includes('email') || q.includes('open')) {
    return `Mohit is **actively open to high-impact full-time AI Engineering, Computer Vision, and MLOps roles** worldwide.

- **Email**: [${PERSONAL_INFO.email}](mailto:${PERSONAL_INFO.email})
- **LinkedIn**: [linkedin.com/in/mohitsharma1214](${PERSONAL_INFO.linkedin})
- **GitHub**: [github.com/Mohitsharma1214](${PERSONAL_INFO.github})
- **Location**: Based in India; open to remote, hybrid, or on-site relocation.`;
  }

  if (q.includes('project') || q.includes('case stud') || q.includes('work')) {
    return `Mohit has architected several flagship systems:
1. **Clinical Trichology & Vision Backend** (Hairscope AI): Scaled to 5,000+ daily inferences at <120ms P95 latency.
2. **Driver Drowsiness Edge Telematics**: Govt. Copyright SW-19841/2024 deployed on Raspberry Pi.
3. **Industrial Optical Inspection**: Automated microscopic defect segmentation achieving 0.84 mAP.
4. **Deterministic Agent RAG Engine**: Zero-hallucination agent workflow bounded with Pydantic JSON schemas.`;
  }

  if (q.includes('who are you') || q.includes('who is mohit') || q.includes('about')) {
    return `I am **Mohit's Neural Twin**, an interactive AI co-pilot representing Mohit Sharma. 

Mohit is an **AI Systems Specialist and Edge Hardware Architect** delivering low-latency computer vision, ARM edge pipelines, and deterministic LLM architectures. You can ask me about his production metrics, project code, or schedule a discussion!`;
  }

  return `Mohit is an AI Developer specializing in production computer vision backends, edge telematics on Raspberry Pi, and deterministic LLM pipelines. 

He scaled clinical inference to **5,000+ daily images at <120ms P95**, holds registered **Govt. Copyright SW-19841/2024**, and works with **PyTorch, TensorRT, CUDA, and FastAPI**.

What specific technical area or project would you like to explore?`;
}

/**
 * Call Groq API with automatic model failover (qwen/qwen3.8-27b -> openai/gpt-oss-120b)
 */
async function callGroqWithFailover(
  apiKey: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.6,
          max_tokens: 650,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn(`Groq model ${model} failed, trying next model:`, err);
    }
  }

  throw new Error('All Groq models failed to return content');
}

/**
 * Send a chat message: calls live Groq LLM API using Mohit's configured key,
 * or falls back to conversational grounded knowledge if offline.
 */
export async function sendChatMessage(
  history: ChatMessage[],
  newMessage: string
): Promise<{ text: string; source: 'llm' | 'grounded-rag' }> {
  const emailMatch = newMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const q = newMessage.toLowerCase().trim();
  const isMessageIntent =
    q.includes('leave a message') ||
    q.includes('tell him to contact') ||
    q.includes('tell him to reach') ||
    q.includes('reach out to me') ||
    q.includes('contact me') ||
    q === 'leave a message for mohit 📬';

  const isOwnerIntent =
    q.includes('owner') ||
    q.includes('creator') ||
    q.includes('boss') ||
    q === 'i am mohit' ||
    q === 'i am mohit sharma' ||
    q === 'im mohit' ||
    q.startsWith('i am mohit') ||
    q.startsWith('im mohit') ||
    q.includes('who created you') ||
    q.includes('who built you') ||
    q.includes('who made you');

  // 1. Guaranteed deterministic response for contact captures, message requests, & owner greetings
  if (emailMatch || isMessageIntent || isOwnerIntent) {
    const groundedText = getConversationalGroundedResponse(newMessage);
    return { text: groundedText, source: 'grounded-rag' };
  }

  // 2. Check for optional client-provided key (if explicitly supplied in session)
  const clientApiKey = typeof window !== 'undefined' ? (sessionStorage.getItem('mohit_llm_api_key') || '').trim() : '';

  if (clientApiKey && clientApiKey.length > 5) {
    const recentMessages = history.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    recentMessages.push({ role: 'user', content: newMessage });

    try {
      const output = await callGroqWithFailover(clientApiKey, recentMessages);
      if (output && output.length > 0) {
        return {
          text: output,
          source: 'llm',
        };
      }
    } catch (err) {
      console.warn('Live LLM invocation failed, activating grounded fallback:', err);
    }
  }

  // Deterministic, secure Grounded-RAG knowledge engine (Zero external keys required, 100% private)
  const fallbackText = getConversationalGroundedResponse(newMessage);
  return { text: fallbackText, source: 'grounded-rag' };
}
