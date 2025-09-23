import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Cookie Preferences — IntelliVerseX",
  description: "Choose how cookies are used for your experience.",
};

export default function CookiePreferencesPage() {
  return (
    <PolicyLayout
      title="Cookie Preferences"
      subtitle="Adjust consent for analytics and marketing."
    >
      <div className="max-w-2xl">
        <form className="space-y-6">
          {/* Strictly necessary */}
          <div className="card bg-[#0c1120] border border-[#0f1529] rounded-[1.25rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Strictly necessary</h3>
                <p className="text-white/70 text-sm">These cookies are essential for the website to function properly.</p>
              </div>
              <input 
                type="checkbox" 
                checked 
                disabled
                className="w-5 h-5 text-brand-600 bg-gray-700 border-gray-600 rounded focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Analytics */}
          <div className="card bg-[#0c1120] border border-[#0f1529] rounded-[1.25rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                <p className="text-white/70 text-sm">Help us understand how you use our website to improve your experience.</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-brand-600 bg-gray-700 border-gray-600 rounded focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Marketing */}
          <div className="card bg-[#0c1120] border border-[#0f1529] rounded-[1.25rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Marketing</h3>
                <p className="text-white/70 text-sm">Allow us to show you personalized ads and promotional content.</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-brand-600 bg-gray-700 border-gray-600 rounded focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Save button */}
          <button 
            type="button"
            disabled
            className="btn btn-primary px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save preferences (stub)
          </button>
        </form>
      </div>
    </PolicyLayout>
  );
}