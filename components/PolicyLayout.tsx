import React from 'react';

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}

export function PolicyLayout({ title, subtitle, children, aside }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-xl text-white/70">{subtitle}</p>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <article className="prose prose-invert prose-brand max-w-none lg:col-span-2">
            {children}
          </article>

          {/* Sidebar */}
          {aside && (
            <aside className="lg:col-span-1">
              {aside}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}