import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Data Deletion — IntelliVerseX",
  description: "Request deletion of personal data from IntelliVerseX.",
};

export default function DataDeletePage() {
  const aside = (
    <div>
      <div className="card bg-[#0c1120] border border-[#0f1529] rounded-[1.25rem] p-6 mb-4">
        <div className="mb-4">
          <span className="badge bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            IntelliVerseX
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Request Deletion</h3>
        <p className="text-white/70 mb-4">Start the data deletion process.</p>
        <button 
          disabled
          className="btn btn-primary inline-block text-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request deletion (stub)
        </button>
        <p className="text-sm text-white/50 mt-3">You can cancel within 14 days before processing begins.</p>
      </div>
    </div>
  );

  return (
    <PolicyLayout
      title="Delete Your Data"
      subtitle="We'll remove personal data we're not required to keep. Some data (e.g., financial records) may be retained to comply with law."
      aside={aside}
    >
      <section>
        <h2>What we delete</h2>
        <ul>
          <li>Profile/contact</li>
          <li>Gameplay data not required for anti-cheat</li>
          <li>Most support comms</li>
        </ul>
      </section>

      <section>
        <h2>What we may retain</h2>
        <ul>
          <li>Fraud/security logs</li>
          <li>Financial records</li>
          <li>Aggregated analytics</li>
        </ul>
      </section>
    </PolicyLayout>
  );
}