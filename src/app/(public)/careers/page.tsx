import type { Metadata } from "next";
import { CareerInterestForm } from "@/src/components/forms/CareerInterestForm";

export const metadata: Metadata = {
  title: "Careers — IntelliVerseX",
  description: "Join IntelliVerseX and help build the future of AI-powered gaming and commerce. Explore career opportunities with our innovative team.",
};

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-6">
            Careers at IntelliVerseX
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Join our mission to revolutionize gaming and commerce through AI innovation, blockchain technology, and fair-play systems.
          </p>
        </header>

        {/* Why IntelliVerseX Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-white mb-6">Why IntelliVerseX?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Innovation First</h3>
              <p className="text-gray-300">
                Work on cutting-edge AI systems, blockchain integration, and gaming technologies that are shaping the future of digital entertainment and commerce.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Meaningful Impact</h3>
              <p className="text-gray-300">
                Build products that millions of users interact with daily. Your work directly contributes to fair, transparent, and rewarding gaming experiences.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Growth & Learning</h3>
              <p className="text-gray-300">
                Continuous learning opportunities with conference budgets, internal tech talks, and mentorship programs. We invest in your professional development.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Remote-First Culture</h3>
              <p className="text-gray-300">
                Work from anywhere with flexible hours. We focus on results, not location. Quarterly team meetups foster collaboration and connection.
              </p>
            </div>
          </div>
        </section>

        {/* Teams Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-white mb-6">Our Teams</h2>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Engineering</h3>
              <p className="text-gray-300 mb-3">
                Full-stack development, AI/ML systems, blockchain integration, and platform infrastructure. We use modern tech stacks including React, Node.js, Python, and cloud-native architectures.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Frontend</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Backend</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">AI/ML</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">DevOps</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Security</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Game Design</h3>
              <p className="text-gray-300 mb-3">
                Create engaging gaming experiences with fair-play mechanics, balanced economies, and innovative gameplay systems that integrate AI and blockchain technology.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Game Design</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Economy Design</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">UX/UI</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">AI Research</h3>
              <p className="text-gray-300 mb-3">
                Research and develop AI systems for personalization, fairness, anti-cheat detection, and content generation. Focus on ethical AI and bias mitigation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Research</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Data Science</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Ethics</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Creator Partnerships</h3>
              <p className="text-gray-300 mb-3">
                Build relationships with content creators, streamers, and gaming influencers. Develop partnership programs and creator monetization tools.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Business Development</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Community</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Marketing</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Operations</h3>
              <p className="text-gray-300 mb-3">
                Keep our platform running smoothly with finance, legal, people operations, and customer success. Support our growing team and user base.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Finance</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Legal</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">People Ops</span>
                <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm rounded-full">Customer Success</span>
              </div>
            </div>
          </div>
        </section>

        {/* How We Hire Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-white mb-6">How We Hire</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Application Review</h3>
              <p className="text-gray-300 text-sm">
                We review all applications carefully. If there&apos;s a potential fit, we&apos;ll reach out within a week.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Conversation</h3>
              <p className="text-gray-300 text-sm">
                Informal chat with the hiring manager to discuss your background and learn about the role.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[var(--color-primary)]">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Skills Assessment</h3>
              <p className="text-gray-300 text-sm">
                Role-specific interview or practical exercise. We respect your time and keep this focused.
              </p>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="bg-white/5 rounded-lg p-8 border border-white/10">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center">Apply Now</h2>
          <p className="text-gray-300 text-center mb-8">
            Interested in joining our team? Submit your application below and we&apos;ll get back to you soon.
          </p>
          <CareerInterestForm />
        </section>

        {/* Cross-links */}
        <footer className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-gray-400 text-center">
            Learn more about us: {' '}
            <a href="/about" className="text-[var(--color-primary)] hover:underline">About IntelliVerseX</a>
            {' '} · {' '}
            <a href="/ai/ethics" className="text-[var(--color-primary)] hover:underline">AI Ethics</a>
            {' '} · {' '}
            <a href="/investors" className="text-[var(--color-primary)] hover:underline">Investors</a>
            {' '} · {' '}
            <a href="/contact" className="text-[var(--color-primary)] hover:underline">Contact Us</a>
          </p>
        </footer>
      </div>
    </main>
  );
}