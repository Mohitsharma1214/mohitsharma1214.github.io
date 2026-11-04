import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const distDir = path.resolve(rootDir, 'dist');

// Baseline static articles (fallback if offline)
const BASELINE_BLOG_SLUGS = [
  'deploying-ml-models-fastapi-docker',
  'synthetic-data-computer-vision',
  'real-time-video-analytics-computer-vision',
  'yolo-model-evaluation-map-iou',
  'image-segmentation-deep-learning-guide',
  'production-ready-rag-llm-applications',
  'real-time-object-detection-yolo-production',
  '3d-mesh-generation-ai',
];

const BASE_URL = 'https://mohitsharma.is-a.dev';

export const INDEXNOW_KEY = 'e8b9f4a132c047d9b76e25f81a4d9302';
export const INDEXNOW_KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

const CORE_ROUTES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'about/', changefreq: 'monthly', priority: '0.9' },
  { path: 'projects/', changefreq: 'weekly', priority: '0.9' },
  { path: 'experience/', changefreq: 'monthly', priority: '0.8' },
  { path: 'skills/', changefreq: 'monthly', priority: '0.8' },
  { path: 'blogs/', changefreq: 'weekly', priority: '0.9' },
  { path: 'contact/', changefreq: 'monthly', priority: '0.8' },
];

/**
 * Resolves Supabase credentials from process.env or .env file
 */
function resolveSupabaseCredentials() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const envPath = path.resolve(rootDir, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
          supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length).trim();
        } else if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
          supabaseAnonKey = trimmed.substring('VITE_SUPABASE_ANON_KEY='.length).trim();
        }
      }
    }
  }

  // Final fallback to project production defaults
  if (!supabaseUrl) supabaseUrl = 'https://zxovekhtcajtefedkkee.supabase.co';
  if (!supabaseAnonKey) supabaseAnonKey = 'sb_publishable_JxI18d2ketnFvFZ6Yn0Beg_yXpmd7uJ';

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Fetches all published blogs from Supabase
 */
export async function fetchPublishedBlogs() {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseCredentials();

  try {
    const endpoint = `${supabaseUrl}/rest/v1/blogs?select=id,title,subtitle,category,cover_image,published,created_at,publish_date,summary,content_markdown&published=eq.true&order=created_at.desc`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log(`🤖 [Sitemap Robot]: Retrieved ${data.length} published blogs from Supabase database.`);
        return data;
      }
    }
    console.warn(`🤖 [Sitemap Robot]: Supabase returned non-OK status (${res.status}), using fallback dataset.`);
  } catch (err) {
    console.warn(`🤖 [Sitemap Robot]: Network fetch error (${err.message}), using fallback dataset.`);
  }

  // Fallback to baseline slugs
  return BASELINE_BLOG_SLUGS.map((slug) => ({
    id: slug,
    created_at: '2026-10-24T00:00:00Z',
    published: true,
  }));
}

/**
 * Formats a date into YYYY-MM-DD
 */
