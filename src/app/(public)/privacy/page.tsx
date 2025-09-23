import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — IntelliVerseX",
  description: "IntelliVerseX privacy policy explaining how we collect, use, and protect your personal information across our gaming and commerce platform.",
};

export default function PrivacyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://intelli-verse-x.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": "https://intelli-verse-x.ai/privacy"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="mx-auto max-w-4xl px-4 py-12 prose prose-invert">
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Privacy Policy</h1>
        
        <p className="text-lg text-gray-200 mb-8">
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Overview</h2>
          <p className="text-gray-300">
            IntelliVerseX is committed to protecting your privacy and giving you control over your personal information. 
            This policy explains how we collect, use, share, and protect your data when you use our gaming and commerce platform.
          </p>
          <p className="text-gray-300">
            We believe in transparency and fairness in all our practices, including data handling. 
            You have the right to understand what data we collect and how it&apos;s used to enhance your experience.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">What We Collect</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Account Information</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Email address and username</li>
                <li>• Profile information you choose to provide</li>
                <li>• Account preferences and settings</li>
                <li>• Authentication credentials (encrypted)</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Gaming & Usage Data</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Game performance and progress statistics</li>
                <li>• Platform usage patterns and preferences</li>
                <li>• Feature interaction and engagement metrics</li>
                <li>• Content creation and sharing activities</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Technical Information</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Device type, operating system, and browser</li>
                <li>• IP address and general location data</li>
                <li>• Performance and error logs (anonymized)</li>
                <li>• Security and fraud prevention data</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Commerce Data</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Purchase history and transaction details</li>
                <li>• Payment information (tokenized, not stored)</li>
                <li>• Marketplace interactions and preferences</li>
                <li>• Digital asset ownership records</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">How We Use Your Data</h2>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Service Delivery</h3>
              <p className="text-gray-300 text-sm">
                Providing core platform functionality, game features, and commerce services. 
                This includes matchmaking, personalization, and technical support.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Safety & Security</h3>
              <p className="text-gray-300 text-sm">
                Detecting fraud, preventing cheating, and maintaining platform security. 
                We use AI systems to identify suspicious behavior and protect all users.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Improvement & Analytics</h3>
              <p className="text-gray-300 text-sm">
                Analyzing usage patterns to improve features, fix bugs, and develop new capabilities. 
                This data is aggregated and anonymized wherever possible.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Communication</h3>
              <p className="text-gray-300 text-sm">
                Sending important updates, security notifications, and promotional content 
                (with your consent). You can opt out of marketing communications at any time.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Data Retention</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Active Accounts</h3>
                <p className="text-gray-300 text-sm">Data retained while account is active plus 2 years for security and legal purposes.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Deleted Accounts</h3>
                <p className="text-gray-300 text-sm">Most data deleted within 30 days. Some records retained for legal compliance.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Analytics Data</h3>
                <p className="text-gray-300 text-sm">Aggregated, anonymized data may be retained indefinitely for research and improvement.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Legal Holds</h3>
                <p className="text-gray-300 text-sm">Data may be retained longer when required by law or for legal proceedings.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Choices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Privacy Controls</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• <a href="/privacy/dashboard" className="text-[var(--color-primary)] hover:underline">Privacy Dashboard</a></li>
                <li>• <a href="/data/export" className="text-[var(--color-primary)] hover:underline">Export Your Data</a></li>
                <li>• <a href="/data/delete" className="text-[var(--color-primary)] hover:underline">Delete Your Account</a></li>
                <li>• <a href="/cookies/preferences" className="text-[var(--color-primary)] hover:underline">Cookie Settings</a></li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Communication Preferences</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Opt out of marketing emails</li>
                <li>• Control push notifications</li>
                <li>• Manage friend requests</li>
                <li>• Set privacy levels for profile</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Contact</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <p className="text-gray-300 mb-4">
              If you have questions about this privacy policy or want to exercise your privacy rights:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Email: <a href="mailto:sales@intelli-verse-x.ai?subject=Privacy%20Question" className="text-[var(--color-primary)] hover:underline">sales@intelli-verse-x.ai</a></li>
              <li>• Privacy Portal: <a href="/privacy/choices" className="text-[var(--color-primary)] hover:underline">Privacy Choices</a></li>
              <li>• Support: <a href="/support" className="text-[var(--color-primary)] hover:underline">Help Center</a></li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Updates</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <p className="text-gray-300">
              We may update this privacy policy periodically to reflect changes in our practices or applicable laws. 
              We&apos;ll notify you of significant changes via email or platform notification. 
              Your continued use of our services after updates indicates acceptance of the revised policy.
            </p>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          Related: {' '}
          <a href="/privacy/choices" className="text-[var(--color-primary)] hover:underline">Privacy Choices</a>
          {' '} · {' '}
          <a href="/terms" className="text-[var(--color-primary)] hover:underline">Terms of Service</a>
          {' '} · {' '}
          <a href="/security" className="text-[var(--color-primary)] hover:underline">Security</a>
          {' '} · {' '}
          <a href="/contact" className="text-[var(--color-primary)] hover:underline">Contact Us</a>
        </p>
      </main>
    </>
  );
}