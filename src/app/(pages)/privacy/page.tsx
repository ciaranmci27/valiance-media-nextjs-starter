// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/seo/generate-static-metadata';
export const metadata = generateStaticMetadata('privacy');

import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction.',
    content: (
      <>
        <p>
          Welcome to Valiance Media (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
          &ldquo;us&rdquo;). This Privacy Policy explains how Valiance Media LLC
          collects, uses, discloses, and safeguards your information when you
          use our Valiance Media mobile application and related services.
        </p>
        <p>
          By using Valiance Media, you agree to the collection and use of
          information in accordance with this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect.',
    content: (
      <>
        <h3>Personal information</h3>
        <ul>
          <li>Name and email address when you create an account.</li>
          <li>Profile information and preferences.</li>
          <li>Usage data and analytics.</li>
          <li>Communications and support interactions.</li>
        </ul>
        <h3>Usage information</h3>
        <ul>
          <li>App usage patterns and feature interactions.</li>
          <li>Device information (model, operating system, unique identifiers).</li>
          <li>Log data including IP address, browser type, and access times.</li>
          <li>Location data (when you grant permission) for course recommendations.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your information.',
    content: (
      <>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide personalized services and recommendations.</li>
          <li>Track usage and improve our products.</li>
          <li>Improve our AI algorithms and app functionality.</li>
          <li>Send you important updates about the service.</li>
          <li>Provide customer support and respond to your inquiries.</li>
          <li>Ensure the security and integrity of our services.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'information-sharing',
    title: 'Information sharing.',
    content: (
      <>
        <p>
          We do not sell, trade, or otherwise transfer your personal
          information to third parties without your consent, except in the
          following circumstances:
        </p>
        <ul>
          <li>With service providers who assist in app functionality, under strict confidentiality agreements.</li>
          <li>When required by law or to protect our rights and safety.</li>
          <li>In connection with a business transfer or merger, with prior notice to you.</li>
          <li>With your explicit consent for specific purposes.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-security',
    title: 'Data security.',
    content: (
      <>
        <p>
          We implement appropriate technical and organizational security
          measures to protect your personal information against unauthorized
          access, alteration, disclosure, or destruction. This includes:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest.</li>
          <li>Regular security assessments and updates.</li>
          <li>Access controls and authentication measures.</li>
          <li>Secure cloud infrastructure with reputable providers.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights.',
    content: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>Access and review your personal information.</li>
          <li>Correct or update your information.</li>
          <li>Delete your account and associated data.</li>
          <li>Opt-out of marketing communications.</li>
          <li>Request data portability.</li>
          <li>Withdraw consent where applicable.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data retention.',
    content: (
      <p>
        We retain your personal information only as long as necessary to
        provide our services and fulfill the purposes outlined in this Privacy
        Policy. When you delete your account, we will delete your personal
        information within 30 days, except where we are required to retain it
        by law.
      </p>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "Children's privacy.",
    content: (
      <p>
        Valiance Media is not intended for children under 13 years of age. We
        do not knowingly collect personal information from children under 13.
        If you become aware that a child has provided us with personal
        information, please contact us immediately.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy.',
    content: (
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the &ldquo;Last updated&rdquo; date. You are advised to review
        this Privacy Policy periodically for any changes.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy."
      sub="Last updated December 2024. This policy explains what we collect, how we use it, and the choices you have."
      sections={sections}
      breadcrumbSlug="privacy"
      breadcrumbName="Privacy Policy"
      contact={
        <>
          <p>
            If you have any questions about this Privacy Policy or our data
            practices, please reach out:
          </p>
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
