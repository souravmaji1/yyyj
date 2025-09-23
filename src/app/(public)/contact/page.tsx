import type { Metadata } from "next";
import { ContactForm } from "@/src/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — IntelliVerseX",
  description: "Get in touch with IntelliVerseX. Contact our team for support, partnerships, or general inquiries about our AI-powered gaming platform.",
};

export default function ContactPage() {
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
        "name": "Contact",
        "item": "https://intelli-verse-x.ai/contact"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[var(--color-surface)] text-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Hero Section */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              We&apos;re here to help. Reach out to our team for support, partnerships, 
              or any questions about IntelliVerseX.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
              <ContactForm />
            </div>

            {/* Contact Information & Details */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Direct Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a 
                        href="mailto:sales@intelli-verse-x.ai" 
                        className="text-[var(--color-primary)] hover:underline font-medium"
                      >
                        sales@intelli-verse-x.ai
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white">San Francisco, CA (Distributed Team)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Times */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Response Times</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">General Inquiries</span>
                    <span className="text-[var(--color-primary)] font-medium">24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Technical Support</span>
                    <span className="text-[var(--color-primary)] font-medium">4-8 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Business Partnerships</span>
                    <span className="text-[var(--color-primary)] font-medium">2-3 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Media & Press</span>
                    <span className="text-[var(--color-primary)] font-medium">Same day</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Looking for something specific?</h3>
                <div className="space-y-3">
                  <a 
                    href="/support" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">Get Support</p>
                      <p className="text-sm text-gray-400">Account help, troubleshooting, FAQs</p>
                    </div>
                  </a>
                  
                  <a 
                    href="/careers" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">Join Our Team</p>
                      <p className="text-sm text-gray-400">Career opportunities, applications</p>
                    </div>
                  </a>
                  
                  <a 
                    href="/press" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">Media & Press</p>
                      <p className="text-sm text-gray-400">Press kit, assets, interviews</p>
                    </div>
                  </a>
                  
                  <a 
                    href="/privacy/choices" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">Privacy & Data</p>
                      <p className="text-sm text-gray-400">Privacy controls, data requests</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Availability</h3>
                <p className="text-gray-300 text-sm">
                  Our team operates across multiple time zones to provide global support. 
                  While we&apos;re a distributed company, our core hours are 9 AM - 6 PM Pacific Time, 
                  Monday through Friday. We also monitor urgent requests outside of these hours.
                </p>
              </div>
            </div>
          </div>

          {/* Cross-links */}
          <footer className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400 text-center">
              Learn more: {' '}
              <a href="/about" className="text-[var(--color-primary)] hover:underline">About Us</a>
              {' '} · {' '}
              <a href="/support" className="text-[var(--color-primary)] hover:underline">Support Center</a>
              {' '} · {' '}
              <a href="/privacy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>
              {' '} · {' '}
              <a href="/terms" className="text-[var(--color-primary)] hover:underline">Terms of Service</a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}