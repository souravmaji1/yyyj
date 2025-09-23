import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Choices — IntelliVerseX",
  description: "Exercise your rights under applicable privacy laws.",
};

export default function PrivacyChoicesPage() {
  return (
    <PolicyLayout
      title="Your Privacy Choices"
      subtitle="Opt-out of sale/sharing, limit sensitive data use, and control model training usage."
    >
      <section>
        <h2>US State Privacy Rights</h2>
        <p>If you're a resident of certain US states, you have specific privacy rights:</p>
        <ul>
          <li><a href="#" className="text-brand-600 hover:text-brand-700 underline">Do Not Sell/Share (stub)</a></li>
          <li><a href="#" className="text-brand-600 hover:text-brand-700 underline">Limit Sensitive PI (stub)</a></li>
          <li><a href="#" className="text-brand-600 hover:text-brand-700 underline">Right to Correct (stub)</a></li>
        </ul>
      </section>

      <section>
        <h2>Global Choices</h2>
        <p>All users have access to these privacy controls:</p>
        <ul>
          <li><a href="/data/export" className="text-brand-600 hover:text-brand-700 underline">Export your data</a></li>
          <li><a href="/data/delete" className="text-brand-600 hover:text-brand-700 underline">Delete your data</a></li>
        </ul>
      </section>

      <section>
        <h2>Training Data</h2>
        <p>
          Personal content is off by default for personal accounts. You can control whether your data is used for AI training through your privacy settings.
        </p>
      </section>
    </PolicyLayout>
  );
}