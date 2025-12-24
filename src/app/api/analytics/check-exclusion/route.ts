import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// Common bot user-agent patterns
// Using word boundaries and specific patterns to avoid false positives
const BOT_PATTERNS = [
  // Search engine crawlers (specific names)
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /applebot/i,
  // Social media crawlers
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterestbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
  // Testing/automation tools
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /cypress/i,
  // Monitoring and uptime services
  /pingdom/i,
  /uptimerobot/i,
  /statuscake/i,
  /newrelic/i,
  /datadog/i,
  /site24x7/i,
  // Google tools
  /lighthouse/i,
  /pagespeed/i,
  /googleweblight/i,
  // Generic bot patterns (end of user agent typically)
  /bot\//i,      // Matches "bot/" like "Googlebot/2.1"
  /bot;/i,       // Matches "bot;"
  /bot$/i,       // Matches "bot" at end of string
  /crawler\//i,  // Matches "crawler/"
  /spider\//i,   // Matches "spider/"
];

// Localhost IP patterns
const LOCALHOST_PATTERNS = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost',
  '0.0.0.0',
];

interface AnalyticsExclusions {
  enabled: boolean;
  excludedIPs: string[];
  excludeLocalhost: boolean;
  excludeBots: boolean;
}

async function loadExclusionSettings(): Promise<AnalyticsExclusions> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    return settings.analyticsExclusions || {
      enabled: true,
      excludedIPs: [],
      excludeLocalhost: true,
      excludeBots: true,
    };
  } catch {
    // Return defaults if file doesn't exist
    return {
      enabled: true,
      excludedIPs: [],
      excludeLocalhost: true,
      excludeBots: true,
    };
  }
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function isLocalhost(ip: string): boolean {
  return LOCALHOST_PATTERNS.includes(ip.toLowerCase());
}

function isExcludedIP(ip: string, excludedIPs: string[]): boolean {
  const normalizedIP = ip.toLowerCase().trim();
  return excludedIPs.some(excludedIP => {
    const normalized = excludedIP.toLowerCase().trim();
    // Simple exact match - CIDR notation not supported
    // Users should list individual IPs or use hosting-level firewall for ranges
    return normalizedIP === normalized;
  });
}

export async function GET(request: NextRequest) {
  try {
    const exclusions = await loadExclusionSettings();

    // If exclusions are disabled entirely, no one is excluded
    if (!exclusions.enabled) {
      return NextResponse.json({
        isExcluded: false,
        reason: null,
        ip: null,
      });
    }

    // Extract IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : request.headers.get('x-real-ip') ||
        request.headers.get('x-client-ip') ||
        request.headers.get('cf-connecting-ip') ||
        'unknown';

    // Extract user agent for bot detection
    const userAgent = request.headers.get('user-agent');

    // Check exclusion reasons
    let isExcluded = false;
    let reason: string | null = null;

    // Check 1: Localhost
    if (exclusions.excludeLocalhost && isLocalhost(ip)) {
      isExcluded = true;
      reason = 'localhost';
    }

    // Check 2: Excluded IPs list
    if (!isExcluded && isExcludedIP(ip, exclusions.excludedIPs)) {
      isExcluded = true;
      reason = 'excluded_ip';
    }

    // Check 3: Bot detection
    if (!isExcluded && exclusions.excludeBots && isBot(userAgent)) {
      isExcluded = true;
      reason = 'bot';
    }

    return NextResponse.json({
      isExcluded,
      reason,
      ip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking analytics exclusion:', error);
    // On error, default to NOT excluded (fail open for analytics)
    return NextResponse.json({
      isExcluded: false,
      reason: null,
      ip: null,
      error: 'Failed to check exclusion status',
    });
  }
}
