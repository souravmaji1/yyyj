import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";
import { CTACard } from "@/components/CTACard";

export const metadata: Metadata = {
  title: "AI Training Data — IntelliVerseX",
  description: "How IntelliVerseX collects, curates, and governs data used to train and evaluate AI systems.",
};

export default function AITrainingDataPage() {
  const aside = (
    <div>
      {/* At a glance card */}
      <CTACard
        title="At a glance"
        description="Key points about our AI training approach:"
      />
      <div className="mb-6 -mt-4">
        <ul className="text-white/70 space-y-2 text-sm pl-6">
          <li>• We favor synthetic and partner-licensed datasets.</li>
          <li>• Personal content is <strong>excluded</strong> by default from training unless you opt in.</li>
          <li>• Strict dataset governance, provenance, and bias audits.</li>
        </ul>
      </div>

      {/* Your controls card */}
      <CTACard
        title="Your controls"
        description="Manage your data and preferences:"
      />
      <div className="mb-6 -mt-4">
        <ul className="text-white/70 space-y-2 text-sm pl-6">
          <li>• <a href="/privacy/dashboard" className="text-brand-600 hover:text-brand-700 underline">Privacy Dashboard</a></li>
          <li>• <a href="/privacy/choices" className="text-brand-600 hover:text-brand-700 underline">Privacy Choices</a></li>
          <li>• <a href="/data/export" className="text-brand-600 hover:text-brand-700 underline">Data Export</a></li>
          <li>• <a href="/data/delete" className="text-brand-600 hover:text-brand-700 underline">Data Delete</a></li>
        </ul>
      </div>
    </div>
  );

  return (
    <PolicyLayout
      title="AI Training Data"
      subtitle="How and when your data helps us improve IntelliVerseX AI — with choice and transparency."
      aside={aside}
    >
      <section>
        <h2>Sources</h2>
        <p>
          We collect training data from multiple sources to improve our AI systems while respecting privacy and consent:
        </p>
        <ul>
          <li>Opt-in user content</li>
          <li>Synthetic data</li>
          <li>Licensed media</li>
          <li>Public web data (permitted)</li>
        </ul>
      </section>

      <section>
        <h2>Exclusions</h2>
        <p>
          We never train on private messages, payments data, government IDs, precise location, children's data.
        </p>
      </section>

      <section>
        <h2>Dataset Governance</h2>
        <p>
          Our approach includes provenance tracking; bias checks; red-team seeding; retention limits (raw logs ≤ 18 months; snapshots with TTL & re-audit).
        </p>
      </section>

      <section>
        <h2>How to Opt Out/In</h2>
        <p>
          You can control how your data is used for training by visiting your <a href="/privacy/choices" className="text-brand-600 hover:text-brand-700 underline">Privacy Choices</a> page.
        </p>
      </section>
    </PolicyLayout>
  );
}