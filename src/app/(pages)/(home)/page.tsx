// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/seo/generate-static-metadata';
export const metadata = generateStaticMetadata('(home)');

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Your Site
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This is a placeholder homepage. Replace this content with your own marketing site.
        </p>
        <div className="pt-4 text-sm text-gray-500 dark:text-gray-500 space-y-2">
          <p>
            <strong>Getting Started:</strong>
          </p>
          <ol className="text-left list-decimal list-inside space-y-1">
            <li>Update <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">src/seo/seo.config.ts</code> with your site details</li>
            <li>Replace this page content with your homepage design</li>
            <li>Update <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">seo-config.json</code> in each page folder</li>
            <li>Add your logo files to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">public/logos/</code></li>
          </ol>
        </div>
      </div>
    </main>
  );
}


