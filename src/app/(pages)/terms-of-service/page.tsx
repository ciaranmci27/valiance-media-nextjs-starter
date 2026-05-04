// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/seo/generate-static-metadata';
export const metadata = generateStaticMetadata('terms-of-service');

import { LegalPage, type LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement to terms.',
    content: (
      <>
        <p>
          By accessing and using Valiance Media (&ldquo;the App&rdquo;) provided
          by Valiance Media LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo;
          &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you (&ldquo;User,&rdquo;
          &ldquo;you,&rdquo; or &ldquo;your&rdquo;) agree to be bound by these
          Terms of Service (&ldquo;Terms&rdquo;).
        </p>
        <p>If you do not agree to these Terms, you may not access or use Valiance Media.</p>
      </>
    ),
  },
  {
    id: 'description',
    title: 'Description of service.',
    content: (
      <>
        <p>Valiance Media provides digital products and services including:</p>
        <ul>
          <li>Custom software development solutions.</li>
          <li>Performance tracking and analytics.</li>
          <li>E-commerce platform development.</li>
          <li>Digital product innovation and consulting.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility.',
    content: (
      <>
        <p>You must be at least 13 years old to use Valiance Media. By using the App, you represent and warrant that:</p>
        <ul>
          <li>You are at least 13 years of age.</li>
          <li>You have the legal capacity to enter into these Terms.</li>
          <li>Your use of the App complies with all applicable laws and regulations.</li>
          <li>All information you provide is accurate and truthful.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'User accounts.',
    content: (
      <>
        <p>To access certain features, you may need to create an account. You agree to:</p>
        <ul>
          <li>Provide accurate and complete registration information.</li>
          <li>Maintain the security of your account credentials.</li>
          <li>Notify us immediately of any unauthorized use.</li>
          <li>Accept responsibility for all activities under your account.</li>
          <li>Not share your account with others.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use.',
    content: (
      <>
        <p>You agree to use Valiance Media only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
        <ul>
          <li>Use the App for any illegal or unauthorized purpose.</li>
          <li>Attempt to gain unauthorized access to our systems.</li>
          <li>Interfere with or disrupt the App&apos;s functionality.</li>
          <li>Upload malicious code or harmful content.</li>
          <li>Impersonate others or provide false information.</li>
          <li>Violate any applicable laws or regulations.</li>
          <li>Reverse engineer or attempt to extract source code.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'subscription',
    title: 'Subscription and payment.',
    content: (
      <>
        <h3>Free trial</h3>
        <p>
          We may offer a free trial period for new users. At the end of the
          trial period, your subscription will automatically convert to a paid
          subscription unless you cancel.
        </p>
        <h3>Paid subscriptions</h3>
        <ul>
          <li>Subscription fees are charged in advance on a recurring basis.</li>
          <li>Payments are processed through your device&apos;s app store.</li>
          <li>All fees are non-refundable except as required by law.</li>
          <li>We may change subscription prices with 30 days&apos; notice.</li>
        </ul>
        <h3>Cancellation</h3>
        <p>
          You may cancel your subscription at any time through your device&apos;s
          app store settings. Cancellation will take effect at the end of your
          current billing period.
        </p>
      </>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual property.',
    content: (
      <>
        <p>
          Valiance Media and all related content, features, and functionality
          are and will remain the exclusive property of Valiance Media LLC and
          its licensors. This includes:
        </p>
        <ul>
          <li>Software code and algorithms.</li>
          <li>AI models and training data.</li>
          <li>Content, text, graphics, and user interfaces.</li>
          <li>Trademarks, service marks, and logos.</li>
          <li>Any improvements or modifications.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'user-content',
    title: 'User content.',
    content: (
      <>
        <p>
          You retain ownership of any content you submit to Valiance Media
          (&ldquo;User Content&rdquo;). By submitting User Content, you grant us
          a non-exclusive, worldwide, royalty-free license to use, modify, and
          display your content solely for the purpose of providing and
          improving our services.
        </p>
        <p>
          You represent that your User Content does not violate any third-party
          rights or applicable laws.
        </p>
      </>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy.',
    content: (
      <p>
        Your privacy is important to us. Please review our{' '}
        <a href="/privacy">Privacy Policy</a>, which also governs your use of
        Valiance Media, to understand our practices regarding the collection
        and use of your personal information.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers.',
    content: (
      <>
        <p>
          Valiance Media is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; without warranties of any kind. We disclaim all
          warranties, express or implied, including but not limited to:
        </p>
        <ul>
          <li>Merchantability and fitness for a particular purpose.</li>
          <li>Non-infringement of third-party rights.</li>
          <li>Accuracy, completeness, or reliability of content.</li>
          <li>Uninterrupted or error-free operation.</li>
        </ul>
        <p>
          <strong>Important.</strong> Valiance Media provides software
          solutions and digital services. All products and services are
          provided &ldquo;as is&rdquo; and results may vary based on
          implementation and usage. Professional consultation may be required
          for complex implementations.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability.',
    content: (
      <>
        <p>
          To the maximum extent permitted by law, Valiance Media LLC shall not
          be liable for any indirect, incidental, special, consequential, or
          punitive damages, including but not limited to:
        </p>
        <ul>
          <li>Loss of profits, data, use, or goodwill.</li>
          <li>Service interruption or security breaches.</li>
          <li>Damages resulting from use of third-party services.</li>
          <li>Any other intangible losses.</li>
        </ul>
        <p>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
      </>
    ),
  },
  {
    id: 'indemnification',
    title: 'Indemnification.',
    content: (
      <p>
        You agree to indemnify, defend, and hold harmless Valiance Media LLC
        and its officers, directors, employees, and agents from and against any
        claims, liabilities, damages, losses, and expenses arising out of or in
        any way connected with your use of Valiance Media or violation of these
        Terms.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination.',
    content: (
      <>
        <p>
          We may terminate or suspend your account and access to Valiance Media
          at any time, without prior notice, for any reason, including but not
          limited to:
        </p>
        <ul>
          <li>Violation of these Terms.</li>
          <li>Fraudulent or illegal activity.</li>
          <li>Extended inactivity.</li>
          <li>Technical or business reasons.</li>
        </ul>
        <p>Upon termination, your right to use Valiance Media will cease immediately.</p>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law.',
    content: (
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of [Your State/Country], without regard to its conflict of law
        principles. Any legal action or proceeding shall be brought exclusively
        in the courts of [Your Jurisdiction].
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms.',
    content: (
      <p>
        We reserve the right to modify these Terms at any time. We will notify
        you of any changes by posting the new Terms on this page and updating
        the &ldquo;Last updated&rdquo; date. Your continued use of Valiance
        Media after changes become effective constitutes acceptance of the new
        Terms.
      </p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service."
      sub="Last updated December 2024. The agreement that governs your use of Valiance Media."
      sections={sections}
      breadcrumbSlug="terms-of-service"
      breadcrumbName="Terms of Service"
      contact={
        <>
          <p>If you have any questions about these Terms of Service, please reach out:</p>
          <div className="legal-page__contact-card">
            <strong>Valiance Media LLC</strong>
            <span>Email: legal@example.com</span>
            <span>Address: [Your Business Address]</span>
          </div>
        </>
      }
    />
  );
}
