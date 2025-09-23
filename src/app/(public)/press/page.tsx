import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press Kit — IntelliVerseX",
  description: "Press resources, brand assets, and media contacts for IntelliVerseX - the AI-powered gaming and commerce platform.",
};

export default function PressPage() {
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
        "name": "Press Kit",
        "item": "https://intelli-verse-x.ai/press"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Press Kit</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          IntelliVerseX combines AI, gaming, and commerce to build fair, transparent experiences across devices and kiosks. 
          We&apos;re pioneering the next generation of AI-powered entertainment with original IP including Autocurio and Bytegeist, 
          plus tokenized and fair-play systems.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Brand Assets</h2>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  aria-disabled="true" 
                  className="text-[var(--color-primary)] hover:underline cursor-not-allowed opacity-60"
                >
                  Primary logo (SVG)
                </a>
                <span className="text-sm text-gray-400 ml-2">— Coming soon</span>
              </li>
              <li>
                <a 
                  href="#" 
                  aria-disabled="true" 
                  className="text-[var(--color-primary)] hover:underline cursor-not-allowed opacity-60"
                >
                  Monochrome logo (SVG)
                </a>
                <span className="text-sm text-gray-400 ml-2">— Coming soon</span>
              </li>
              <li>
                <a 
                  href="#" 
                  aria-disabled="true" 
                  className="text-[var(--color-primary)] hover:underline cursor-not-allowed opacity-60"
                >
                  Brand guidelines (PDF)
                </a>
                <span className="text-sm text-gray-400 ml-2">— Coming soon</span>
              </li>
              <li>
                <a 
                  href="#" 
                  aria-disabled="true" 
                  className="text-[var(--color-primary)] hover:underline cursor-not-allowed opacity-60"
                >
                  Product screenshots (ZIP)
                </a>
                <span className="text-sm text-gray-400 ml-2">— Coming soon</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Executive Quotes</h2>
          <div className="space-y-6">
            <blockquote className="bg-white/5 rounded-lg p-6 border border-white/10 border-l-4 border-l-[var(--color-primary)]">
              <p className="text-gray-300 mb-3">
                &quot;We&apos;re not just building games—we&apos;re creating a new paradigm where AI transparency, 
                fair play, and user empowerment are fundamental design principles, not afterthoughts.&quot;
              </p>
              <cite className="text-[var(--color-primary)] font-medium">
                — CEO, IntelliVerseX
              </cite>
            </blockquote>
            
            <blockquote className="bg-white/5 rounded-lg p-6 border border-white/10 border-l-4 border-l-[var(--color-primary)]">
              <p className="text-gray-300 mb-3">
                &quot;Our AI systems are designed with fairness and transparency at their core. Every algorithm, 
                every recommendation, every game outcome can be audited and understood by our users.&quot;
              </p>
              <cite className="text-[var(--color-primary)] font-medium">
                — CTO, IntelliVerseX
              </cite>
            </blockquote>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Media Contact</h2>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <p className="text-gray-300 mb-4">
              For interviews, product demos, and additional assets, please contact our media team:
            </p>
            <p className="text-lg">
              <a 
                href="mailto:sales@intelli-verse-x.ai?subject=%5BPress%5D%20Media%20Request" 
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                sales@intelli-verse-x.ai
              </a>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Subject line: [Press] Media Request
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Key Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li><strong>Founded:</strong> 2024</li>
                <li><strong>Headquarters:</strong> San Francisco, CA</li>
                <li><strong>Stage:</strong> Early Growth</li>
                <li><strong>Focus:</strong> AI Gaming & Commerce</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Platform</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li><strong>Products:</strong> Gaming Arena, AI Studio, Marketplace</li>
                <li><strong>Original IP:</strong> Autocurio, Bytegeist</li>
                <li><strong>Technology:</strong> AI/ML, Blockchain, Fair-play Systems</li>
                <li><strong>Integration:</strong> Headless Shopify</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Milestones</h2>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <ul className="text-gray-300 space-y-3">
              <li>
                <strong className="text-white">Platform Launch:</strong> Successfully launched integrated gaming and commerce platform
              </li>
              <li>
                <strong className="text-white">AI Transparency Initiative:</strong> Implemented comprehensive AI ethics and bias mitigation frameworks
              </li>
              <li>
                <strong className="text-white">Fair Play Systems:</strong> Developed provable fairness algorithms with third-party audit capabilities
              </li>
              <li>
                <strong className="text-white">Roadmap:</strong> Expanding creator partnerships and implementing advanced tokenization features
              </li>
            </ul>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          See also: {' '}
          <a href="/ai/ethics" className="text-[var(--color-primary)] hover:underline">AI Ethics</a>
          {' '} · {' '}
          <a href="/investors" className="text-[var(--color-primary)] hover:underline">Investors</a>
          {' '} · {' '}
          <a href="/blogs" className="text-[var(--color-primary)] hover:underline">Blog</a>
          {' '} · {' '}
          <a href="/about" className="text-[var(--color-primary)] hover:underline">About Us</a>
        </p>
      </main>
    </>
  );
}