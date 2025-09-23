import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";
import { CTACard } from "@/components/CTACard";

export const metadata: Metadata = {
  title: "Privacy Dashboard — IntelliVerseX",
  description: "Manage data, preferences, and privacy choices for IntelliVerseX.",
};

export default function PrivacyDashboardPage() {
  const aside = (
    <div>
      <CTACard
        title="Export your data"
        description="Request a copy of your data in a portable format."
        actionHref="/data/export"
        actionLabel="Start export"
      />

      <CTACard
        title="Delete data"
        description="Request deletion of personal data from IntelliVerseX."
        actionHref="/data/delete"
        actionLabel="Request deletion"
      />

      <CTACard
        title="Cookie preferences"
        description="Choose how cookies are used for your experience."
        actionHref="/cookies/preferences"
        actionLabel="Open cookie settings"
      />
    </div>
  );

  return (
    <PolicyLayout
      title="Privacy Dashboard"
      subtitle="Review what we store about your account and control how it's used."
      aside={aside}
    >
      <section>
        <h2>Your Data Summary</h2>
        <ul>
          <li>Account & profile</li>
          <li>Game progress</li>
          <li>Purchases</li>
          <li>Support</li>
          <li>Security events</li>
        </ul>
      </section>

      <section>
        <h2>Choices</h2>
        <ul>
          <li>Opt out of targeted ads</li>
          <li>Do not sell/share</li>
          <li>Limit sensitive PI</li>
          <li>Training data opt-in/out</li>
        </ul>
      </section>
    </PolicyLayout>
  );
}