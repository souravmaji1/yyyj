"use client"

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  onSubmit?: (value: string) => void
}

export function SearchBar({ 
  value = "", 
  onChange, 
  placeholder = "Search Videos", 
  onSubmit 
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && value.trim()) {
      onSubmit(value.trim())
    }
  }

  return (
    <form
      role="search"
      className="flex items-stretch gap-2 rounded-[20px] bg-white/5 p-2 ring-1 ring-white/10"
      onSubmit={handleSubmit}
    >
      <input
        aria-label="Search Videos"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-0 flex-1 rounded-[14px] bg-transparent px-3 py-2 text-sm placeholder:text-white/55 focus:outline-none text-white"
      />
      <button
        type="submit"
        className="rounded-[8px] bg-[#0072AF] h-7 px-3 hover:bg-[#0060af] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  )
}