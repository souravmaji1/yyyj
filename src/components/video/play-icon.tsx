"use client"

export function PlayIcon({ size = 48 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #3A8DFF 0%, #9B4DFF 100%)",
        boxShadow: "0 0 18px rgba(58,141,255,0.35)",
      }}
    >
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="white" className="-ml-0.5">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )
}
