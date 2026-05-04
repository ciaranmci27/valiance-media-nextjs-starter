import React from 'react';
import { StructuredData } from '@/lib/seo/components/StructuredData';
import { seoConfig } from '@/lib/seo/config';

export type LegalSection = {
  /** Slug used as the section's `id` and TOC anchor target. */
  id: string;
  /** Display title rendered next to the numbered eyebrow. */
  title: string;
  /** Section body. Plain JSX — `<p>`, `<ul>`, `<h3>`, `<strong>`, `<a>` are all styled. */
  content: React.ReactNode;
};

type LegalPageProps = {
  /** Massive display headline at the top of the page. */
  title: string;
  /** Sub-paragraph beneath the title (last-updated date, scope statement). */
  sub: string;
  /** Ordered sections rendered in the article body and the sticky TOC. */
  sections: LegalSection[];
  /** Optional contact block rendered as the final numbered section. */
  contact?: React.ReactNode;
  /** Path under the site root, no leading slash. Used to build BreadcrumbList JSON-LD. */
  breadcrumbSlug: string;
  /** Plain-text title for breadcrumbs (no trailing punctuation). */
  breadcrumbName: string;
};

function buildBreadcrumbSchema(name: string, slug: string) {
  const siteUrl = seoConfig.siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name, item: `${siteUrl}/${slug}` },
    ],
  };
}

export function LegalPage({
  title,
  sub,
  sections,
  contact,
  breadcrumbSlug,
  breadcrumbName,
}: LegalPageProps) {
  const breadcrumb = buildBreadcrumbSchema(breadcrumbName, breadcrumbSlug);

  return (
    <>
      <StructuredData data={breadcrumb} />
      <section className="legal-page">
        <div className="container">
          <header className="legal-page__head">
            <h1 className="legal-page__title">{title}</h1>
            <p className="legal-page__sub">{sub}</p>
          </header>

          <div className="legal-page__article">
            <nav className="legal-page__toc" aria-label="Sections">
              <span className="legal-page__toc-label">Contents</span>
              {sections.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="legal-page__toc-link">
                  <span className="legal-page__toc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </a>
              ))}
              {contact ? (
                <a href="#contact" className="legal-page__toc-link">
                  <span className="legal-page__toc-num">{String(sections.length + 1).padStart(2, '0')}</span>
                  <span>Get in touch</span>
                </a>
              ) : null}
            </nav>

            <div className="legal-page__body">
              {sections.map((s, i) => (
                <article key={s.id} id={s.id} className="legal-page__section">
                  <span className="legal-page__section-num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="legal-page__section-title">{s.title}</h2>
                  <div className="legal-page__section-body">{s.content}</div>
                </article>
              ))}

              {contact ? (
                <article id="contact" className="legal-page__section">
                  <span className="legal-page__section-num">
                    {String(sections.length + 1).padStart(2, '0')}
                  </span>
                  <h2 className="legal-page__section-title">Get in touch.</h2>
                  <div className="legal-page__section-body">{contact}</div>
                </article>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
