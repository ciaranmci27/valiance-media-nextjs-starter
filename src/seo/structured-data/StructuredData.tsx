/**
 * Structured Data Component
 * 
 * This component renders JSON-LD structured data for SEO.
 * It helps search engines better understand your content.
 */

interface StructuredDataProps {
  data: Record<string, any> | Record<string, any>[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 2),
          }}
        />
      ))}
    </>
  );
}

export default StructuredData;