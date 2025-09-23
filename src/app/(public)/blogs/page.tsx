"use client";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-white">
      <div className="container mx-auto px-4 py-8">
        <iframe
          src="https://blogs.intelli-verse-x.ai"
          title="IntelliVerse X Blog Content"
          className="w-full min-h-[80vh] rounded-xl border-0 bg-[#181F36]"
        />
      </div>
    </div>
  );
}
