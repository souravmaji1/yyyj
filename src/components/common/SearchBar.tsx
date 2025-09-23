"use client";
import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="mb-8">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 rounded-lg bg-[#181F36] text-white placeholder-gray-400 border border-[#232B45] focus:border-[var(--color-primary)] focus:outline-none"
      />
    </div>
  );
}
