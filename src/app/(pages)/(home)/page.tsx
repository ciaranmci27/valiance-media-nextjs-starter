// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/generate-static-metadata';
export const metadata = generateStaticMetadata('(home)');

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Your Next.js Boilerplate</h1>
      <p>This is an example homepage. Replace this content with your own marketing site.</p>
    </div>
  );
}


