import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Security — IntelliVerseX",
  description: "How we protect data and keep our platform resilient.",
};

export default function SecurityPage() {
  return (
    <PolicyLayout
      title="Security"
      subtitle="Defense-in-depth across infrastructure, data, and applications."
    >
      <section>
        <h2>Practices</h2>
        <ul>
          <li>TLS 1.2+</li>
          <li>AES-256 at rest</li>
          <li>Least privilege & key rotation</li>
          <li>SAST/DAST & deps</li>
          <li>Backups/DR/chaos</li>
        </ul>
      </section>

      <section>
        <h2>Reporting</h2>
        <p>
          If you discover a security vulnerability, please email{" "}
          <a 
            href="mailto:security@intelli-verse-x.ai"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            security@intelli-verse-x.ai
          </a>{" "}
          with details and proof of concept. We appreciate responsible disclosure.
        </p>
      </section>

      <section>
        <h2>Bug Bounty</h2>
        <p>
          We provide recognition for responsible security disclosures and may offer rewards for qualifying vulnerabilities.
        </p>
      </section>
    </PolicyLayout>
  );
}