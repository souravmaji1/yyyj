"use client"

import { useEffect, useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/src/store"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Icons } from "@/src/core/icons"
import { fetchUserOrders } from "@/src/store/slices/orderSlice"
import type { AppDispatch } from "@/src/store"
import { Spinner } from "@/src/components/ui/spinner"
import {
  Download,
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  FileText,
  Eye,
  Filter,
  X,
} from "lucide-react"
import type { ProductMedia } from "@/src/store/slices/productSlice"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { TokenSymbol } from "@/src/core/icons/tokenIcon"

const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "1year", label: "Last Year" },
]

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

interface DigitalFile {
  url: string
  name: string
  type: string
  size?: number
}

interface FilterState {
  dateFilter: string
  statusFilter: string
}

export const DigitalOrdersTab = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { userOrders, userOrdersLoading, userOrdersError } = useSelector((state: RootState) => state.order)
  const isUser = useSelector((state: RootState) => state.user.profile)
  const { showError, showSuccess, showInfo } = useNotificationUtils()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterState>({
    dateFilter: "all",
    statusFilter: "all",
  })

  useEffect(() => {
    const userId = isUser?.id
    userId && dispatch(fetchUserOrders({ userId, orderType: "digital" }))
  }, [dispatch, isUser])

  const getDigitalFiles = (product: any): DigitalFile[] => {
    const files: DigitalFile[] = []
    if (product.digitalFiles && Array.isArray(product.digitalFiles)) {
      product.digitalFiles.forEach((url: string) => {
        if (url && typeof url === 'string') {
          const fileName = url.split("/").pop() || "Digital File"
          const fileExtension = fileName.split(".").pop()?.toLowerCase() || ""
          files.push({
            url,
            name: fileName,
            type: fileExtension,
          })
        }
      })
    }
    return files
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
      case "ppt":
      case "pptx":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
      case "txt":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
      case "zip":
      case "rar":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      showError("Download Error", "Download link not available for this file")
      return
    }
    try {
      showInfo("Download", `Preparing download for ${fileName}...`)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showSuccess("Download Started", `${fileName} download started successfully!`)
    } catch (error) {
      showError("Download Failed", "Failed to download. Please try again.")
      console.error("Download error:", error)
    }
  }

  const handleViewFile = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      showError("View Error", "File link not available")
      return
    }
    try {
      window.open(fileUrl, "_blank")
    } catch (error) {
      showError("View Failed", "Failed to open file. Please try again.")
      console.error("View error:", error)
    }
  }

  const filteredOrders = useMemo(() => {
    if (!userOrders) return []
    return userOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      if (filters.dateFilter !== "all") {
        const cutoffDate = new Date()
        switch (filters.dateFilter) {
          case "7days":
            cutoffDate.setDate(now.getDate() - 7)
            break
          case "30days":
            cutoffDate.setDate(now.getDate() - 30)
            break
          case "90days":
            cutoffDate.setDate(now.getDate() - 90)
            break
          case "1year":
            cutoffDate.setFullYear(now.getFullYear() - 1)
            break
        }
        if (orderDate < cutoffDate) {
          return false
        }
      }
      if (filters.statusFilter !== "all") {
        if (order.status.toLowerCase() !== filters.statusFilter) {
          return false
        }
      }
      return true
    })
  }, [userOrders, filters])

  const clearFilters = () => {
    setFilters({
      dateFilter: "all",
      statusFilter: "all",
    })
  }

  const hasActiveFilters = filters.dateFilter !== "all" || filters.statusFilter !== "all"

  if (userOrdersLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]  py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner className="h-8 w-8 text-[var(--color-primary)]" />
            <p className="text-gray-400 mt-4 text-center">Loading your digital orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userOrdersError) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]  py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">Error Loading Orders</h2>
            <p className="text-gray-400 mb-6 text-center text-sm sm:text-base">{userOrdersError}</p>
            <Button onClick={() => window.location.reload()} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">No Digital Orders Found</h2>
            <p className="text-gray-400 mb-6 text-center text-sm sm:text-base">
              You haven't purchased any digital products yet.
            </p>
            <Link href="/shop">
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">Shop Now</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const deliveredOrders = filteredOrders.filter(
    (order) => order.status === "paid" || order.status === "delivered"
  )

  if (deliveredOrders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">
              No Delivered Digital Orders Found
            </h2>
            <p className="text-gray-400 mb-6 text-center text-sm sm:text-base px-4">
              {hasActiveFilters
                ? "No orders match your current filters"
                : "You haven't completed payment for any digital products yet."}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            ) : (
              <Link href="/shop">
                <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">Browse Digital Products</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)] to-[#243447] border-b border-gray-700/50">
        <div className="container mx-auto px-4 py-8 bg-[var(--color-bg)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title and Stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                  <FileText className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Your Digital Orders</h1>
                  <p className="text-gray-400 mt-1">Download and manage your digital products</p>
                </div>
              </div>
              {/* Order Statistics */}
              {!userOrdersLoading && userOrders && userOrders.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{deliveredOrders.length} Digital Orders</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{deliveredOrders.length} Available for Download</span>
                  </div>
                </div>
              )}
            </div>
            {/* Filters */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filters</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 whitespace-nowrap">Date:</span>
                      <Select
                        value={filters.dateFilter}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, dateFilter: value }))}
                      >
                        <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-600 text-white hover:bg-gray-900/70 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {DATE_FILTER_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white cursor-pointer"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Summary */}
        {!userOrdersLoading && userOrders && userOrders.length > 0 && (
          <Card className="mb-8 bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[var(--color-primary)]/10 rounded-md">
                    <Filter className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <span className="text-white font-medium">
                      {deliveredOrders.length} {deliveredOrders.length === 1 ? "order" : "orders"} found
                    </span>
                    {userOrders.length !== deliveredOrders.length && (
                      <span className="text-gray-400 ml-2">of {userOrders.length} total</span>
                    )}
                  </div>
                </div>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20">
                    Filtered
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Orders List */}
        <div className="space-y-4 sm:space-y-6">
          {deliveredOrders.map((order) => {
            const digitalFiles = order.orderItems.flatMap((item) => getDigitalFiles(item.product))
            const hasDigitalFiles = digitalFiles.length > 0
            const isExpanded = expandedOrder === order.id
            return (
              <div key={order.id} className=" rounded-lg border border-gray-700 overflow-hidden bg-[var(--color-bg)]">
                {/* Order Header */}
                <div className="p-3 sm:p-4 border-b border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-green-400 text-sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Paid
                      </span>
                    </div>
                  </div>
                  {/* Digital Files Summary */}
                  {hasDigitalFiles && (
                    <div className="mt-3 p-3  rounded-md bg-[var(--color-bg)] ">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-primary)]" />
                          <span className="text-white font-medium text-sm sm:text-base">
                            {digitalFiles.length} Digital File{digitalFiles.length > 1 ? "s" : ""} Available
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-auto px-3 py-1 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-white text-sm"
                        >
                          {isExpanded ? "Hide Files" : "View Files"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Expanded Digital Files Section */}
                {isExpanded && hasDigitalFiles && (
                  <div className="p-3 sm:p-4 bg-[var(--color-bg)] border-b border-gray-700">
                    <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Digital Files</h4>
                    <div className="space-y-2">
                      {digitalFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-700 rounded-md bg-[var(--color-bg)]"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm sm:text-base truncate">{file.name}</p>
                              {file.size && (
                                <p className="text-xs sm:text-sm text-gray-400">{formatFileSize(file.size)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewFile(file.url, file.name)}
                              className="px-3 py-1 text-blue-400 hover:bg-blue-400/10 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(file.url, file.name)}
                              className="px-3 py-1 text-green-400 hover:bg-green-400/10 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Order Items */}
                <div className="p-3 sm:p-4">
                  {order.orderItems.map((item) => {
                    const displayMediaUrl = item.product?.media?.find(
                      (media: ProductMedia) => media.media_type === "image" || media.media_type === "video",
                    )?.src
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 sm:py-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-800 rounded-md overflow-hidden">
                            {displayMediaUrl ? (
                              <Image
                                src={displayMediaUrl || "/placeholder.svg"}
                                alt={item.product?.title || "Digital Product"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 64px, 80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Icons.image className="h-6 w-6 sm:h-8 sm:w-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm sm:text-base truncate">
                              {item.product?.title || `Product ${item.productId}`}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-400">
                              {order.paymentMethod === "crypto" ? (<TokenSymbol/> ) : "$"}
                              {Number.parseFloat(item.unitPrice).toFixed(2)}
                            </p>
                            {digitalFiles.length > 0 && (
                              <p className="text-xs sm:text-sm text-green-400 mt-1">
                                <CheckCircle2 className="inline-block h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Digital files available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="text-xs sm:text-sm text-gray-400">
                      Total: {order.paymentMethod === "crypto" ? (<TokenSymbol/> ) : "$"}
                      {Number.parseFloat(order.totalAmount).toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Payment Method: {order.paymentMethod}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 