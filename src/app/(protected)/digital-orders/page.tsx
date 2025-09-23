"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DigitalOrdersRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/orders?tab=digital")
  }, [router])
  return null
}
