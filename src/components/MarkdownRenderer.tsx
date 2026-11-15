import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Configure marked with GitHub-Flavored Markdown options
marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link(this: any, { href, title, text, tokens }: any) {
      // Guard against false-positive mailto autolinking on technical parameters and metrics (e.g. mAP@0.50, IoU@0.75, recall@10)
      if (href && href.startsWith('mailto:')) {
        const email = href.slice(7);
        // Legitimate email domains must have an alphabetic TLD of at least 2 chars (e.g. .com, .ai, .org, .edu)
        // Numeric values like 0.50 or 0.95 are evaluation thresholds, not domain names
        const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!validEmailRegex.test(email)) {
          return this.parser ? this.parser.parseInline(tokens) : text;
        }
      }

      // Open external links securely in a new tab
      const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
      const parsedText = this.parser ? this.parser.parseInline(tokens) : text;
      const titleAttr = title ? ` title="${title}"` : '';

      if (isExternal) {
        return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${parsedText}</a>`;
      }

      return false; // Use marked's default renderer for internal routes and legitimate emails
    },
  },
});

/**
 * Pre-processes markdown to detect and render LaTeX math formulas using KaTeX
 * before and after marked runs.
 * Supports:
 * - Display math: \[ ... \] and $$ ... $$
 * - Inline math: \( ... \) and $ ... $
 * Strictly preserves code blocks and inline code so programming syntax is never altered.
 */
function processMarkdownWithMath(markdown: string): string {
  if (!markdown) return '';

  const codeTokens: string[] = [];

  // 1. Protect fenced code blocks (``` or ~~~)
  let text = markdown.replace(/(^|\n)(```[\s\S]*?\n```|~~~[\s\S]*?\n~~~)(\n|$)/g, (_match, pre, block, post) => {
    const id = codeTokens.length;
    codeTokens.push(block);
    return `${pre}%%PROTECTED_CODE_BLOCK_${id}%%${post}`;
  });

  // 2. Protect inline code (`...`)
  text = text.replace(/(`[^`\n]+`)/g, (match) => {
    const id = codeTokens.length;
    codeTokens.push(match);
    return `%%PROTECTED_INLINE_CODE_${id}%%`;
  });

  const mathTokens: string[] = [];

  // 3. Process Display Math: \[ ... \]
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
    const id = mathTokens.length;
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      mathTokens.push(
        `<div class="katex-display-container my-6 overflow-x-auto py-4 px-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-center shadow-xs transition-colors hover:bg-slate-50">${rendered}</div>`
      );
    } catch {
      mathTokens.push(match);
    }
    return `\n\n<div class="katex-display-placeholder" data-katex-id="${id}"></div>\n\n`;
  });

  // 4. Process Display Math: $$ ... $$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const id = mathTokens.length;
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      mathTokens.push(
        `<div class="katex-display-container my-6 overflow-x-auto py-4 px-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-center shadow-xs transition-colors hover:bg-slate-50">${rendered}</div>`
      );
    } catch {
      mathTokens.push(match);
    }
    return `\n\n<div class="katex-display-placeholder" data-katex-id="${id}"></div>\n\n`;
  });

  // 5. Process Inline Math: \( ... \)
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
    const id = mathTokens.length;
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      mathTokens.push(
        `<span class="katex-inline-container inline-block align-middle px-0.5">${rendered}</span>`
      );
    } catch {
      mathTokens.push(match);
    }
    return `<span class="katex-inline-placeholder" data-katex-id="${id}"></span>`;
  });

  // 6. Process Inline Math: $...$ (ignoring standalone currency like $50 or $10.99)
  text = text.replace(/(^|[^\$\w\\])\$([^\$\n\r]+?)\$(?!\$|\w)/g, (match, prefix, formula) => {
    // If it is just a number (e.g. $100 or $5.50), skip it
    if (/^\d+(?:\.\d+)?$/.test(formula.trim())) {
      return match;
    }
    const id = mathTokens.length;
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      mathTokens.push(
        `<span class="katex-inline-container inline-block align-middle px-0.5">${rendered}</span>`
      );
      return `${prefix}<span class="katex-inline-placeholder" data-katex-id="${id}"></span>`;
    } catch {
      return match;
    }
  });

  // 7. Restore protected code blocks and inline code
  text = text.replace(/%%PROTECTED_CODE_BLOCK_(\d+)%%/g, (_, id) => {
    return codeTokens[Number(id)] || '';
  });
  text = text.replace(/%%PROTECTED_INLINE_CODE_(\d+)%%/g, (_, id) => {
    return codeTokens[Number(id)] || '';
  });

  // 8. Parse standard Markdown with marked
  let html = marked.parse(text) as string;

  // 9. Unwrap any <p> tags accidentally wrapped around display math placeholders by marked
  html = html.replace(/<p>\s*<div class="katex-display-placeholder" data-katex-id="(\d+)"><\/div>\s*<\/p>/g, (_, id) => {
    return `<div class="katex-display-placeholder" data-katex-id="${id}"></div>`;
  });

  // 10. Replace math placeholders with KaTeX rendered markup
  html = html.replace(/<div class="katex-display-placeholder" data-katex-id="(\d+)"><\/div>/g, (_, id) => {
    return mathTokens[Number(id)] || '';
  });
  html = html.replace(/<span class="katex-inline-placeholder" data-katex-id="(\d+)"><\/span>/g, (_, id) => {
    return mathTokens[Number(id)] || '';
  });

  return html;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    const rawHtml = processMarkdownWithMath(content);
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true, mathMl: true, svg: true },
      FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'base'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      ADD_TAGS: [
        'math',
        'annotation',
        'semantics',
        'mrow',
        'mi',
        'mo',
        'mn',
        'mfrac',
        'msup',
        'msub',
        'msubsup',
        'msqrt',
        'mroot',
        'mtext',
        'mspace',
        'mover',
        'munder',
        'munderover',
        'mtable',
        'mtr',
        'mtd',
        'svg',
        'path',
        'line',
      ],
      ADD_ATTR: [
        'target',
        'rel',
        'display',
        'mathvariant',
        'xmlns',
        'viewBox',
        'aria-hidden',
        'preserveAspectRatio',
        'd',
        'style',
        'class',
        'encoding',
        'role',
        'width',
        'height',
        'columnalign',
        'rowalign',
      ],
    });
  }, [content]);

  return (
    <div
      className={`markdown-body space-y-4 text-slate-800 leading-relaxed text-sm sm:text-base ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
