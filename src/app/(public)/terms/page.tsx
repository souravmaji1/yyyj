import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms of Service — IntelliVerseX",
  description: "The rules that govern your use of IntelliVerseX.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      subtitle="Effective: September 2, 2025"
    >
      <section>
        <h2>1. Overview</h2>
        <p>
          These Terms of Service govern your access to and use of IntelliVerseX services, including our gaming platform, marketplace, and AI tools.
        </p>
      </section>

      <section>
        <h2>2. Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account and all activities that occur under your account.
        </p>
      </section>

      <section>
        <h2>3. Purchases & Subscriptions</h2>
        <p>
          All purchases are final unless otherwise specified. Subscription fees are charged in advance and are non-refundable.
        </p>
      </section>

      <section>
        <h2>4. User Content</h2>
        <p>
          By submitting content to our platform, you grant us a license to host, display, and distribute your content as necessary to provide our services.
        </p>
      </section>

      <section>
        <h2>5. Prohibited Conduct</h2>
        <ul>
          <li>Cheating</li>
          <li>Reverse engineering</li>
          <li>Harassment/hate/illegal content</li>
        </ul>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account at any time for violations of these terms or for any other reason.
        </p>
      </section>

      <section>
        <h2>7. Disclaimers & Liability</h2>
        <p>
          Our services are provided "as is" with limited liability. We disclaim warranties and limit our liability to the maximum extent permitted by law.
        </p>
      </section>

      <section>
        <h2>8. Governing Law & Disputes</h2>
        <p>
          These terms are governed by applicable law, with venue and arbitration procedures varying by region as outlined in our regional annex.
        </p>
      </section>
    </PolicyLayout>
  );
}