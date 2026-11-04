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
    if (paragraph.length) out.push(`<p>${paragraph.map(escapeHtml).join('<br>')}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
    list = [];
  };
  const flushCode = () => {
    if (code.length) out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
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
      out.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
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

function buildRouteSnapshot(route, blogs) {
  if (route.blogData) {
    const b = route.blogData;
    const image = b.cover_image
      ? `<img src="${escapeHtml(b.cover_image)}" alt="${escapeHtml(b.title)}" loading="eager" style="max-width:100%;height:auto">`
      : '';

    return `<main class="max-w-4xl mx-auto px-4 py-12 text-slate-900">
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blogs/">Blogs</a></nav>
      <article>
        <header>
          <h1>${escapeHtml(b.title || route.title)}</h1>
          ${b.subtitle ? `<p>${escapeHtml(b.subtitle)}</p>` : ''}
          ${b.summary ? `<p>${escapeHtml(b.summary)}</p>` : ''}
          ${image}
        </header>
        <div>${renderMarkdownSnapshot(b.content_markdown || '')}</div>
        <p><a href="/blogs/">← All technical blogs</a></p>
      </article>
    </main>`;
  }

  if (route.path === 'blogs') {
    const entries = blogs.map(b => `<li><article>
      <h2><a href="/blogs/${encodeURIComponent(b.id)}/">${escapeHtml(b.title || b.id)}</a></h2>
      ${b.subtitle ? `<p>${escapeHtml(b.subtitle)}</p>` : ''}
      ${b.summary ? `<p>${escapeHtml(b.summary)}</p>` : ''}
    </article></li>`).join('\n');

    return `<main class="max-w-5xl mx-auto px-4 py-12 text-slate-900">
      <h1>Technical Blogs &amp; Engineering Notes</h1>
      <p>Technical articles on computer vision, machine learning systems, production AI, and LLM engineering.</p>
      <ul>${entries || '<li>New technical articles will appear here.</li>'}</ul>
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

    if (extraSchemas.length > 0) {
      const schemaScripts = extraSchemas
        .map((s) => `    <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n    </script>`)
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
