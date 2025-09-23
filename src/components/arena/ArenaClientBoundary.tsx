"use client";

import ArenaModal from "@/src/components/arena/ArenaModal";
import { useArenaModal } from "@/src/components/arena/useArenaModal";

export default function ArenaClientBoundary({ children }: { children: React.ReactNode }) {
  const { isOn } = useArenaModal();

  return (
    <>
      {children}
      {isOn ? <ArenaModal /> : null}
    </>
  );
}