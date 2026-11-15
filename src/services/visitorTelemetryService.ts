/**
 * Real-Time Visitor Telemetry & Instant Notification Service
 * Secure Client: Telemetry dispatches are routed through a secured serverless proxy/webhook.
 * No bot tokens, credentials, or private chat IDs are stored in client-side code.
 */

// Optional backend proxy URL (e.g. Supabase Edge Function or secure serverless endpoint)
const TELEMETRY_PROXY_URL = (import.meta.env.VITE_TELEMETRY_WEBHOOK_URL || '').trim();

interface GeoData {
  city?: string;
  region?: string;
  country?: string;
  org?: string;
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua)) return 'Tablet';
    if (/iPhone/i.test(ua)) return 'Mobile (iPhone)';
    if (/Android/i.test(ua)) return 'Mobile (Android)';
    return 'Mobile';
  }
  if (/Macintosh/i.test(ua)) return 'Desktop (macOS)';
  if (/Windows/i.test(ua)) return 'Desktop (Windows)';
  if (/Linux/i.test(ua)) return 'Desktop (Linux)';
  return 'Desktop';
}

function isBot(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  const botKeywords = [
    'bot', 'crawl', 'spider', 'slurp', 'headless', 'lighthouse',
    'inspect', 'archive', 'mediapartners', 'phantom', 'selenium'
  ];
  return (
    Boolean(navigator.webdriver) ||
    botKeywords.some((keyword) => ua.includes(keyword))
  );
}

export async function trackVisitorLanding(): Promise<void> {
  // 1. Guard against local development & bots
  if (typeof window === 'undefined') return;

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return;
  }

  // 2. Ignore admin or preview pages
  if (window.location.pathname.startsWith('/admin')) {
    return;
  }

  // 3. Ignore self-visits if marked
  if (localStorage.getItem('mohit_ignore_telemetry') === 'true') {
    return;
  }

  // 4. Session deduplication: Only notify once per browser session (or 30 mins)
  const SESSION_KEY = 'mohit_visitor_telemetry_sent';
  const existingVisit = sessionStorage.getItem(SESSION_KEY);
  if (existingVisit) {
    return;
  }

  if (isBot()) {
    return;
  }

  // Mark session immediately so concurrent calls don't double-fire
  sessionStorage.setItem(SESSION_KEY, Date.now().toString());

  // 5. Fetch location data asynchronously in background (graceful fallback)
  let geoInfo = 'Location: Unavailable';
  try {
    const geoRes = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    });
    if (geoRes.ok) {
      const data: GeoData = await geoRes.json();
      const parts = [data.city, data.region, data.country].filter(Boolean);
      if (parts.length > 0) {
        geoInfo = parts.join(', ');
        if (data.org) {
          geoInfo += ` (${data.org})`;
        }
      }
    }
  } catch {
    // If geo API is blocked or ad-blocked, continue gracefully
  }

  // 6. Gather visitor telemetry
  const landingPage = window.location.pathname || '/';
  let referrer = 'Direct / Bookmark';
  if (document.referrer) {
    try {
      referrer = new URL(document.referrer).hostname || document.referrer;
    } catch {
      referrer = document.referrer;
    }
  }
  const device = detectDevice();
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const now = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const message = [
    `🚀 *New Visitor on mohitsharma.is-a.dev*`,
    ``,
    `📍 *Landing Page:* \`${landingPage}\``,
    `🔗 *Referrer:* \`${referrer}\``,
    `🌍 *Location:* ${geoInfo}`,
    `📱 *Device:* ${device} (${screenRes})`,
    `⏱ *Time:* ${now} IST`,
  ].join('\n');

  // 7. Dispatch to Secure Telemetry Proxy (if configured)
  if (!TELEMETRY_PROXY_URL) return;

  try {
    await fetch(TELEMETRY_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'visitor_landing',
        message,
      }),
    });
  } catch (err) {
    console.debug('Visitor telemetry notification caught error:', err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Dispatches an alert when someone submits the Contact Form.
 */
export async function notifyContactFormSubmission(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<boolean> {
  if (!TELEMETRY_PROXY_URL) return true;

  const now = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const text = [
    `📬 <b>New Contact Form Submission!</b>`,
    ``,
    `👤 <b>From:</b> ${escapeHtml(data.name.trim())}`,
    `📧 <b>Email:</b> <code>${escapeHtml(data.email.trim())}</code>`,
    `🎯 <b>Topic:</b> ${escapeHtml(data.topic.trim())}`,
    `💬 <b>Message:</b>`,
    `"${escapeHtml(data.message.trim())}"`,
    ``,
    `⏱ <b>Time:</b> ${now} IST`,
  ].join('\n');

  try {
    const res = await fetch(TELEMETRY_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'contact_form_submission',
        text,
        sender: data.email,
      }),
    });
    return res.ok;
  } catch (err) {
    console.debug('Contact submission notification error:', err);
    return false;
  }
}

/**
 * Dispatches an alert when a visitor chats with Mohit's Neural Twin AI Agent.
 */
export async function notifyAiChatActivity(data: {
  userQuery: string;
  botReply?: string;
  isLead?: boolean;
}): Promise<boolean> {
  if (!TELEMETRY_PROXY_URL) return true;

  const now = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const title = data.isLead
    ? `🚨 <b>Direct Lead / Contact Shared in AI Chat!</b>`
    : `🤖 <b>Visitor Chatted with AI Copilot</b>`;

  const truncatedReply = data.botReply
    ? data.botReply.slice(0, 280) + (data.botReply.length > 280 ? '...' : '')
    : '';

  const textLines = [
    title,
    ``,
    `👤 <b>Visitor:</b> "${escapeHtml(data.userQuery.trim())}"`,
  ];

  if (truncatedReply) {
    textLines.push(`🤖 <b>AI Answer:</b> "${escapeHtml(truncatedReply.trim())}"`);
  }

  textLines.push(``, `⏱ <b>Time:</b> ${now} IST`);

  try {
    const res = await fetch(TELEMETRY_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ai_chat_activity',
        text: textLines.join('\n'),
        isLead: data.isLead,
      }),
    });
    return res.ok;
  } catch (err) {
    console.debug('AI chat activity notification error:', err);
    return false;
  }
}

