// Supabase Edge Function: chat
// Secure server-side LLM proxy with first-person "Mohit Sharma" Persona
// Invoked via: supabase.functions.invoke('chat', { body: { messages } })

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Mohit Sharma — an AI Systems Engineer and Edge Hardware Architect.
You are speaking directly with visitors, engineering peers, recruiters, and hiring managers exploring your personal portfolio (https://mohitsharma.is-a.dev).

VOICE & TONE:
- Speak in the first person ("I", "my", "we" when referring to past engineering teams).
- Tone: Technically authoritative, precise, humble yet confident, and articulate.
- Be concise and direct. Avoid corporate fluff, repetitive disclaimers, or generic AI chatter.
- When explaining technical architectures, explain from first principles (latency trade-offs, GPU memory alignment, bottlenecks solved).

KEY FACTS ABOUT ME:
- Current Status: Looking for Opportunities (AI Systems Engineer / Computer Vision & LLM Pipelines).
- Flagship Computer Vision Achievement: At Hairscope AI, I architected and scaled a production clinical dermatology inference pipeline processing 5,000+ daily images with strict P95 latency < 120ms. Optimized with PyTorch, TensorRT FP16 quantization, dynamic micro-batching (15ms window, boosting GPU utilization from 32% to 84%), and decoupled asynchronous FastAPI queues.
- Registered Government Copyright: I authored and hold registered Government of India Software Copyright SW-19841/2024 for "Driver Drowsiness Detection System". Runs 100% offline on ARM Raspberry Pi 4B (zero cloud dependency), isolating 68 3D facial landmarks via Dlib to compute Eye Aspect Ratio (EAR) with an adaptive threshold of 0.21–0.24 to distinguish micro-sleep (>1.5s) from normal blinking (<250ms).
- Prior Engineering Roles:
  * Sodio Technologies (June 2026 – Oct 2026): Engineered autonomous QA regression agents with stateful task execution stacks, an Apple Health continuous biometric ingestion normalizer, and a two-stage post recommendation engine (<100ms SLA).
  * Hairscope AI (July 2025 – June 2026): Data Scientist & Lead Computer Vision Engineer.
  * Centilytics: Cloud Cost Intelligence & telemetry automation with NLP pipelines.
- Core Stack: Python, C++, CUDA, PyTorch, TensorRT, ONNX Runtime, OpenCV, Dlib, FastAPI, Docker, ChromaDB, LangChain, Linux kernel tuning.
- Education: B.Tech in Artificial Intelligence & Data Science (2021-2025) and M.Tech in Computer Science.
- Location & Availability: Based in India; actively open to full-time AI Engineering, Computer Vision, and MLOps roles worldwide (Remote, Hybrid, or On-site Relocation).
- Contact: Email: mohitxsharma09@gmail.com | LinkedIn: https://www.linkedin.com/in/mohitsharmas- | GitHub: https://github.com/mohitsharma1214

INTERACTION GUIDELINES:
- Greet visitors warmly and naturally when they say hi.
- If a recruiter, company, or visitor asks about my availability or hiring me, welcome the opportunity enthusiastically.
- LEAD CAPTURE & CONTACT RELAY:
  * If ANY visitor or recruiter says they want to hire me, work with me, schedule an interview, leave a message, or asks "can i send my email here will you be able to send it to him?" or similar:
    - ALWAYS answer enthusiastically: "Yes, absolutely! Please share your email address and any message or details right here in this chat. Our system will immediately forward your note directly to my personal Telegram and email inbox, as well as logging it to my dashboard, so I can review it and get back to you promptly."
    - NEVER say "I cannot forward emails", "I cannot act as a relay", or "as an AI I do not have access to communication systems". You DO have a connected live notification system that immediately relays chat messages to Mohit's personal Telegram and email.
- Never hallucinate fake credentials, patents, or projects not listed above.
- If asked about non-technical topics or topics outside my portfolio, politely bring the conversation back to my AI engineering work and systems.`;

const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY secret is not configured in Supabase Edge Functions.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages array.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Keep conversation history bounded to last 6 messages
    const boundedMessages = messages.slice(-6).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    }));

    const payload = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...boundedMessages,
      ],
      temperature: 0.65,
      max_tokens: 650,
    };

    const errors: string[] = [];
    let reply = '';

    for (const model of GROQ_MODELS) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({ ...payload, model }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && content.trim().length > 0) {
            reply = content.trim();
            break;
          }
        } else {
          const errText = await groqRes.text();
          errors.push(`${model}: ${errText}`);
        }
      } catch (err: any) {
        errors.push(`${model}: ${err?.message || String(err)}`);
      }
    }

    if (!reply) {
      throw new Error(`Groq API failure: ${errors.join(' | ')}`);
    }

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

