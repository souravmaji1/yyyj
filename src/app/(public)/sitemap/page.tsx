import type { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap — IntelliVerseX",
  description: "Browse all public pages and resources.",
};

const routes = [
  { path: "/", title: "Home" },
  { path: "/ai/training-data", title: "AI Training Data" },
  { path: "/ai/safety", title: "AI Safety" },
  { path: "/privacy/dashboard", title: "Privacy Dashboard" },
  { path: "/data/export", title: "Data Export" },
  { path: "/data/delete", title: "Data Delete" },
  { path: "/cookies/preferences", title: "Cookie Preferences" },
  { path: "/privacy/choices", title: "Privacy Choices" },
  { path: "/sitemap", title: "Sitemap" },
  { path: "/accessibility", title: "Accessibility" },
  { path: "/fairness/game-logs", title: "Game Logs & Fairness" },
  { path: "/fairness/verification", title: "Player Verification" },
  { path: "/fairness/responsible-gaming", title: "Responsible Gaming" },
  { path: "/terms", title: "Terms of Service" },
  { path: "/security", title: "Security" },
];

export default function SitemapPage() {
  return (
    <PolicyLayout
      title="Sitemap"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className="block p-4 bg-[#0c1120] border border-[#0f1529] rounded-lg hover:border-brand-600/50 transition-colors"
          >
            <span className="text-brand-600 hover:text-brand-700 font-medium">
              {route.title}
            </span>
            <div className="text-sm text-white/60 mt-1">
              {route.path}
            </div>
          </Link>
        ))}
      </div>
    </PolicyLayout>
  );
}