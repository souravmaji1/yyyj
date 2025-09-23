import React from 'react';
import Link from 'next/link';

interface CTACardProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  note?: string;
}

export function CTACard({ title, description, actionHref, actionLabel, note }: CTACardProps) {
  return (
    <div className="card bg-[#0c1120] border border-[#0f1529] rounded-[1.25rem] p-6 mb-4">
      {/* IntelliVerseX badge */}
      <div className="mb-4">
        <span className="badge bg-brand-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          IntelliVerseX
        </span>
      </div>

      {/* Card content */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-white/70 mb-4">{description}</p>

      {/* Action button */}
      {actionHref && actionLabel && (
        <Link 
          href={actionHref}
          className="btn btn-primary inline-block text-center px-4 py-2 rounded-lg transition-colors"
        >
          {actionLabel}
        </Link>
      )}

      {/* Optional note */}
      {note && (
        <p className="text-sm text-white/50 mt-3">{note}</p>
      )}
    </div>
  );
}