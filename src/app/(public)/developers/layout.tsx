"use client";

interface DevelopersLayoutProps {
  children: React.ReactNode;
}

export default function DevelopersLayout({ children }: DevelopersLayoutProps) {
  return (
    <>
      {/* Developers page content without top navigation */}
      {children}
    </>
  );
}