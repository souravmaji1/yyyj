"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserOrders, clearOrder, type Order } from "@/src/store/slices/orderSlice"
import type { AppDispatch, RootState } from "@/src/store"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/src/components/ui/spinner"
import { OrderCard } from "@/src/components/order/orderCard"
import { TrackingModal } from "@/src/components/order/trackingModal"
import { DUMMY_IMAGES } from "@/src/constants"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Filter, X, Package, ShoppingBag, AlertCircle, Search } from "lucide-react"
import { OrderNFTDiscountAddon } from "@/src/components/order/OrderNFTDiscountAddon"

const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "1year", label: "Last Year" },
]

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

interface FilterState {
  dateFilter: string
  statusFilter: string
}

export const PhysicalOrdersTab = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { userOrders, userOrdersLoading, userOrdersError } = useSelector((state: RootState) => state.order)
  const isUser = useSelector((state: RootState) => state.user.profile)
  const { showError } = useNotificationUtils()

  const [filters, setFilters] = useState<FilterState>({
    dateFilter: "all",
    statusFilter: "all",
  })

  const [trackingModal, setTrackingModal] = useState<{
    isOpen: boolean
    order: Order | null
  }>({
    isOpen: false,
    order: null,
  })

  useEffect(() => {
    const userId = isUser?.id
    userId && dispatch(fetchUserOrders({ userId, orderType: "physical" }))
  }, [dispatch, isUser])

  useEffect(() => {
    const sessionId = searchParams?.get("session_id")
    if (sessionId) {
      dispatch(clearOrder())
      showError("Payment Failed", "Payment failed. Please try again.")
      router.replace("/orders")
    }
  }, [searchParams, dispatch, router, showError])

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleTrackOrder = (order: Order) => {
    setTrackingModal({
      isOpen: true,
      order,
    })
  }

  const closeTrackingModal = () => {
    setTrackingModal({
      isOpen: false,
      order: null,
    })
  }

  const mapOrderStatus = (status: string): "pending" | "processing" | "shipped" | "delivered" | "cancelled" => {
    switch (status.toLowerCase()) {
      case "processing":
      case "shipped":
      case "delivered":
      case "cancelled":
      case "paid":
        return status.toLowerCase() as any
      default:
        return "pending"
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
        const orderStatus = mapOrderStatus(order.status)
        if (orderStatus !== filters.statusFilter) {
          return false
        }
      }
      return true
    })
  }, [userOrders, filters])

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      dateFilter: "all",
      statusFilter: "all",
    })
  }

  const hasActiveFilters = filters.dateFilter !== "all" || filters.statusFilter !== "all"

  const orderStats = useMemo(() => {
    if (!userOrders) return { total: 0, pending: 0, delivered: 0 }
    return {
      total: userOrders.length,
      pending: userOrders.filter((order) => ["pending", "processing", "shipped"].includes(mapOrderStatus(order.status))).length,
      delivered: userOrders.filter((order) => mapOrderStatus(order.status) === "delivered").length,
    }
  }, [userOrders])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header Section - Only show when there are orders */}
      {!userOrdersLoading && userOrders && userOrders.length > 0 && (
        <div className="bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)] to-[#243447] border-b border-gray-700/50">
          <div className="container mx-auto px-4 py-8 orders-container bg-[var(--color-bg)] ">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 orders-header-flex">
              {/* Title and Stats */}
              <div className="space-y-4 orders-header-stats">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                    <Package className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Your Orders</h1>
                    <p className="text-gray-400 mt-1">Track and manage your order history</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{orderStats.total} Total Orders</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{orderStats.pending} In Progress</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{orderStats.delivered} Delivered</span>
                  </div>
                </div>
              </div>
              {/* Filters */}
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm orders-header-filters">
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
                          onValueChange={(value) => handleFilterChange("dateFilter", value)}
                        >
                          <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-600 text-white hover:bg-gray-900/70 transition-colors select-trigger">
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
                      {/* Status Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 whitespace-nowrap">Status:</span>
                        <Select
                          value={filters.statusFilter}
                          onValueChange={(value) => handleFilterChange("statusFilter", value)}
                        >
                          <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-600 text-white hover:bg-gray-900/70 transition-colors select-trigger">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {STATUS_FILTER_OPTIONS.map((option) => (
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
      )}
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 orders-container bg-[var(--color-bg)] ">
        {/* Results Summary - Only show when there are orders */}
        {!userOrdersLoading && userOrders && userOrders.length > 0 && (
          <Card className="mb-8 bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[var(--color-primary)]/10 rounded-md">
                    <Search className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <span className="text-white font-medium">
                      {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
                    </span>
                    {userOrders.length !== filteredOrders.length && (
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
        {/* Loading State */}
        {userOrdersLoading && (
          <div className="min-h-screen bg-[var(--color-bg)] py-4 sm:py-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center py-16">
                <Spinner className="h-8 w-8 text-[var(--color-primary)]" />
                <p className="text-gray-400 mt-4 text-center">Loading your orders...</p>
              </div>
            </div>
          </div>
        )}
        {/* Error State */}
        {userOrdersError && (
          <Card className="bg-red-900/20 border-red-800/50">
            <CardContent className="p-8 text-center">
              <div className="p-3 bg-red-900/30 rounded-full w-fit mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
              <p className="text-gray-400 mb-6">{userOrdersError}</p>
              <Button onClick={() => router.push("/shop")} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                Shop Now
              </Button>
            </CardContent>
          </Card>
        )}
        {/* No Orders State */}
        {!userOrdersLoading && !userOrdersError && (!userOrders || userOrders.length === 0) && (
          <div className="bg-gray-800/30 rounded-lg p-12 text-center">
            <div className="p-4 bg-gray-700/50 rounded-full w-fit mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No orders yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-8"
            >
              Start Shopping
            </Button>
          </div>
        )}
        {/* No Filtered Results */}
        {!userOrdersLoading &&
          !userOrdersError &&
          userOrders &&
          userOrders.length > 0 &&
          filteredOrders.length === 0 && (
            <Card className="bg-gray-800/30 border-gray-700/50">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gray-700/50 rounded-full w-fit mx-auto mb-6">
                  <Filter className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No matching orders</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  No orders match your current filter criteria. Try adjusting your filters or clear them to see all
                  orders.
                </p>
                <Button onClick={clearFilters} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-8">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        {/* Orders List */}
        {!userOrdersLoading && !userOrdersError && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order: Order) => (
              <div key={order.id}>
                <OrderCard
                  key={order.id}
                  order={{
                    id: order.id,
                    date: order.createdAt,
                    status: mapOrderStatus(order.status),
                    total: Number.parseFloat(order.totalAmount),
                    amountType: order.paymentMethod,
                    items: order.orderItems.map((item) => ({
                      id: item.id,
                      name: item.product?.title || `Product ${item.productId}`,
                      price: Number.parseFloat(item.unitPrice),
                      quantity: item.quantity,
                      image: item.product?.imageUrl || DUMMY_IMAGES,
                    })),
                    trackingNumber: null,
                  }}
                  onViewDetails={() => handleViewDetails(order.id)}
                  onTrack={() => handleTrackOrder(order)}
                />
                <OrderNFTDiscountAddon
                  nftDiscount={order.nftDiscount}
                  discountAmount={Number(order.discountAmount)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Tracking Modal */}
      {trackingModal.isOpen && trackingModal.order && (
        <TrackingModal
          isOpen={trackingModal.isOpen}
          onClose={closeTrackingModal}
          order={{
            id: trackingModal.order.id,
            status: trackingModal.order.status,
            createdAt: trackingModal.order.createdAt,
            updatedAt: trackingModal.order.updatedAt,
            trackingNumber: undefined,
            logs: trackingModal.order.logs,
          }}
        />
      )}
    </div>
  )
} 