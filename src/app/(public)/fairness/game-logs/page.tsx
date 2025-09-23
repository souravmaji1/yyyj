import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Game Logs & Fairness — IntelliVerseX",
  description: "How we record, audit, and publish fairness signals for competitive play.",
};

export default function GameLogsPage() {
  return (
    <PolicyLayout
      title="Game Logs & Fairness"
      subtitle="Transparent audit trails while protecting player privacy."
    >
      <section>
        <h2>What we log</h2>
        <ul>
          <li>Seeds/decisions/outcomes</li>
          <li>Hashed inputs & latency</li>
          <li>Anti-cheat signals</li>
        </ul>
      </section>

      <section>
        <h2>Public Signals</h2>
        <p>
          We publish anonymized fairness metrics to demonstrate the integrity of our gaming systems while protecting individual player privacy.
        </p>
      </section>

      <section>
        <h2>Appeals</h2>
        <p>
          If you believe there's been an error in our game logging or fairness systems, you can appeal via Support.
        </p>
      </section>
    </PolicyLayout>
  );
}