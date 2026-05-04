import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { ThemeMode } from "@/styles/themes";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { Analytics } from "@/components/analytics/Analytics";
import { generateMetadata } from "@/lib/seo/seo-utils";
import { seoConfig } from "@/lib/seo/config";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generate metadata using our SEO utilities
export const metadata: Metadata = {
  ...generateMetadata(),
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/favicon/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

// Export viewport configuration separately (Next.js 13+ pattern)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // Enable safe area insets on iOS
};

// Tiny inline script for first-time visitors (no theme cookie yet): if their
// OS prefers dark, set the .dark class + a 1-year cookie before paint. After
// this, all subsequent renders are server-side correct. Returning visitors
// don't run this script's body — their cookie is already set, so the layout
// below already rendered with the right theme.
const themeBootstrapScript = `(function(){try{if(document.cookie.indexOf('theme=')!==-1)return;if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.cookie='theme=dark; path=/; max-age=31536000; samesite=lax';}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the saved theme from the cookie set by ThemeProvider. The server
  // renders <html class="dark"> directly when appropriate — eliminating the
  // flash, the dual-image-fetch, and the hydration mismatch for returning
  // visitors. First-time visitors without a cookie get the light theme by
  // default; the bootstrap script above flips to dark before paint if their
  // OS prefers dark.
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("theme")?.value;
  const theme: ThemeMode = cookieTheme === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      className={theme === "dark" ? "dark" : undefined}
      data-theme={theme}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider initialTheme={theme}>
          <AnalyticsProvider>
            <Analytics />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