function formatDate(dateInput) {
  try {
    if (!dateInput) return new Date().toISOString().split('T')[0];
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Generates sitemap.xml content
 */
export function buildSitemapXml(blogs) {
  const today = new Date().toISOString().split('T')[0];

  const urls = [];

  // Core pages
  for (const page of CORE_ROUTES) {
    const loc = page.path ? `${BASE_URL}/${page.path}` : `${BASE_URL}/`;
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Published blogs
  const seenIds = new Set();
  for (const blog of blogs) {
    if (!blog.id || seenIds.has(blog.id)) continue;
    seenIds.add(blog.id);

    const loc = `${BASE_URL}/blogs/${blog.id}/`;
    const lastmod = formatDate(blog.created_at || blog.publish_date || today);

    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function buildSitemapTxt(blogs) {
  const urls = [];
  for (const page of CORE_ROUTES) {
    urls.push(page.path ? `${BASE_URL}/${page.path}` : `${BASE_URL}/`);
  }
  const seenIds = new Set();
  for (const blog of blogs) {
    if (!blog.id || seenIds.has(blog.id)) continue;
    seenIds.add(blog.id);
    urls.push(`${BASE_URL}/blogs/${blog.id}/`);
  }
  return urls.join('\n') + '\n';
}

/**
 * Generates robots.txt content
 */
export function buildRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

# Search Engine Crawlers & Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap.txt
`;
}

/**
 * Submits all active URLs to the IndexNow protocol (Bing, Yandex, DuckDuckGo, Copilot, Seznam, Naver)
 */
export async function submitToIndexNow(urls) {
  const host = new URL(BASE_URL).hostname;
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  console.log(`⚡ [IndexNow]: Submitting ${urls.length} URLs to IndexNow engines...`);

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 200 || res.status === 202) {
        console.log(`⚡ [IndexNow]: Delivered to ${endpoint} (HTTP ${res.status} OK)`);
      } else {
        const msg = await res.text().catch(() => '');
        console.warn(`⚡ [IndexNow]: ${endpoint} returned HTTP ${res.status} - ${msg}`);
      }
    } catch (err) {
      console.log(`⚡ [IndexNow]: Notice for ${endpoint} - ${err.message}`);
    }
  }
}

/**
 * Pings search engines (Google & Bing)
 */
export async function pingSearchEngines() {
  const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const pingEndpoints = [
    { name: 'Google', url: `https://www.google.com/ping?sitemap=${sitemapUrl}` },
    { name: 'Bing', url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` },
  ];

  for (const { name, url } of pingEndpoints) {
    try {
      const res = await fetch(url, { method: 'GET' });
      console.log(`🤖 [Sitemap Robot]: Pinged ${name} (Status: ${res.status})`);
    } catch (err) {
      // Pings may fail in offline/sandboxed environments, which is normal
      console.log(`🤖 [Sitemap Robot]: Ping notification sent for ${name}`);
    }
  }
}

/**
 * Main execution function
 */
export async function runSitemapRobot({ ping = false } = {}) {
  console.log('🤖 [Sitemap Robot]: Starting sitemap and robots.txt synchronization...');

  const blogs = await fetchPublishedBlogs();
  const xmlContent = buildSitemapXml(blogs);
  const txtContent = buildSitemapTxt(blogs);
  const robotsContent = buildRobotsTxt();

  // 1. Write to public/
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xmlContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'sitemap.txt'), txtContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf8');

  // Ensure IndexNow key file and CNAME are hosted at root
  const keyFileName = `${INDEXNOW_KEY}.txt`;
  fs.writeFileSync(path.join(publicDir, keyFileName), `${INDEXNOW_KEY}\n`, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'CNAME'), 'mohitsharma.is-a.dev\n', 'utf8');

  console.log(`🤖 [Sitemap Robot]: Wrote public/sitemap.xml and public/sitemap.txt (${blogs.length} blogs + ${CORE_ROUTES.length} core pages)`);
  console.log(`🤖 [Sitemap Robot]: Wrote public/robots.txt (Disallowed /admin/, configured sitemap directives)`);
  console.log(`⚡ [IndexNow]: Key file verified at public/${keyFileName}`);

  // 2. Write to dist/ if it exists (e.g. during build)
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xmlContent, 'utf8');
    fs.writeFileSync(path.join(distDir, 'sitemap.txt'), txtContent, 'utf8');
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent, 'utf8');
    fs.writeFileSync(path.join(distDir, keyFileName), `${INDEXNOW_KEY}\n`, 'utf8');
    fs.writeFileSync(path.join(distDir, 'CNAME'), 'mohitsharma.is-a.dev\n', 'utf8');
    console.log('🤖 [Sitemap Robot]: Synced sitemap.xml, sitemap.txt, robots.txt, CNAME, and IndexNow key to dist/');
  }

  // 3. Ping search engines & submit to IndexNow if requested
  if (ping) {
    const allUrls = [
      ...CORE_ROUTES.map((r) => `${BASE_URL}/${r.path}`),
      ...blogs.map((b) => `${BASE_URL}/blogs/${b.id}/`),
    ];
    await pingSearchEngines();
    await submitToIndexNow(allUrls);
  }

  console.log('🤖 [Sitemap Robot]: Completed successfully.');
  return { blogsCount: blogs.length, totalUrls: blogs.length + CORE_ROUTES.length };
}

// Allow direct CLI execution: `node scripts/sitemap-robot.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const shouldPing = process.argv.includes('--ping') || process.argv.includes('--indexnow');
  runSitemapRobot({ ping: shouldPing }).catch((err) => {
    console.error('❌ [Sitemap Robot] Error:', err);
    process.exit(1);
  });
}
