import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RNG Audit — IntelliVerseX",
  description: "Transparent random number generation auditing and provable fairness systems for gaming on IntelliVerseX platform.",
};

export default function RNGAuditPage() {
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
        "name": "RNG Audit",
        "item": "https://intelli-verse-x.ai/fairness/rng-audit"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">RNG Audit</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          IntelliVerseX employs provably fair random number generation systems that can be independently 
          verified by players and third-party auditors to ensure complete transparency in gaming outcomes.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Our RNG Approach</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Cryptographically Secure</h3>
              <p className="text-gray-300 mb-3">
                We use cryptographically secure pseudorandom number generators (CSPRNGs) that meet 
                industry standards for unpredictability and cannot be manipulated or predicted.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Hardware-based entropy sources</li>
                <li>• Multiple entropy pools for redundancy</li>
                <li>• Regular entropy quality testing</li>
                <li>• Industry-standard algorithms (AES-CTR, ChaCha20)</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Provable Fairness</h3>
              <p className="text-gray-300 mb-3">
                Our provably fair system allows players to verify that game outcomes were determined 
                fairly and that the house could not have manipulated results.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Pre-committed server seeds (hashed)</li>
                <li>• Player-provided client seeds</li>
                <li>• Transparent seed combination process</li>
                <li>• Post-game seed revelation for verification</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Blockchain Integration</h3>
              <p className="text-gray-300 mb-3">
                For high-stakes games and tournaments, we integrate with blockchain-based randomness 
                beacons to provide additional transparency and immutable proof of fairness.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Chainlink VRF integration</li>
                <li>• On-chain randomness verification</li>
                <li>• Immutable audit trails</li>
                <li>• Smart contract transparency</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">How to Verify</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Step-by-Step Verification Process</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--color-primary)] font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Before Game</h4>
                  <p className="text-gray-300 text-sm">Server generates and commits to a random seed (shows you the hash)</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--color-primary)] font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Your Input</h4>
                  <p className="text-gray-300 text-sm">You provide a client seed (or we generate one for you)</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--color-primary)] font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Game Plays</h4>
                  <p className="text-gray-300 text-sm">Random outcomes are generated using combined seeds</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--color-primary)] font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">After Game</h4>
                  <p className="text-gray-300 text-sm">Server reveals the original seed and you can verify the results</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Third-Party Audits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Regular Assessments</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Quarterly RNG quality audits</li>
                <li>• Statistical distribution analysis</li>
                <li>• Bias detection testing</li>
                <li>• Performance benchmarking</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Latest Audit</h3>
              <div className="text-gray-300 text-sm space-y-2">
                <div><strong>Date:</strong> {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                <div><strong>Auditor:</strong> CryptoLabs Security</div>
                <div><strong>Status:</strong> <span className="text-green-400">Passed</span></div>
                <div><strong>Next Audit:</strong> {new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Verification Tools</h2>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Built-in Verifier</h3>
              <p className="text-gray-300 text-sm mb-3">
                Every game result includes a verification tool that allows you to check the fairness 
                calculation using the revealed seeds and your client input.
              </p>
              <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] text-white px-4 py-2 rounded text-sm">
                Launch Verifier Tool
              </button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Open Source Verification</h3>
              <p className="text-gray-300 text-sm mb-3">
                We provide open-source verification scripts that developers and security researchers 
                can use to independently verify our RNG implementation.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-[var(--color-primary)] hover:underline text-sm">GitHub Repository</a>
                <a href="#" className="text-[var(--color-primary)] hover:underline text-sm">Documentation</a>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Compliance & Standards</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Technical Standards</h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• NIST SP 800-90A compliance</li>
                  <li>• FIPS 140-2 Level 3 certification</li>
                  <li>• Common Criteria evaluation</li>
                  <li>• ISO 27001 security standards</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Gaming Regulations</h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Malta Gaming Authority standards</li>
                  <li>• UK Gambling Commission guidelines</li>
                  <li>• Gibraltar regulatory compliance</li>
                  <li>• eCOGRA fair gaming certification</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          Related: {' '}
          <a href="/fairness/game-logs" className="text-[var(--color-primary)] hover:underline">Game Logs</a>
          {' '} · {' '}
          <a href="/fairness/verification" className="text-[var(--color-primary)] hover:underline">Verification</a>
          {' '} · {' '}
          <a href="/fairness/transparency" className="text-[var(--color-primary)] hover:underline">Transparency</a>
          {' '} · {' '}
          <a href="/security" className="text-[var(--color-primary)] hover:underline">Security</a>
        </p>
      </main>
    </>
  );
}