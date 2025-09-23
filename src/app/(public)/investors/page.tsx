import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investors — IntelliVerseX",
  description: "Investment opportunities with IntelliVerseX. Learn about our Friends & Family funding round, growth metrics, and vision for AI-powered gaming.",
};

export default function InvestorsPage() {
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
        "name": "Investors",
        "item": "https://intelli-verse-x.ai/investors"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Investor Relations</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          IntelliVerseX is pioneering the intersection of AI, gaming, and commerce with transparent, 
          fair-play systems that empower creators and users alike.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Friends & Family Funding</h2>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Current Stage</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li><strong>Round:</strong> Friends & Family</li>
                  <li><strong>Stage:</strong> Early Growth</li>
                  <li><strong>Focus:</strong> Platform scaling & creator ecosystem</li>
                  <li><strong>Timeline:</strong> Ongoing</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Investment Highlights</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>✓ Integrated AI + Gaming + Commerce platform</li>
                  <li>✓ Transparent AI systems with bias mitigation</li>
                  <li>✓ Original IP development (Autocurio, Bytegeist)</li>
                  <li>✓ Fair-play technology with audit capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Use of Funds</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Platform Scale (40%)</h3>
              <p className="text-gray-300 text-sm">
                Infrastructure scaling, performance optimization, and global expansion of our 
                gaming arena and AI studio platforms to support millions of concurrent users.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Fairness Audits (25%)</h3>
              <p className="text-gray-300 text-sm">
                Third-party auditing systems, provable fairness infrastructure, and transparency 
                tools that allow users to verify game outcomes and AI decision-making processes.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Creator Ecosystem (35%)</h3>
              <p className="text-gray-300 text-sm">
                Partnership programs, creator tools, content monetization systems, and community 
                building initiatives to foster a thriving ecosystem of game developers and content creators.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Key Metrics to Watch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">User Engagement</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Monthly Active Users (MAU)</li>
                <li>• Average session duration</li>
                <li>• User retention rates (D1, D7, D30)</li>
                <li>• Cross-platform engagement</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Revenue & Growth</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Monthly Recurring Revenue (MRR)</li>
                <li>• Average Revenue Per User (ARPU)</li>
                <li>• Marketplace transaction volume</li>
                <li>• Creator partnership growth</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">AI & Fairness</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• AI transparency score</li>
                <li>• Bias detection metrics</li>
                <li>• Fair-play compliance rate</li>
                <li>• User trust indicators</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Platform Health</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• System uptime & performance</li>
                <li>• Security incident frequency</li>
                <li>• Customer satisfaction (NPS)</li>
                <li>• Developer adoption rate</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Market Opportunity</h2>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">$180B+</div>
                <p className="text-sm text-gray-300">Global Gaming Market</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">$150B+</div>
                <p className="text-sm text-gray-300">AI Market Opportunity</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">$6T+</div>
                <p className="text-sm text-gray-300">E-commerce Market</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mt-6 text-center">
              IntelliVerseX sits at the convergence of these three massive markets with unique 
              differentiation through AI transparency and fair-play systems.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <p className="text-gray-300 mb-4">
              Interested in learning more about investment opportunities? We&apos;d love to hear from you.
            </p>
            <p className="text-lg mb-2">
              <a 
                href="mailto:sales@intelli-verse-x.ai?subject=%5BInvestors%5D%20Investment%20Inquiry" 
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                sales@intelli-verse-x.ai
              </a>
            </p>
            <p className="text-sm text-gray-400">
              Subject line: [Investors] Investment Inquiry
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Disclaimers</h2>
          <div className="bg-red-50/10 border border-red-500/20 rounded-lg p-6">
            <p className="text-red-300 text-sm leading-relaxed">
              <strong>Forward-Looking Statement:</strong> This page contains forward-looking statements 
              regarding our business, financial condition, and results of operations. These statements 
              are based on current expectations and assumptions and are subject to risks and uncertainties. 
              Actual results may differ materially from those expressed or implied by these statements.
            </p>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          See also: {' '}
          <a href="/press" className="text-[var(--color-primary)] hover:underline">Press Kit</a>
          {' '} · {' '}
          <a href="/careers" className="text-[var(--color-primary)] hover:underline">Careers</a>
          {' '} · {' '}
          <a href="/about" className="text-[var(--color-primary)] hover:underline">About Us</a>
          {' '} · {' '}
          <a href="/contact" className="text-[var(--color-primary)] hover:underline">Contact</a>
        </p>
      </main>
    </>
  );
}