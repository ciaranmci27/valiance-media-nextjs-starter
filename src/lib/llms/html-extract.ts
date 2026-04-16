import * as cheerio from 'cheerio';

/**
 * Extract the primary content subtree from a fully-rendered HTML page.
 *
 * Used by the page `.md` route handler to convert any server-rendered page
 * into clean markdown for AI crawlers. Uses cheerio (real HTML parser) rather
 * than regex string-matching so malformed markup, deeply nested wrappers, and
 * edge cases like multiple `<main>` regions are handled deterministically.
 *
 * Strategy:
 *   1. Strip site chrome and noise (script, style, nav, header, footer, aside,
 *      noscript, template, ARIA-hidden nodes, Next.js streaming markers).
 *   2. Try a cascade of explicit content selectors. First non-empty match wins.
 *   3. Fall back to `<body>` if nothing matched (after chrome strip the body
 *      should be mostly content).
 *
 * Escape hatches authors can put in their JSX:
 *   - `data-llms-content`  → marks the canonical content root, highest priority
 *   - `data-llms-skip`     → strips this subtree from the output (e.g. an
 *                            in-article callout or related-posts widget)
 */

const CHROME_SELECTORS = [
  'script',
  'style',
  'noscript',
  'template',
  'nav',
  'header',
  'footer',
  'aside',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="complementary"]',
  '[aria-hidden="true"]',
  '[data-llms-skip]',
  // Next.js streams its Flight payload as inline scripts. Already covered by
  // `script`, but list explicitly so the intent is obvious.
  'script#__NEXT_DATA__',
];

const CONTENT_CASCADE = [
  '[data-llms-content]',
  'main',
  '[role="main"]',
  'article',
  '#main',
  '#content',
  '#main-content',
  '.prose',
  '.content',
];

/**
 * Extract the main content HTML subtree from a full HTML document.
 * Returns the inner HTML of the matched element, or null if extraction
 * yielded nothing usable.
 */
export function extractMainContent(fullHtml: string): string | null {
  if (!fullHtml || typeof fullHtml !== 'string') return null;

  const $ = cheerio.load(fullHtml);

  // Remove chrome before selecting content so a `<nav>` inside `<main>` is
  // also stripped. Done in one pass on the whole document.
  for (const sel of CHROME_SELECTORS) {
    $(sel).remove();
  }

  // First non-empty cascade hit wins. We deliberately don't gate on a minimum
  // length: a one-paragraph page is a legitimate result, and any length
  // threshold forces an ambiguous "what now" branch that just duplicates the
  // cascade. If every selector misses, fall back to body minus chrome.
  for (const sel of CONTENT_CASCADE) {
    const node = $(sel).first();
    if (node.length === 0) continue;
    const html = node.html()?.trim();
    if (html && node.text().trim()) return html;
  }

  const bodyHtml = $('body').html()?.trim();
  if (bodyHtml && $('body').text().trim()) return bodyHtml;

  return null;
}
