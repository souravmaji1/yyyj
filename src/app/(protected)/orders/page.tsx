"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PhysicalOrdersTab } from "@/src/components/order/PhysicalOrdersTab"
import { DigitalOrdersTab } from "@/src/components/order/DigitalOrdersTab"
import { Button } from "@/src/components/ui/button"

const TABS = [
  { key: "physical", label: "Physical Orders" },
  { key: "digital", label: "Digital Orders" },
]

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get("tab")
  const initialTab = tabParam === "digital" ? "digital" : "physical"
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.replace(`/orders?tab=${tab}`)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] ">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex gap-4 mb-4 " style={{justifyContent:"end",}}> 
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              className={
                `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-white hover:opacity-90 transition-all duration-200 ` +
                (activeTab === tab.key
                  ? tab.key === "physical"
                    ? "!bg-[var(--color-primary-700)] !text-white"
                    : tab.key === "digital"
                      ? "!bg-[var(--color-primary-700)] !text-white"
                      : ""
                  : "bg-gray-800 text-[var(--color-primary)] border-[var(--color-primary)]")
              }
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div>
          {activeTab === "physical" && <PhysicalOrdersTab />}
          {activeTab === "digital" && <DigitalOrdersTab />}
        </div>
      </div>
    </div>
  )
}