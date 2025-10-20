// THIS IS REQUIRED FOR SEO CONFIG - DO NOT REMOVE
// Every page must have this metadata export to load its seo-config.json
import { generateStaticMetadata } from '@/lib/seo/generate-static-metadata';
export const metadata = generateStaticMetadata('cookies');

import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function CookiePolicy() {
  return (
    <PageWrapper>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Cookie Policy</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Last updated:</strong> December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This Cookie Policy explains how Valiance Media LLC ("we," "our," or "us") uses cookies and similar technologies when you visit our website and use our services.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By using our website, you consent to the use of cookies in accordance with this Cookie Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. What Are Cookies?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences and improve your browsing experience.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Cookies can be "session" cookies (temporary and deleted when you close your browser) or "persistent" cookies (remain on your device until they expire or you delete them).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Essential Cookies</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Authentication and account management</li>
                <li>Security and fraud prevention</li>
                <li>Load balancing and performance optimization</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Performance Cookies</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us improve our website performance.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Page load times and performance metrics</li>
                <li>Error tracking and debugging</li>
                <li>User journey and navigation patterns</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Functional Cookies</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These cookies allow the website to remember choices you make (such as your language or region) and provide enhanced, personalized features.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Language and region preferences</li>
                <li>Theme preferences (light/dark mode)</li>
                <li>Personalized content and recommendations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Analytics Cookies</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use analytics cookies to understand how visitors interact with our website. This information is used to improve our services and user experience.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Google Analytics for traffic analysis</li>
                <li>User behavior and engagement metrics</li>
                <li>Conversion tracking and optimization</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Marketing Cookies</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Targeted advertising and retargeting</li>
                <li>Social media integration and sharing</li>
                <li>Campaign performance measurement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may use third-party services that set cookies on our website. These include:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Google Analytics for website analytics</li>
                <li>Social media platforms for content sharing</li>
                <li>Advertising networks for targeted ads</li>
                <li>Payment processors for secure transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Managing Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences through:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Browser settings:</strong> Most browsers allow you to control cookies through their settings</li>
                <li><strong>Cookie consent banner:</strong> Manage your preferences through our cookie consent tool</li>
                <li><strong>Opt-out links:</strong> Use third-party opt-out mechanisms for analytics and advertising</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Please note that blocking or deleting cookies may impact your experience on our website and limit certain functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Browser Controls</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You can control and manage cookies in your browser settings. Here are links to cookie management guides for popular browsers:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Google Chrome</li>
                <li>Mozilla Firefox</li>
                <li>Safari</li>
                <li>Microsoft Edge</li>
                <li>Opera</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Do Not Track Signals</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Some browsers have a "Do Not Track" feature that lets you tell websites you do not want to have your online activities tracked. At this time, we do not respond to browser "Do Not Track" signals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Updates to This Cookie Policy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page with a new "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Valiance Media LLC</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Email: privacy@example.com
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Address: [Your Business Address]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Related Policies</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For more information about how we handle your data, please review our related policies:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <Link href="/privacy" className="text-primary hover:text-primary-light underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-primary hover:text-primary-light underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
