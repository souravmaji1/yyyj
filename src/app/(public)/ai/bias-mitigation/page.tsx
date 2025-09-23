import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bias Mitigation — IntelliVerseX",
  description: "Our techniques and metrics for preventing and mitigating bias in AI systems across gaming, recommendations, and commerce.",
};

export default function BiasMitigationPage() {
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
        "name": "Bias Mitigation",
        "item": "https://intelli-verse-x.ai/ai/bias-mitigation"
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
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Bias Mitigation</h1>
        
        <p className="text-xl text-gray-200 mb-8">
          IntelliVerseX is committed to developing fair AI systems that serve all users equitably. 
          We employ comprehensive techniques to identify, measure, and mitigate bias throughout our AI pipeline.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Our Techniques</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Balanced Datasets</h3>
              <p className="text-gray-300 mb-3">
                We carefully curate training datasets to ensure representation across demographic groups, 
                gaming skill levels, and usage patterns. Data collection processes are designed to avoid 
                historical bias perpetuation.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Stratified sampling across user demographics</li>
                <li>• Geographic and cultural diversity in data sources</li>
                <li>• Skill level balancing in gaming datasets</li>
                <li>• Temporal sampling to avoid seasonal bias</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Counterfactual Data Augmentation</h3>
              <p className="text-gray-300 mb-3">
                We generate synthetic data that represents underrepresented groups and scenarios, 
                helping models learn fair representations across diverse situations.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Synthetic minority group examples</li>
                <li>• Edge case scenario generation</li>
                <li>• Cross-cultural content variations</li>
                <li>• Accessibility-focused test cases</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Fairness Constraints</h3>
              <p className="text-gray-300 mb-3">
                Mathematical constraints are built into our model training processes to enforce 
                fairness criteria and prevent discriminatory outcomes during optimization.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Equal opportunity constraints in matchmaking</li>
                <li>• Demographic parity in recommendation systems</li>
                <li>• Calibration across user groups</li>
                <li>• Treatment equality in content moderation</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Periodic Audits</h3>
              <p className="text-gray-300 mb-3">
                Regular systematic reviews of model performance across different user groups 
                to identify emerging bias and ensure continued fairness over time.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Monthly bias metric evaluations</li>
                <li>• Cross-group performance comparisons</li>
                <li>• User outcome analysis by demographics</li>
                <li>• Third-party fairness assessments</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Metrics We Track</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Demographic Parity</h3>
              <p className="text-gray-300 text-sm mb-3">
                Ensures equal positive prediction rates across demographic groups where applicable, 
                particularly in content recommendations and promotional offers.
              </p>
              <div className="text-xs text-gray-400">
                P(Ŷ = 1 | A = 0) = P(Ŷ = 1 | A = 1)
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Equalized Odds</h3>
              <p className="text-gray-300 text-sm mb-3">
                Critical for gaming contexts where we ensure equal true positive and false positive 
                rates across groups in anti-cheat and skill assessment systems.
              </p>
              <div className="text-xs text-gray-400">
                TPR and FPR equal across groups
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Calibration</h3>
              <p className="text-gray-300 text-sm mb-3">
                Ensures prediction confidence scores are equally meaningful across different user 
                groups, important for risk assessments and personalization.
              </p>
              <div className="text-xs text-gray-400">
                P(Y = 1 | Ŷ = s, A = a) consistent
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Individual Fairness</h3>
              <p className="text-gray-300 text-sm mb-3">
                Similar individuals receive similar treatment, preventing discrimination against 
                specific users while maintaining overall system fairness.
              </p>
              <div className="text-xs text-gray-400">
                Similar inputs → Similar outputs
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Domain-Specific Applications</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Gaming Matchmaking</h3>
              <p className="text-gray-300 mb-3">
                Our matchmaking algorithms ensure fair competition while avoiding bias based on 
                player demographics, preferred play styles, or spending patterns.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Skill-based matching independent of demographics</li>
                <li>• Equal wait times across user groups</li>
                <li>• Fair team composition algorithms</li>
                <li>• Preventing economic discrimination</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Content Recommendations</h3>
              <p className="text-gray-300 mb-3">
                Recommendation systems are designed to provide equal quality suggestions to all users 
                while respecting individual preferences and avoiding harmful stereotyping.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Diverse content exposure opportunities</li>
                <li>• Avoiding stereotype reinforcement</li>
                <li>• Equal recommendation quality metrics</li>
                <li>• Cultural sensitivity in suggestions</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Commerce & Pricing</h3>
              <p className="text-gray-300 mb-3">
                Our e-commerce AI ensures fair pricing, equal access to promotions, and unbiased 
                product recommendations across all user segments.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Consistent pricing policies</li>
                <li>• Equal promotion accessibility</li>
                <li>• Unbiased search and discovery</li>
                <li>• Fair fraud detection thresholds</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-3">Content Moderation</h3>
              <p className="text-gray-300 mb-3">
                Moderation systems apply consistent standards across all users while accounting for 
                cultural context and avoiding over-policing of minority communities.
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Equal enforcement across demographics</li>
                <li>• Cultural context awareness</li>
                <li>• Consistent appeal processes</li>
                <li>• Bias-aware escalation procedures</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-6">Monitoring & Response</h2>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Continuous Monitoring System</h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-white">Real-time Alerts:</strong> Automated monitoring 
                triggers immediate alerts when bias metrics exceed acceptable thresholds, 
                enabling rapid response to emerging issues.
              </div>
              <div>
                <strong className="text-white">User Feedback Integration:</strong> Community 
                reports of unfair treatment are systematically analyzed and incorporated 
                into bias detection and mitigation processes.
              </div>
              <div>
                <strong className="text-white">Regular Reporting:</strong> Monthly bias reports 
                are generated for internal review and quarterly summaries are shared with 
                external auditors and ethics boards.
              </div>
              <div>
                <strong className="text-white">Mitigation Actions:</strong> When bias is detected, 
                we implement immediate corrective measures including model retraining, 
                constraint adjustment, and user communication.
              </div>
            </div>
          </div>
        </section>

        <hr className="border-white/10 my-8" />
        
        <p className="text-sm text-gray-400 text-center">
          Related: {' '}
          <a href="/ai/ethics" className="text-[var(--color-primary)] hover:underline">AI Ethics</a>
          {' '} · {' '}
          <a href="/ai/models" className="text-[var(--color-primary)] hover:underline">AI Models</a>
          {' '} · {' '}
          <a href="/ai/training-data" className="text-[var(--color-primary)] hover:underline">Training Data</a>
          {' '} · {' '}
          <a href="/ai/safety" className="text-[var(--color-primary)] hover:underline">AI Safety</a>
        </p>
      </main>
    </>
  );
}