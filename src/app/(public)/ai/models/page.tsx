import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Models — IntelliVerseX",
  description: "Information about AI models used in IntelliVerseX platform including LLMs, recommendation systems, and anti-cheat models.",
};

export default function AIModelsPage() {
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
        "name": "AI Models",
        "item": "https://intelli-verse-x.ai/ai/models"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">AI Models</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          IntelliVerseX employs various AI model types to power gaming experiences, content recommendations, 
          and fair-play systems. Here&apos;s an overview of our approach to AI model development and deployment.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Model Types</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Large Language Models (LLMs)</h3>
              <p className="text-gray-300 mb-3">
                We use fine-tuned language models for content generation, player assistance, and interactive 
                storytelling within games. These models are trained with safety guardrails and content filters.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• In-game dialogue and narrative generation</li>
                <li>• Player support and FAQ automation</li>
                <li>• Content moderation and safety filtering</li>
                <li>• Multi-language support and translation</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Recommendation Systems</h3>
              <p className="text-gray-300 mb-3">
                Collaborative and content-based filtering models personalize game suggestions, 
                marketplace items, and social connections while avoiding filter bubbles.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Game and content recommendations</li>
                <li>• Marketplace item suggestions</li>
                <li>• Social matching and friend discovery</li>
                <li>• Advertising relevance optimization</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Anti-Cheat Models</h3>
              <p className="text-gray-300 mb-3">
                Machine learning models detect anomalous player behavior, identify potential cheating, 
                and maintain fair gameplay across all gaming experiences.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Behavioral anomaly detection</li>
                <li>• Bot and automation identification</li>
                <li>• Statistical performance analysis</li>
                <li>• Real-time gameplay monitoring</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Serving Approach</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Infrastructure</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Cloud-native deployment on multiple regions</li>
                <li>• Auto-scaling based on demand</li>
                <li>• Load balancing and redundancy</li>
                <li>• Edge computing for low-latency inference</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Performance</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• &lt; 100ms response time for real-time features</li>
                <li>• Model quantization for efficiency</li>
                <li>• Caching for frequently requested predictions</li>
                <li>• Graceful degradation during outages</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Evaluation Cadence</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Continuous Improvement Process</h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-white">Weekly:</strong> Performance metrics review, 
                user feedback analysis, and minor parameter adjustments.
              </div>
              <div>
                <strong className="text-white">Monthly:</strong> Comprehensive model evaluation, 
                A/B testing of new versions, and bias audit assessments.
              </div>
              <div>
                <strong className="text-white">Quarterly:</strong> Major model updates, 
                retraining with new data, and architecture improvements.
              </div>
            </div>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          Related: {' '}
          <a href="/ai/ethics" className="text-[var(--color-primary)] hover:underline">AI Ethics</a>
          {' '} · {' '}
          <a href="/ai/bias-mitigation" className="text-[var(--color-primary)] hover:underline">Bias Mitigation</a>
          {' '} · {' '}
          <a href="/ai/training-data" className="text-[var(--color-primary)] hover:underline">Training Data</a>
          {' '} · {' '}
          <a href="/ai/safety" className="text-[var(--color-primary)] hover:underline">AI Safety</a>
        </p>
      </main>
    </>
  );
}