// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/seo/generate-static-metadata';
export const metadata = generateStaticMetadata('cookies');

import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction.',
    content: (
      <>
        <p>
          This Cookie Policy explains how Valiance Media LLC (&ldquo;we,&rdquo;
          &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar
          technologies when you visit our website and use our services.
        </p>
        <p>
          By using our website, you consent to the use of cookies in accordance
          with this Cookie Policy.
        </p>
      </>
    ),
  },
  {
    id: 'what-are-cookies',
    title: 'What are cookies?',
    content: (
      <>
        <p>
          Cookies are small text files that are stored on your device
          (computer, tablet, or mobile) when you visit a website. They help
          websites remember your preferences and improve your browsing
          experience.
        </p>
        <p>
          Cookies can be &ldquo;session&rdquo; cookies (temporary and deleted
          when you close your browser) or &ldquo;persistent&rdquo; cookies
          (remain on your device until they expire or you delete them).
        </p>
      </>
    ),
  },
  {
    id: 'types',
    title: 'Types of cookies we use.',
    content: (
      <>
        <h3>Essential</h3>
        <p>
          Necessary for the website to function properly. They enable core
          functionality such as security, network management, and
          accessibility. You cannot opt out of these cookies.
        </p>
        <ul>
          <li>Authentication and account management.</li>
          <li>Security and fraud prevention.</li>
          <li>Load balancing and performance optimization.</li>
        </ul>
        <h3>Performance</h3>
        <p>
          Collect information about how visitors use our website, such as which
          pages are visited most often. This data helps us improve performance.
        </p>
        <ul>
          <li>Page load times and performance metrics.</li>
          <li>Error tracking and debugging.</li>
          <li>User journey and navigation patterns.</li>
        </ul>
        <h3>Functional</h3>
        <p>
          Allow the website to remember choices you make (such as your language
          or region) and provide enhanced, personalized features.
        </p>
        <ul>
          <li>Language and region preferences.</li>
          <li>Theme preferences (light/dark mode).</li>
          <li>Personalized content and recommendations.</li>
        </ul>
        <h3>Analytics</h3>
        <p>
          Help us understand how visitors interact with our website. This
          information is used to improve our services and user experience.
        </p>
        <ul>
          <li>Google Analytics for traffic analysis.</li>
          <li>User behavior and engagement metrics.</li>
          <li>Conversion tracking and optimization.</li>
        </ul>
        <h3>Marketing</h3>
        <p>
          Deliver advertisements that are relevant to you and your interests.
          They may also limit the number of times you see an advertisement.
        </p>
        <ul>
          <li>Targeted advertising and retargeting.</li>
          <li>Social media integration and sharing.</li>
          <li>Campaign performance measurement.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party',
    title: 'Third-party cookies.',
    content: (
      <>
        <p>We may use third-party services that set cookies on our website. These include:</p>
        <ul>
          <li>Google Analytics for website analytics.</li>
          <li>Social media platforms for content sharing.</li>
          <li>Advertising networks for targeted ads.</li>
          <li>Payment processors for secure transactions.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'Managing cookies.',
    content: (
      <>
        <p>
          You have the right to decide whether to accept or reject cookies. You
          can manage your cookie preferences through:
        </p>
        <ul>
          <li><strong>Browser settings:</strong> most browsers allow you to control cookies through their settings.</li>
          <li><strong>Cookie consent banner:</strong> manage your preferences through our cookie consent tool.</li>
          <li><strong>Opt-out links:</strong> use third-party opt-out mechanisms for analytics and advertising.</li>
        </ul>
        <p>
          Please note that blocking or deleting cookies may impact your
          experience on our website and limit certain functionality.
        </p>
      </>
    ),
  },
  {
    id: 'browser-controls',
    title: 'Browser controls.',
    content: (
      <>
        <p>
          You can control and manage cookies in your browser settings. Most
          modern browsers offer detailed cookie management:
        </p>
        <ul>
          <li>Google Chrome.</li>
          <li>Mozilla Firefox.</li>
          <li>Safari.</li>
          <li>Microsoft Edge.</li>
          <li>Opera.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'do-not-track',
    title: 'Do Not Track signals.',
    content: (
      <p>
        Some browsers have a &ldquo;Do Not Track&rdquo; feature that lets you
        tell websites you do not want to have your online activities tracked.
        At this time, we do not respond to browser &ldquo;Do Not Track&rdquo;
        signals.
      </p>
    ),
  },
  {
    id: 'updates',
    title: 'Updates to this policy.',
    content: (
      <p>
        We may update this Cookie Policy from time to time to reflect changes
        in our practices or for other operational, legal, or regulatory
        reasons. We will notify you of any material changes by posting the
        updated policy on this page with a new &ldquo;Last updated&rdquo; date.
      </p>
    ),
  },
  {
    id: 'related',
    title: 'Related policies.',
    content: (
      <>
        <p>For more information about how we handle your data, please review our related policies:</p>
        <ul>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms-of-service">Terms of Service</a></li>
        </ul>
      </>
    ),
  },
];

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy."
      sub="Last updated December 2024. How and why we use cookies and similar technologies."
      sections={sections}
      breadcrumbSlug="cookies"
      breadcrumbName="Cookie Policy"
      contact={
        <>
          <p>If you have any questions about our use of cookies or this Cookie Policy, please reach out:</p>
          <div className="legal-page__contact-card">
            <strong>Valiance Media LLC</strong>
            <span>Email: privacy@example.com</span>
            <span>Address: [Your Business Address]</span>
          </div>
        </>
      }
    />
  );
}
