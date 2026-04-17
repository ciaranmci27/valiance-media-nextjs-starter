import fs from 'fs/promises';
import path from 'path';

/**
 * Content sourcing for the page `.md` route.
 *
 * Resolution order:
 *   1. Sidecar `llms-content.md` file next to the page's `page.tsx`.
 *      Highest priority — the author explicitly controls the AI-visible
 *      content. Ideal for pages whose visible content comes from an API
 *      (Supabase, CMS, etc.) and can't be extracted from the source file.
 *   2. JSX source text extraction from `page.tsx`.
 *      Automatic fallback for static pages with hardcoded JSX text.
 *
 * The root layout wraps the app in client components (ThemeProvider,
 * ConditionalLayout), so Next.js delivers page content as RSC Flight data
 * rather than rendered HTML. Self-fetching yields an empty shell, which is
 * why we read source files instead.
 */

const APP_DIR = path.join(process.cwd(), 'src', 'app');

/**
 * Load sidecar `llms-content.md` for a page. Mirrors the path resolution
 * in `getPageBySlug` so the sidecar is always next to `page.tsx`.
 */
export async function loadSidecarContent(pageSlug: string): Promise<string | null> {
  const isHomePage = pageSlug === 'home' || pageSlug === '';
  const candidates: string[] = [];

  if (isHomePage) {
    candidates.push(path.join(APP_DIR, '(pages)', '(home)', 'llms-content.md'));
    candidates.push(path.join(APP_DIR, 'llms-content.md'));
  } else {
    candidates.push(path.join(APP_DIR, '(pages)', pageSlug, 'llms-content.md'));
    candidates.push(path.join(APP_DIR, pageSlug, 'llms-content.md'));
  }

  for (const filePath of candidates) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const trimmed = content.trim();
      if (trimmed.length > 0) return trimmed + '\n';
    } catch {
      // File doesn't exist at this candidate path, try next
    }
  }

  return null;
}

/**
 * Extract visible text content from a TSX page source file and return it
 * as a cleaned markdown-like string. Returns null if no meaningful text
 * was found.
 */
export function extractJsxText(source: string): string | null {
  if (!source || typeof source !== 'string') return null;

  // Find the return statement of the default export component. Everything
  // inside the returned JSX tree is the page's visible content.
  const returnMatch = source.match(/return\s*\(\s*/);
  if (!returnMatch) return null;

  const jsxStart = (returnMatch.index ?? 0) + returnMatch[0].length;
  const jsxSource = source.slice(jsxStart);

  // Strip JSX comments {/* ... */}
  let cleaned = jsxSource.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // Strip import/export lines that might leak into the slice
  cleaned = cleaned.replace(/^(import|export)\s+.*$/gm, '');

  // Strip className, style, href, and other attribute expressions
  cleaned = cleaned.replace(/className="[^"]*"/g, '');
  cleaned = cleaned.replace(/className=\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/style=\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/\b(id|role|aria-\w+|tabIndex|data-[\w-]+)="[^"]*"/g, '');

  // Extract text from JSX: everything between > and < that isn't
  // whitespace-only, plus string expressions in curly braces.
  const textParts: string[] = [];

  // Match text content between tags: >text<
  const tagTextRegex = />([^<{]+)</g;
  let match;
  while ((match = tagTextRegex.exec(cleaned)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1) {
      textParts.push(text);
    }
  }

  // Match string literals inside JSX expressions: {"text"} or {'text'}
  const exprStringRegex = /\{"([^"]+)"\}|\{'([^']+)'\}/g;
  while ((match = exprStringRegex.exec(cleaned)) !== null) {
    const text = (match[1] || match[2]).trim();
    if (text && text.length > 1) {
      textParts.push(text);
    }
  }

  if (textParts.length === 0) return null;

  // Deduplicate adjacent identical lines (common with repeated patterns)
  const deduped: string[] = [];
  for (const part of textParts) {
    if (deduped.length === 0 || deduped[deduped.length - 1] !== part) {
      deduped.push(part);
    }
  }

  const body = deduped.join('\n\n');

  // Require a minimum amount of meaningful text
  if (body.length < 50) return null;

  return body + '\n';
}
