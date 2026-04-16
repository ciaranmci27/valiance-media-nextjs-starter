/**
 * LLMs / AI-search settings.
 *
 * Single source of truth for the llms.txt feature and the per-blog-post `.md`
 * surface. Kept deliberately small: a master toggle and a per-crawler allow
 * map. Everything else (content discovery, per-page exclusion, cache headers)
 * is either automatic or lives with the page/post that controls it.
 *
 * Why a standalone JSON file instead of a key in `seoConfig`?
 *   The admin SEO Configuration editor rewrites `src/lib/seo/config.ts` from a
 *   typed interface. Any top-level key it does not know about gets dropped on
 *   save. Keeping llms settings in their own file means they can never be
 *   silently wiped by an unrelated admin save.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

export const KNOWN_AI_CRAWLERS = [
  'GPTBot',               // OpenAI / ChatGPT training + search
  'ChatGPT-User',         // ChatGPT browse-on-demand
  'OAI-SearchBot',        // OpenAI SearchGPT
  'PerplexityBot',        // Perplexity
  'Perplexity-User',      // Perplexity on-demand fetch
  'ClaudeBot',            // Anthropic Claude search
  'Claude-Web',           // Anthropic Claude on-demand
  'anthropic-ai',         // Anthropic (legacy)
  'Google-Extended',      // Google Gemini + AI Overviews
  'Applebot-Extended',    // Apple Intelligence / Siri
  'Bytespider',           // ByteDance / Doubao
  'Amazonbot',            // Amazon Alexa + Rufus
  'Meta-ExternalAgent',   // Meta AI
  'cohere-ai',            // Cohere
  'DuckAssistBot',        // DuckDuckGo AI Assist
  'MistralAI-User',       // Mistral
  'YouBot',               // You.com
] as const;

export type KnownAiCrawler = typeof KNOWN_AI_CRAWLERS[number];

export interface LlmsSettings {
  enabled: boolean;
  aiCrawlers: Record<KnownAiCrawler, boolean>;
}

const DEFAULTS: LlmsSettings = {
  enabled: true,
  aiCrawlers: {
    'GPTBot': true,
    'ChatGPT-User': true,
    'OAI-SearchBot': true,
    'PerplexityBot': true,
    'Perplexity-User': true,
    'ClaudeBot': true,
    'Claude-Web': true,
    'anthropic-ai': true,
    'Google-Extended': true,
    'Applebot-Extended': true,
    'Bytespider': true,
    'Amazonbot': true,
    'Meta-ExternalAgent': true,
    'cohere-ai': true,
    'DuckAssistBot': true,
    'MistralAI-User': true,
    'YouBot': true,
  },
};

const SETTINGS_PATH = path.join(process.cwd(), 'src', 'lib', 'seo', 'llms-settings.json');

function normalize(raw: unknown): LlmsSettings {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Partial<LlmsSettings>;
  const crawlersRaw = (obj.aiCrawlers && typeof obj.aiCrawlers === 'object'
    ? obj.aiCrawlers
    : {}) as Record<string, unknown>;
  const aiCrawlers: Record<KnownAiCrawler, boolean> = { ...DEFAULTS.aiCrawlers };
  for (const name of KNOWN_AI_CRAWLERS) {
    if (Object.prototype.hasOwnProperty.call(crawlersRaw, name)) {
      aiCrawlers[name] = crawlersRaw[name] !== false;
    }
  }
  return {
    enabled: obj.enabled !== false,
    aiCrawlers,
  };
}

export async function getLlmsSettings(): Promise<LlmsSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULTS, aiCrawlers: { ...DEFAULTS.aiCrawlers } };
  }
}

/**
 * Sync variant for callers that cannot await (Next.js `Metadata` exports
 * resolved by `generateStaticMetadata`, which is itself sync). Same fallback
 * behaviour as the async variant — defaults on any failure.
 */
export function getLlmsSettingsSync(): LlmsSettings {
  try {
    const raw = fsSync.readFileSync(SETTINGS_PATH, 'utf-8');
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULTS, aiCrawlers: { ...DEFAULTS.aiCrawlers } };
  }
}

export async function setLlmsSettings(partial: Partial<LlmsSettings>): Promise<LlmsSettings> {
  // The file-based CMS as a whole refuses writes in production (see
  // `savePage` in page-utils-server.ts) because Vercel's serverless FS is
  // read-only. Mirror that contract here so admins get a clear error rather
  // than an opaque EROFS stack when they toggle a crawler on a live deploy.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'AI Search settings cannot be edited in production. Edit src/lib/seo/llms-settings.json locally and redeploy.'
    );
  }
  const current = await getLlmsSettings();
  const merged: LlmsSettings = {
    enabled: typeof partial.enabled === 'boolean' ? partial.enabled : current.enabled,
    aiCrawlers: { ...current.aiCrawlers },
  };
  if (partial.aiCrawlers && typeof partial.aiCrawlers === 'object') {
    for (const name of KNOWN_AI_CRAWLERS) {
      const next = (partial.aiCrawlers as Record<string, unknown>)[name];
      if (typeof next === 'boolean') {
        merged.aiCrawlers[name] = next;
      }
    }
  }
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  return merged;
}

export function defaultLlmsSettings(): LlmsSettings {
  return { ...DEFAULTS, aiCrawlers: { ...DEFAULTS.aiCrawlers } };
}
