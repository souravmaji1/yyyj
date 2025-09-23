import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Responsible Gaming — IntelliVerseX",
  description: "Tools and policies that support healthy play.",
};

export default function ResponsibleGamingPage() {
  return (
    <PolicyLayout
      title="Responsible Gaming"
      subtitle="Play should be fun. We offer controls to set limits and take breaks."
    >
      <section>
        <h2>Player Controls</h2>
        <ul>
          <li>Session reminders/cooldowns</li>
          <li>Spend limits</li>
          <li>Self-exclusion/pauses</li>
        </ul>
      </section>

      <section>
        <h2>Under 18</h2>
        <p>
          We do not permit cash competitions for minors. Parents have access to additional tools for managing kid accounts.
        </p>
      </section>

      <section>
        <h2>Get help</h2>
        <p>
          If gaming is causing harm in your life, please seek local resources and hotlines in your area. Gaming should enhance your life, not detract from it.
        </p>
      </section>
    </PolicyLayout>
  );
}