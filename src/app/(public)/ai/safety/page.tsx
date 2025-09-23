import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";
import { CTACard } from "@/components/CTACard";

export const metadata: Metadata = {
  title: "AI Safety — IntelliVerseX",
  description: "Our approach to model safety, testing, and user protection.",
};

export default function AISafetyPage() {
  const aside = (
    <div>
      {/* Report an issue card */}
      <CTACard
        title="Report an issue"
        description="Need to report a safety concern? Contact our safety team."
        actionHref="/security"
        actionLabel="Contact Safety"
      />

      {/* Docs card */}
      <CTACard
        title="Docs"
        description="Learn more about our safety practices:"
      />
      <div className="mb-6 -mt-4">
        <ul className="text-white/70 space-y-2 text-sm pl-6">
          <li>• <a href="/fairness/responsible-gaming" className="text-brand-600 hover:text-brand-700 underline">Responsible Gaming</a></li>
          <li>• <a href="/fairness/verification" className="text-brand-600 hover:text-brand-700 underline">Verification</a></li>
        </ul>
      </div>
    </div>
  );

  return (
    <PolicyLayout
      title="AI Safety"
      subtitle="Layered defenses to keep gameplay, content, and commerce safe."
      aside={aside}
    >
      <section>
        <h2>Safety Layers</h2>
        <ul>
          <li>Multi-stage filtering</li>
          <li>Tuned refusals</li>
          <li>Red-team & eval harness</li>
          <li>Incident response</li>
        </ul>
      </section>

      <section>
        <h2>Child Safety</h2>
        <p>
          We maintain heightened filters and disallow adult themes targeting minors. Our systems are designed to protect younger users with additional safeguards and content restrictions.
        </p>
      </section>

      <section>
        <h2>Transparency</h2>
        <p>
          We are committed to summarizing major safety updates and sharing our approach to keeping the platform safe for all users.
        </p>
      </section>
    </PolicyLayout>
  );
}