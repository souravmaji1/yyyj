"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-white flex items-center justify-center py-12">
      <div className="w-full max-w-7xl bg-[#232f3e] rounded-2xl shadow-xl px-8 py-12 space-y-8 border border-[var(--color-secondary)]/30 about-card">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-[var(--color-primary)]">About IntelliVerse-X</h1>
          <p className="text-lg text-gray-200 font-medium">
            Powering the Future of AI-Driven Creation, Commerce & Community
          </p>
        </header>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Who We Are</h2>
          <p>
            IntelliVerse-X is a team of digital innovators and visionaries dedicated to reimagining the digital frontier. With expertise in AI, retail, media, and decentralized technology, we empower creators, entrepreneurs, and consumers to thrive in the modern digital economy.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">What We Do</h2>
          <p>
            Our mission is to blend artificial intelligence, commerce, content, and blockchain to help you create, grow, and monetize your brand or ideas. We provide tools and services for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>AI-powered design and content creation</li>
            <li>Ad and image generation from prompts</li>
            <li>Conversational AI assistants</li>
            <li>Web3 commerce and NFT integration</li>
            <li>Publishing and retail solutions</li>
          </ul>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Our Vision</h2>
          <p>
            We aim to democratize digital opportunity by putting powerful tools in the hands of everyone—from indie creators and educators to digital brands and NFT collectors. Our vision is an open, intelligent, and rewarding digital universe.
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Decentralized ownership</li>
            <li>Creator-first innovation</li>
            <li>Community-powered growth</li>
          </ul>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Join IntelliVerse-X</h2>
          <p>
            Whether you're a designer, writer, gamer, influencer, or entrepreneur, IntelliVerse-X gives you the tools, reach, and platform to make your mark. Explore, create, and earn in a smarter future powered by AI and intelligent commerce.
          </p>
          <p className="text-gray-400">Learn more at <a href="https://intelliverse-x.ai" className="text-[var(--color-primary)] underline">intelliverse-x.ai</a></p>
        </section>
      </div>
    </div>
  );
}
