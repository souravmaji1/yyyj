import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Ethics — IntelliVerseX",
  description: "Our commitment to ethical AI development, governance frameworks, and responsible AI practices in gaming and commerce.",
};

export default function AIEthicsPage() {
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
        "name": "AI Ethics",
        "item": "https://intelli-verse-x.ai/ai/ethics"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">AI Ethics</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          At IntelliVerseX, ethical AI isn&apos;t just a policy—it&apos;s fundamental to how we design, 
          develop, and deploy AI systems that power gaming experiences and commerce interactions.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Our Principles</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Safety-First</h3>
              <p className="text-gray-300">
                Every AI system undergoes rigorous safety testing before deployment. We implement 
                multiple layers of protection including content filtering, adversarial testing, 
                and human oversight to prevent harmful outputs or behaviors.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">User Agency</h3>
              <p className="text-gray-300">
                Users maintain control over their AI interactions. We provide clear opt-out mechanisms, 
                transparency tools, and the ability to understand and influence AI recommendations. 
                No AI system makes irreversible decisions without user consent.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Transparency</h3>
              <p className="text-gray-300">
                We commit to explainable AI wherever possible. Users can access information about 
                how AI decisions affect them, what data influences recommendations, and how to 
                appeal or modify AI-driven outcomes.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Non-Discrimination</h3>
              <p className="text-gray-300">
                Our AI systems are designed and audited to avoid unfair bias. We actively test 
                for discrimination across protected characteristics and implement fairness 
                constraints in gaming matchmaking, content recommendations, and commerce experiences.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Data Minimization</h3>
              <p className="text-gray-300">
                We collect and use only the data necessary for AI systems to function effectively. 
                Personal data is anonymized where possible, and we implement privacy-preserving 
                techniques like differential privacy and federated learning.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Governance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Internal Reviews</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Ethics review for all new AI features</li>
                <li>• Cross-functional team assessments</li>
                <li>• Regular bias and fairness audits</li>
                <li>• User impact evaluations</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Red-Teaming</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Adversarial testing of AI systems</li>
                <li>• Edge case scenario evaluation</li>
                <li>• Security vulnerability assessment</li>
                <li>• Misuse potential analysis</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Incident Response</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• 24/7 AI behavior monitoring</li>
                <li>• Rapid response to harmful outputs</li>
                <li>• User reporting mechanisms</li>
                <li>• Post-incident learning and improvement</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">External Oversight</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Third-party ethics assessments</li>
                <li>• Academic research partnerships</li>
                <li>• Industry standard compliance</li>
                <li>• Regulatory alignment</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Implementation</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">How We Put Ethics Into Practice</h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-white">Gaming AI:</strong> Our matchmaking algorithms balance 
                competitive fairness with player enjoyment, avoiding exploitation of psychological 
                vulnerabilities while maintaining engaging gameplay.
              </div>
              <div>
                <strong className="text-white">Content Moderation:</strong> AI systems flag potentially 
                harmful content while preserving free expression, with human reviewers handling 
                edge cases and appeals.
              </div>
              <div>
                <strong className="text-white">Personalization:</strong> Recommendation systems prioritize 
                user value over engagement metrics, avoiding addictive design patterns and filter 
                bubble creation.
              </div>
              <div>
                <strong className="text-white">Commerce AI:</strong> Pricing and promotion algorithms 
                ensure fairness across user segments and comply with consumer protection standards.
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Continuous Improvement</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <p className="text-gray-300 mb-4">
              AI ethics is an evolving field, and our practices evolve with it. We regularly update 
              our frameworks based on:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• User feedback and community input</li>
              <li>• Academic research and industry best practices</li>
              <li>• Regulatory developments and policy changes</li>
              <li>• Internal learning from incidents and edge cases</li>
              <li>• Technological advances in AI safety and fairness</li>
            </ul>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          Related: {' '}
          <a href="/ai/models" className="text-[var(--color-primary)] hover:underline">AI Models</a>
          {' '} · {' '}
          <a href="/ai/bias-mitigation" className="text-[var(--color-primary)] hover:underline">Bias Mitigation</a>
          {' '} · {' '}
          <a href="/ai/safety" className="text-[var(--color-primary)] hover:underline">AI Safety</a>
          {' '} · {' '}
          <a href="/ai/training-data" className="text-[var(--color-primary)] hover:underline">Training Data</a>
        </p>
      </main>
    </>
  );
}