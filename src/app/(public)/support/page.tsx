import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center — IntelliVerseX",
  description: "Get help with your IntelliVerseX account, purchases, gaming, and more. Access our comprehensive support resources and contact options.",
};

export default function SupportPage() {
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
        "name": "Support",
        "item": "https://intelli-verse-x.ai/support"
      }
    ]
  };

  const supportCategories = [
    {
      title: "Account",
      icon: "👤",
      description: "Sign up, login, profile settings, password reset",
      topics: [
        "Creating an account",
        "Forgotten password recovery",
        "Profile management",
        "Account verification",
        "Deleting your account"
      ],
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      title: "Purchases & Refunds",
      icon: "💳",
      description: "Payment issues, order tracking, refund requests",
      topics: [
        "Payment methods",
        "Order status tracking",
        "Refund policy",
        "Billing questions",
        "Subscription management"
      ],
      bgColor: "bg-green-500/20",
      iconColor: "text-green-400"
    },
    {
      title: "NFTs & Wallet",
      icon: "🔗",
      description: "Digital assets, wallet connection, blockchain transactions",
      topics: [
        "Connecting your wallet",
        "NFT purchases",
        "Transaction issues",
        "Asset transfers",
        "Blockchain networks"
      ],
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-400"
    },
    {
      title: "Gameplay & Fairness",
      icon: "🎮",
      description: "Game rules, fair play, results verification",
      topics: [
        "Game mechanics",
        "Fair play verification",
        "Result disputes",
        "Anti-cheat systems",
        "Tournament rules"
      ],
      bgColor: "bg-orange-500/20",
      iconColor: "text-orange-400"
    },
    {
      title: "Privacy & Data",
      icon: "🔒",
      description: "Data protection, privacy controls, consent management",
      topics: [
        "Privacy settings",
        "Data export requests",
        "Cookie preferences",
        "Marketing communications",
        "Data deletion"
      ],
      bgColor: "bg-red-500/20",
      iconColor: "text-red-400"
    },
    {
      title: "Contact Support",
      icon: "💬",
      description: "Speak with our support team for personalized help",
      topics: [
        "Live chat support",
        "Email support",
        "Report a bug",
        "Feature requests",
        "Emergency assistance"
      ],
      bgColor: "bg-teal-500/20",
      iconColor: "text-teal-400"
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[var(--color-surface)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Hero Section */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-6">
              Help Center
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
              Find answers to common questions or get in touch with our support team. 
              We&apos;re here to help you make the most of IntelliVerseX.
            </p>

            {/* Quick Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search for help..."
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </header>

          {/* Support Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportCategories.map((category, index) => (
                <div 
                  key={index}
                  className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${category.bgColor} rounded-lg flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors">
                        {category.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    {category.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="text-sm text-gray-400 hover:text-white transition-colors">
                        • {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link 
                href="/contact"
                className="bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 rounded-lg p-6 text-center hover:bg-[var(--color-primary)]/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-primary)]/40 transition-colors">
                  <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-sm text-gray-300">Get help from our team</p>
              </Link>

              <Link 
                href="/privacy/choices"
                className="bg-white/5 border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 transition-colors group"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Privacy Controls</h3>
                <p className="text-sm text-gray-300">Manage your data</p>
              </Link>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Report Bug</h3>
                <p className="text-sm text-gray-300">Found an issue?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Feature Request</h3>
                <p className="text-sm text-gray-300">Share your ideas</p>
              </div>
            </div>
          </section>

          {/* Popular Articles */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Popular Help Articles</h2>
            <div className="bg-white/5 rounded-lg border border-white/10 divide-y divide-white/10">
              {[
                "How to create and verify your account",
                "Understanding game fairness and RNG verification",
                "Setting up your crypto wallet for NFT purchases",
                "Managing privacy settings and data controls",
                "Troubleshooting payment and billing issues",
                "How to export or delete your account data"
              ].map((article, index) => (
                <div key={index} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white group-hover:text-[var(--color-primary)] transition-colors">
                      {article}
                    </h3>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="bg-red-50/10 border border-red-500/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-300 mb-4">Need Immediate Help?</h2>
            <p className="text-red-200 mb-4">
              For urgent security issues, account compromises, or payment emergencies:
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Contact Emergency Support
            </Link>
          </section>

          {/* Cross-links */}
          <footer className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400 text-center">
              Also see: {' '}
              <a href="/contact" className="text-[var(--color-primary)] hover:underline">Contact Us</a>
              {' '} · {' '}
              <a href="/privacy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>
              {' '} · {' '}
              <a href="/terms" className="text-[var(--color-primary)] hover:underline">Terms of Service</a>
              {' '} · {' '}
              <a href="/security" className="text-[var(--color-primary)] hover:underline">Security</a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}