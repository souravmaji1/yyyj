import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";
import { CTACard } from "@/components/CTACard";

export const metadata: Metadata = {
  title: "Data Export — IntelliVerseX",
  description: "Request a copy of your data in a portable format.",
};

export default function DataExportPage() {
  const aside = (
    <div>
      <div className="card bg-[#0c1120] border border-[#0f1529] rounded-[1.25rem] p-6 mb-4">
        <div className="mb-4">
          <span className="badge bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            IntelliVerseX
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Start Export</h3>
        <p className="text-white/70 mb-4">Begin the data export process.</p>
        <button 
          disabled
          className="btn btn-primary inline-block text-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start export (stub)
        </button>
        <p className="text-sm text-white/50 mt-3">Exports typically complete within a few days.</p>
      </div>
    </div>
  );

  return (
    <PolicyLayout
      title="Export Your Data"
      subtitle="We'll prepare a machine-readable archive (JSON/CSV) and email you a secure link."
      aside={aside}
    >
      <section>
        <h2>What you'll get</h2>
        <ul>
          <li>Profile</li>
          <li>Game history</li>
          <li>Purchases</li>
          <li>Support messages</li>
          <li>Security logs</li>
        </ul>
      </section>

      <section>
        <h2>Verification</h2>
        <p>
          For security purposes, we may require re-authentication before processing your data export request.
        </p>
      </section>
    </PolicyLayout>
  );
}