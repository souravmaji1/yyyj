import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fair Play Transparency — IntelliVerseX",
  description: "Our commitment to transparency and fairness in gaming. Learn about our fairness philosophy, policies, and transparency initiatives.",
};

export default function TransparencyPage() {
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
        "name": "Fair Play Transparency",
        "item": "https://intelli-verse-x.ai/fairness/transparency"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Fair Play Transparency</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          Transparency is fundamental to our fairness philosophy at IntelliVerseX. We believe players 
          have the right to understand how games work, verify outcomes, and trust in the integrity of our platform.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Our Fairness Philosophy</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Transparency First</h3>
              <p className="text-gray-300">
                Every aspect of our gaming systems that affects fairness is open to inspection. 
                We provide detailed explanations of algorithms, publish audit results, and offer 
                verification tools so players can independently confirm fair play.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Verifiable Outcomes</h3>
              <p className="text-gray-300">
                All game results can be independently verified using cryptographic proofs. 
                We implement provably fair systems where mathematically impossible for us to 
                manipulate outcomes without detection.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Player Empowerment</h3>
              <p className="text-gray-300">
                Players have access to their complete gaming history, performance analytics, 
                and the tools needed to verify fair treatment. We provide education and support 
                to help players understand and use these transparency features.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Continuous Improvement</h3>
              <p className="text-gray-300">
                We regularly update our fairness systems based on community feedback, security research, 
                and advances in cryptographic technology. All changes are documented and communicated clearly.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Transparency Initiatives</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">
                <a href="/fairness/rng-audit" className="text-[var(--color-primary)] hover:underline">
                  RNG Auditing
                </a>
              </h3>
              <p className="text-gray-300 text-sm">
                Regular third-party audits of our random number generation systems with 
                published results and verification tools for players.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">
                <a href="/fairness/game-logs" className="text-[var(--color-primary)] hover:underline">
                  Game Logging
                </a>
              </h3>
              <p className="text-gray-300 text-sm">
                Comprehensive logging of match outcomes and anti-cheat flags with 
                privacy-preserving aggregates available to users.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">
                <a href="/fairness/verification" className="text-[var(--color-primary)] hover:underline">
                  Result Verification
                </a>
              </h3>
              <p className="text-gray-300 text-sm">
                Tools and processes for users to verify game outcomes, contest results, 
                and validate anti-cheat system decisions.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">
                <a href="/ai/ethics" className="text-[var(--color-primary)] hover:underline">
                  AI Transparency
                </a>
              </h3>
              <p className="text-gray-300 text-sm">
                Open documentation of our AI systems, bias mitigation efforts, 
                and algorithmic decision-making processes.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Fairness Policy Framework</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Current Policy Version: 2.1</h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-white">Core Principles:</strong> All players deserve equal 
                treatment, fair chances to win, and complete transparency about how games operate. 
                No hidden advantages or manipulated outcomes.
              </div>
              <div>
                <strong className="text-white">Technical Implementation:</strong> Cryptographically 
                secure random number generation, provable fairness protocols, and comprehensive 
                audit trails for all gaming activities.
              </div>
              <div>
                <strong className="text-white">Player Rights:</strong> Access to personal gaming data, 
                verification tools, appeal processes, and clear explanations of any enforcement actions.
              </div>
              <div>
                <strong className="text-white">Continuous Monitoring:</strong> Real-time fairness 
                monitoring, regular policy reviews, and prompt response to community concerns 
                about fairness or transparency.
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Public Accountability</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Regular Reports</h3>
              <p className="text-gray-300 mb-3">
                We publish quarterly transparency reports covering fairness metrics, audit results, 
                and community feedback responses.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Latest Report: Q4 2024 Transparency Report</div>
                <div>• Next Report: Q1 2025 (due March 31st)</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Community Feedback</h3>
              <p className="text-gray-300 mb-3">
                We actively seek and respond to community input on fairness policies, 
                transparency initiatives, and platform improvements.
              </p>
              <div className="flex gap-3">
                <a href="/contact" className="text-[var(--color-primary)] hover:underline text-sm">Submit Feedback</a>
                <a href="#" className="text-[var(--color-primary)] hover:underline text-sm">Community Forum</a>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Open Source Components</h3>
              <p className="text-gray-300 mb-3">
                Key fairness-related code components are open source, allowing security researchers 
                and developers to review and validate our implementations.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-[var(--color-primary)] hover:underline text-sm">GitHub Repository</a>
                <a href="#" className="text-[var(--color-primary)] hover:underline text-sm">Security Research</a>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Player Education</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Understanding Fair Play</h3>
            <div className="space-y-3">
              <div className="text-gray-300 text-sm">
                <strong>What is Provable Fairness?</strong> A cryptographic method that allows 
                you to verify that game outcomes weren&apos;t manipulated after you placed your bet 
                or made your move.
              </div>
              <div className="text-gray-300 text-sm">
                <strong>How to Verify Results:</strong> Every game provides verification data 
                including seeds, hashes, and calculation methods. Use our tools or third-party 
                verifiers to check fairness.
              </div>
              <div className="text-gray-300 text-sm">
                <strong>When to Report Concerns:</strong> If you notice unusual patterns, 
                experience technical issues affecting gameplay, or have questions about 
                specific results, contact our fairness team.
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Get Involved</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Fairness Advisory Board</h3>
              <p className="text-gray-300 text-sm mb-3">
                Join our community advisory board to help shape fairness policies and 
                review transparency initiatives.
              </p>
              <a href="/contact" className="text-[var(--color-primary)] hover:underline text-sm">Apply to Join</a>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Security Research</h3>
              <p className="text-gray-300 text-sm mb-3">
                Help us improve by participating in our responsible disclosure program 
                for fairness and security issues.
              </p>
              <a href="/security" className="text-[var(--color-primary)] hover:underline text-sm">Learn More</a>
            </div>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          Related: {' '}
          <a href="/fairness/rng-audit" className="text-[var(--color-primary)] hover:underline">RNG Audit</a>
          {' '} · {' '}
          <a href="/fairness/game-logs" className="text-[var(--color-primary)] hover:underline">Game Logs</a>
          {' '} · {' '}
          <a href="/fairness/verification" className="text-[var(--color-primary)] hover:underline">Verification</a>
          {' '} · {' '}
          <a href="/fairness/responsible-gaming" className="text-[var(--color-primary)] hover:underline">Responsible Gaming</a>
        </p>
      </main>
    </>
  );
}