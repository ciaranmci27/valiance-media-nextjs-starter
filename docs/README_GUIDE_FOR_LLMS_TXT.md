# llms.txt Guide

This boilerplate ships with first-class support for the [llms.txt standard](https://llmstxt.org), the AI-search counterpart to `sitemap.xml`. It tells LLMs (ChatGPT, Claude, Perplexity, Google AI Overviews, Gemini, Copilot) where to find your content as clean markdown rather than parsing your rendered HTML.

If you care about being **cited** by AI answer engines (Answer Engine Optimization, AEO / GEO), this is the table-stakes infrastructure layer.

**It runs hands-off.** There is no build step, no file to fill in, and no markdown to write. The feature is dynamic: the `/llms.txt` response is generated live from your existing pages and blog posts, every server-rendered page gets a sibling `/{path}.md` URL (and `/index.md` for the home page), and every blog post gets `/blog/{category}/{slug}.md`. All served on demand. The only environmental requirement is `NEXT_PUBLIC_SITE_URL` (same as `sitemap.xml` and `robots.txt`).

## What gets served

| URL | Purpose |
| --- | --- |
| `/llms.txt` | Curated index. One line per published page and blog post, with title, URL, and short description. Format follows [llmstxt.org](https://llmstxt.org). |
| `/{path}.md` | Per-page markdown copy of every server-rendered page. The page's main content is extracted with a real HTML parser (cheerio) and converted to markdown, prefixed with a header block that embeds the canonical URL, last-modified date, and author. The home page lives at `/index.md`. |
| `/blog/{category}/{slug}.md` | Per-post markdown copy of each blog post (uses the JSON content directly rather than re-parsing rendered HTML). |
| `/robots.txt` | Dedicated allow blocks for the major AI crawlers when the feature is enabled; explicit disallow for any crawler the admin has turned off. |

The `.md` URLs are mapped to internal route handlers via rewrites in `src/proxy.ts`:
- `/blog/{cat}/{slug}.md` → `src/app/api/blog-md/[category]/[slug]/route.ts`
- `/{path}.md` (everything else) → `src/app/api/page-md/[[...slug]]/route.ts`

This keeps the public URLs clean while preventing the `.md` segment from colliding with the human-readable `[slug]/page.tsx` routes.

## Why these AEO design choices

- **Source attribution travels with content.** Every `.md` response embeds the canonical URL, so when an AI extracts a passage it carries enough context to cite back to your domain.
- **Freshness signals are loud.** `**Published:**` / `**Updated:**` dates appear in the `.md` body and in the `/llms.txt` index. AI systems weight recency heavily.
- **HTTP `Link: rel="canonical"` header** on each `.md` response gives crawlers an explicit pointer to the human-readable original, preventing duplicate-content confusion.
- **Author bylines** appear in every `.md` body when known, for E-E-A-T signaling.
- **Real HTML parser, not regex.** Page extraction uses cheerio so deeply-nested wrappers, multiple `<main>` regions, and malformed markup are handled deterministically. Authors get two escape-hatch attributes (`data-llms-content`, `data-llms-skip`) for the rare cases where the heuristic guesses wrong.
- **Major AI crawlers are explicitly allowlisted** in `robots.txt` (see below). A platform that can't crawl your site can't cite it.
- **Drafts and hidden content are blocked on every surface.** The `/llms.txt` route skips them, and the `.md` routes return 404 for any page or post with `draft`, `noIndex`, `excludeFromSearch`, `sitemap.exclude`, or `llms.exclude` set, so private content never leaks.
- **Client components are skipped automatically.** A `'use client'` page renders an empty shell on the server, so its `.md` URL would be useless. The route 404s these explicitly and the `/llms.txt` index omits them. To make a page AI-readable, keep it as a server component (the default).

## Configuring from the admin

Open **Admin > SEO > AI Search**. Two things to manage:

1. **Master toggle.** Flip off to make `/llms.txt` and every `/blog/*.md` URL return 404 immediately, and to remove the dedicated AI crawler blocks from `/robots.txt`. No rebuild required; changes are live on the next request.
2. **AI crawler allowlist.** Individual switches for the six crawlers that matter for citation (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended). An enabled crawler gets a dedicated allow rule in `robots.txt`. A disabled one gets an explicit `Disallow: /` block so the platform stops citing the site.

The status cards at the top show how many pages and blog posts are currently exposed to AI crawlers, so you can see at a glance what's in the index.

Settings persist to `src/lib/seo/llms-settings.json`. The file is small and safe to commit — there are no secrets in it.

## Per-page controls

### Excluding a page entirely

Two ways to keep a specific page out of `/llms.txt` and 404 its `.md` sibling:

1. **Admin page editor** — toggle *Exclude from AI Search (llms.txt)* in the page's **SEO** tab. Lives next to *Exclude from Sitemap*.
2. **Direct JSON** — set `"llms": { "exclude": true }` in the page's `seo-config.json`:
   ```json
   {
     "seo": { "title": "...", "description": "..." },
     "sitemap": { "exclude": false, "priority": 0.5 },
     "llms": { "exclude": true }
   }
   ```

Pages with `seo.noIndex: true` or `sitemap.exclude: true` are already filtered out automatically — the `llms` exclusion is for the uncommon case where a page should be in your human sitemap but not in AI search.

Blog posts are always excluded automatically when their JSON has `"draft": true` or `"excludeFromSearch": true`. No per-post config needed.

## How content is sourced

- **Pages** use a two-tier resolution for content:
  1. **Sidecar file** (`llms-content.md`): If a file named `llms-content.md` exists next to the page's `page.tsx`, its contents are used verbatim. This is the recommended approach for pages whose visible content comes from an API (Supabase, CMS, etc.) and can't be extracted from the source file.
  2. **JSX extraction** (automatic fallback): For static pages with hardcoded JSX text, the extractor at `src/lib/llms/jsx-extract.ts` reads the page's TSX source and pulls visible text from between JSX tags and string expressions, producing clean prose for AI crawlers. This approach exists because the boilerplate's root layout wraps the app in client components (`ThemeProvider`, `ConditionalLayout`), which causes Next.js to deliver page content as RSC Flight data rather than rendered HTML.
- **Blog posts** are loaded directly from `public/blog-content/` JSON files. The `content` HTML field is converted to markdown at request time by the built-in converter at `src/lib/llms/html-to-md.js` (supports headings, paragraphs, nested lists, links, images, blockquotes, code blocks, tables, inline emphasis, and entity decoding).

Both flows emit the same header block (`**Source:**`, dates, author) so the output is uniform across pages and posts.

### Sidecar files for API-driven pages

If a page pulls content from an external source (Supabase, a headless CMS, a third-party API), the JSX extractor will only see the template code, not the actual content. For these pages, create a `llms-content.md` file next to the page's `page.tsx`:

```
src/app/(pages)/services/
  page.tsx            # renders content from Supabase
  llms-content.md     # AI-visible markdown for this page
  seo-config.json
```

The sidecar file should contain the page's content as plain markdown. When present, it takes absolute priority over JSX extraction. When absent, the automatic extractor handles things.

For pages whose content changes frequently via API, keeping the sidecar updated is the developer's responsibility. A build script or CMS webhook could regenerate it automatically.

## AI crawler allowlist

`src/lib/seo/robots.ts` reads the admin's crawler map at request time and emits a dedicated rule block for each enabled crawler:

| User-Agent | Platform |
| --- | --- |
| `GPTBot` | OpenAI / ChatGPT (training and search) |
| `ChatGPT-User` | ChatGPT browse-on-demand |
| `PerplexityBot` | Perplexity |
| `ClaudeBot` | Anthropic Claude |
| `anthropic-ai` | Anthropic (legacy) |
| `Google-Extended` | Google Gemini and AI Overviews |

Each enabled crawler is allowed to crawl `/`, `/llms.txt`, and `/blog/*.md`, with `/api/`, `/admin/`, and `/private/` blocked. A disabled crawler gets a hard `Disallow: /` and stops appearing on the allow side entirely.

> Note: blocking AI crawlers in the name of "preventing training" also prevents your site from being **cited** in answers. Treat that as a business decision; the default here is "allow citation for all six".

## Verification

With `npm run dev` running (or after deploy):

```bash
# Index
curl http://localhost:3000/llms.txt

# Home page markdown
curl http://localhost:3000/index.md

# Any other page's markdown
curl http://localhost:3000/privacy.md

# Per-post markdown (replace category/slug)
curl http://localhost:3000/blog/guides/blog-post-example.md

# Confirm canonical Link header is set
curl -I http://localhost:3000/privacy.md
# Expect: Link: <https://your-domain.com/privacy>; rel="canonical"

# Confirm AI crawlers are allowed
curl http://localhost:3000/robots.txt | grep -i "GPTBot\|ClaudeBot\|PerplexityBot"

# Confirm drafts and hidden content return 404
curl -I http://localhost:3000/admin.md                    # expect 404 (excluded)
curl -I http://localhost:3000/blog/{category}/{draft-slug}.md   # expect 404

# Confirm client components return 404 on the .md surface
curl -I http://localhost:3000/some-client-component-page.md  # expect 404

# Confirm the master toggle flips everything
# (set Admin > SEO > AI Search > Enable to off, then)
curl -I http://localhost:3000/llms.txt                    # expect 404
curl -I http://localhost:3000/index.md                    # expect 404
curl -I http://localhost:3000/blog/guides/blog-post-example.md  # expect 404
```

Every server-rendered page's HTML also advertises its markdown sibling via `<link rel="alternate" type="text/markdown" href="...md">` in the `<head>` (visible in page source). Excluded and client-component pages do not emit this link.

## File map

| File | Role |
| --- | --- |
| `src/lib/seo/llms-settings.json` | Source of truth for the admin toggle and crawler map. |
| `src/lib/seo/llms-settings.ts` | Read/write helpers (`getLlmsSettings` async, `getLlmsSettingsSync` for the metadata pipeline). |
| `src/app/llms.txt/route.ts` | Serves `/llms.txt`. |
| `src/app/api/page-md/[[...slug]]/route.ts` | Serves `/{path}.md` for every server-rendered page (reached via rewrite in `src/proxy.ts`). |
| `src/app/api/blog-md/[category]/[slug]/route.ts` | Serves `/blog/{category}/{slug}.md` (reached via rewrite in `src/proxy.ts`). |
| `src/app/api/admin/seo/llms/route.ts` | Admin API for the AI Search tab. |
| `src/components/admin/seo/LlmsTab.tsx` | Admin UI. |
| `src/lib/seo/robots.ts` | Consumes the settings to emit the AI crawler blocks in `robots.txt`. |
| `src/lib/seo/generate-static-metadata.ts` | Injects the `<link rel="alternate" type="text/markdown">` advertisement into every page's `<head>`. |
| `src/lib/llms/jsx-extract.ts` | TSX source text extractor used by the page `.md` route. |
| `src/lib/llms/html-to-md.js` | HTML → Markdown converter used by the blog `.md` route. |
