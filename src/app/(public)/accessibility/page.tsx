import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Accessibility — IntelliVerseX",
  description: "Our commitment to an accessible experience for everyone.",
};

export default function AccessibilityPage() {
  return (
    <PolicyLayout
      title="Accessibility"
      subtitle="We aim to meet WCAG 2.2 AA across our experiences."
    >
      <section>
        <h2>Practices</h2>
        <ul>
          <li>Keyboard/screen reader</li>
          <li>High-contrast & captions</li>
          <li>Text scaling & reduce motion</li>
        </ul>
      </section>

      <section>
        <h2>Feedback</h2>
        <p>
          We welcome feedback on accessibility improvements. Please email{" "}
          <a 
            href="mailto:accessibility@intelli-verse-x.ai"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            accessibility@intelli-verse-x.ai
          </a>{" "}
          with your suggestions or concerns.
        </p>
      </section>
    </PolicyLayout>
  );
}