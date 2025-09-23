import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Player Verification — IntelliVerseX",
  description: "When and why we ask for verification for cash prizes or competitive tiers.",
};

export default function VerificationPage() {
  return (
    <PolicyLayout
      title="Player Verification"
      subtitle="Lightweight checks to prevent fraud, bots, and duplicate accounts."
    >
      <section>
        <h2>When we verify</h2>
        <ul>
          <li>Cash tournaments</li>
          <li>Suspicious recovery</li>
          <li>High-tier leagues</li>
        </ul>
      </section>

      <section>
        <h2>What we ask</h2>
        <ul>
          <li>Email/SMS</li>
          <li>Gov ID + liveness (cash-out)</li>
          <li>Payment ownership checks</li>
        </ul>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          All verification data is encrypted at rest, access-controlled, and retained only as required by law and platform security needs.
        </p>
      </section>
    </PolicyLayout>
  );
}