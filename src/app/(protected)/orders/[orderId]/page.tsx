"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/src/store"
import { fetchOrderById, downloadInvoice, downloadInvoicePdf } from "@/src/store/slices/orderSlice"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils"
import { fetchUserReviews } from "@/src/store/slices/reviewSlice"

import Image from "next/image"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  MessageCircle,
  Star,
  Copy,
  ChevronDown,
  FileText,
} from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Progress } from "../../../../components/ui/progress"
import { Separator } from "../../../../components/ui/separator"
import { ReviewModal } from "@/src/components/productDetails/details"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/dropdown"
import authAxiosClient from "@/src/app/apis/auth/axios"

interface TrackingEvent {
  id: number
  status: string
  description: string
  timestamp: string
  location: string
  completed: boolean
  current?: boolean
}

export default function OrderDetailsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { showSuccess, showError, showInfo } = useNotificationUtils()

  const { currentOrder, currentOrderLoading, currentOrderError } = useSelector((state: RootState) => state.order)
  const { profile: userProfile } = useSelector((state: RootState) => state.user)
  const { userReviews } = useSelector((state: RootState) => state.reviews)

  const orderId = params?.orderId as string

  // Early return if no orderId is available
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600">Unable to load order details. Please check the URL and try again.</p>
            <Button 
              onClick={() => router.push('/orders')} 
              className="mt-4"
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewProductId, setReviewProductId] = useState<number | null>(null)
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId))
    }
    // Fetch user reviews if not already loaded
    dispatch(fetchUserReviews() as any)
  }, [dispatch, orderId])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)

    // Show success toast when copying transaction ID
    if (field === "transaction") {
      showSuccess("Transaction ID Copied!", "Transaction ID has been copied to clipboard.")
    }
  }

  // Calculate order progress based on status
  const getOrderProgress = (status: string): number => {
    switch (status.toLowerCase()) {
      case "pending":
        return 10
      case "processing":
        return 30
      case "shipped":
        return 75
      case "delivered":
        return 100
      case "cancelled":
        return 0
      default:
        return 10
    }
  }

  // Generate tracking history based on order status
  const generateTrackingHistory = (orderActivities?: any[]): TrackingEvent[] => {
    const history: TrackingEvent[] = [];
    console.log(orderActivities)

    // If we have order activities, use them to generate tracking history
    if (orderActivities && orderActivities.length > 0) {
      // Sort activities by createdAt timestamp
      const sortedActivities = [...orderActivities].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Find timestamps for each step
      let orderPlacedTimestamp: Date | null = null;
      let paymentInitiatedTimestamp: Date | null = null;
      let orderConfirmedTimestamp: Date | null = null;
      let orderProcessingTimestamp: Date | null = null;
      let orderShippedTimestamp: Date | null = null;
      let orderDeliveredTimestamp: Date | null = null;

      // Extract timestamps from activities
      sortedActivities.forEach((activity) => {
        const timestamp = new Date(activity.createdAt);

        // Order Placed - when inventory is reserved
        if (activity.action === "status_change" && activity.status === "reserved") {
          orderPlacedTimestamp = timestamp;
        }

        // Payment Initiated
        if (activity.action === "payment_initiated") {
          paymentInitiatedTimestamp = timestamp;
        }

        // Order Confirmed - when payment is received
        if (activity.action === "payment_received" && activity.status === "paid") {
          orderConfirmedTimestamp = timestamp;
        }

        // Order Processing
        if (activity.action === "order_processing" && activity.status === "processing") {
          orderProcessingTimestamp = timestamp;
        }

        // Order Shipped
        if (activity.action === "order_shipped" && activity.status === "shipped") {
          orderShippedTimestamp = timestamp;
        }

        // Order Delivered
        if (activity.action === "order_delivered" && activity.status === "delivered") {
          orderDeliveredTimestamp = timestamp;
        }
      });

      // Apply hierarchy logic - if a step is missing, use the next available timestamp
      if (!orderProcessingTimestamp && orderShippedTimestamp) {
        orderProcessingTimestamp = orderShippedTimestamp;
      }
      if (!orderProcessingTimestamp && orderDeliveredTimestamp) {
        orderProcessingTimestamp = orderDeliveredTimestamp;
      }

      if (!orderShippedTimestamp && orderDeliveredTimestamp) {
        orderShippedTimestamp = orderDeliveredTimestamp;
      }

      // Build history with available timestamps
      if (orderPlacedTimestamp !== null) {
        history.push({
          id: 1,
          status: "Order Placed",
          description: "Your order has been placed successfully",
          timestamp: (orderPlacedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Online",
          completed: true,
        });
      }

      if (paymentInitiatedTimestamp !== null) {
        history.push({
          id: 2,
          status: "Payment Initiated",
          description: "Payment process has been initiated",
          timestamp: (paymentInitiatedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Payment Gateway",
          completed: true,
        });
      }

      if (orderConfirmedTimestamp !== null) {
        history.push({
          id: 3,
          status: "Order Confirmed",
          description: "Payment received and order has been confirmed",
          timestamp: (orderConfirmedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Fulfillment Center",
          completed: true,
        });
      }

      if (orderProcessingTimestamp !== null) {
        history.push({
          id: 4,
          status: "Order Processing",
          description: "Your order is being processed and prepared for shipping",
          timestamp: (orderProcessingTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Fulfillment Center",
          completed: true,
        });
      }

      if (orderShippedTimestamp !== null) {
        history.push({
          id: 5,
          status: "Order Shipped",
          description: "Your order has been shipped and is on the way",
          timestamp: (orderShippedTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Distribution Center",
          completed: true,
          current: currentOrder?.status.toLowerCase() === "shipped",
        });
      }

      if (orderDeliveredTimestamp !== null) {
        history.push({
          id: 6,
          status: "Order Delivered",
          description: "Your order has been delivered successfully",
          timestamp: (orderDeliveredTimestamp as Date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          location: "Your Address",
          completed: true,
          current: true,
        });
      }

      // If no activities found, fall back to the original logic
      if (history.length === 0) {
        return generateFallbackTrackingHistory(currentOrder);
      }

      return history;
    }

    // Fallback to original logic if no activities
    return generateFallbackTrackingHistory(currentOrder);
  };

  const generateFallbackTrackingHistory = (order: any): TrackingEvent[] => {
    const history: TrackingEvent[] = [
      {
        id: 1,
        status: "Order Placed",
        description: "Your order has been placed successfully",
        timestamp: new Date(order.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Online",
        completed: true,
      },
    ];

    if (order.status.toLowerCase() !== "pending") {
      history.push({
        id: 2,
        status: "Order Confirmed",
        description: "Your order has been confirmed and is being packed",
        timestamp: new Date(order.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Fulfillment Center",
        completed: true,
      });
    }

    if (order.status.toLowerCase() === "shipped" || order.status.toLowerCase() === "delivered") {
      history.push({
        id: 3,
        status: "Shipped",
        description: "Your order is on the way",
        timestamp: new Date(order.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Distribution Center",
        completed: true,
        current: order.status.toLowerCase() === "shipped",
      });
    }

    if (order.status.toLowerCase() === "delivered") {
      history.push({
        id: 4,
        status: "Delivered",
        description: "Your order has been delivered",
        timestamp: new Date(order.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        location: "Your Address",
        completed: true,
        current: true,
      });
    }

    return history;
  };

  // Calculate payment breakdown
  const calculatePaymentBreakdown = (order: any) => {
    const subtotal = Number.parseFloat(order.totalAmount) + Number.parseFloat(order.discountAmount)
    const discount = Number.parseFloat(order.discountAmount)
    const shipping = 0.00 // This could be dynamic if available in the order data
    const tax = 0.00 // 8% tax rate - this could be dynamic
    const total = Number.parseFloat(order.totalAmount)

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
    }
  }

  const handleWriteReview = (productId: number, orderId: string) => {
    setReviewProductId(productId)
    setReviewOrderId(orderId)
    setReviewModalOpen(true)
  }
  const handleDownloadInvoiceCsv = async () => {
    if (!currentOrder?.id) return
    setDownloadingInvoice(true)
    try {
      const response = await authAxiosClient.get(`/orders/${currentOrder.id}/invoice`, {
        responseType: 'blob',
      });

      // Create blob with proper MIME type
      const blob = new Blob([response.data], {
        type: 'text/csv; charset=utf-8;'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${currentOrder.id}.csv`);

      // Add BOM for Excel compatibility
      const csvContent = await blob.text();
      const csvWithBOM = '\uFEFF' + csvContent;
      const finalBlob = new Blob([csvWithBOM], {
        type: 'text/csv;charset=utf-8;'
      });
      const finalUrl = window.URL.createObjectURL(finalBlob);
      link.href = finalUrl;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        window.URL.revokeObjectURL(finalUrl);
      }, 1000);

      showSuccess("Invoice Downloaded", "Your invoice CSV has been downloaded.")
    } catch (err: any) {
      showError("Download Failed", err?.message || "Could not download invoice.")
    } finally {
      setDownloadingInvoice(false)
    }
  }
  const handleDownloadInvoicePdf = async () => {
    if (!currentOrder?.id) return
    setDownloadingPdf(true)
    try {
      const blob = await dispatch(downloadInvoicePdf(currentOrder.id) as any).unwrap()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Invoice-${currentOrder.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
      showSuccess("Invoice Downloaded", "Your invoice PDF has been downloaded.")
    } catch (err: any) {
      showError("Download Failed", err?.message || "Could not download PDF invoice.")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleTrackLiveOrder = () => {
    showInfo("Coming Soon", "Live order tracking will be available soon!")
  }

  const handleContactSupport = () => {
    showInfo("Coming Soon", "Support chat will be available soon!")
  }

  if (currentOrderLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (currentOrderError || !currentOrder) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-sm sm:text-base">Failed to load order details</p>
          <Button onClick={() => router.push("/orders")} className="bg-blue-500 hover:bg-blue-600" size="sm">
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const orderProgress = getOrderProgress(currentOrder.status)
  const trackingHistory = generateTrackingHistory(currentOrder.logs)
  console.log("Details - Order logs:", currentOrder.logs);
  console.log("Details - Generated tracking history:", trackingHistory);
  const paymentBreakdown = calculatePaymentBreakdown(currentOrder)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Order Details Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="sm" className="text-gray-400 p-2" onClick={() => router.push("/orders")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Order Details</h1>
                <p className="text-white text-sm sm:text-base">#{currentOrder.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Order Status Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-full bg-blue-500/20 flex-shrink-0">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Order {currentOrder.status}</h2>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 w-fit text-xs sm:text-sm">
                      {currentOrder.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Order placed:{" "}
                    {new Date(currentOrder.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-white mb-1 font-semibold">Transaction ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs sm:text-sm bg-slate-700 px-2 sm:px-3 py-1 rounded font-mono text-blue-400 truncate max-w-[200px] sm:max-w-none">
                    {currentOrder.transactionId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentOrder.transactionId, "transaction")}
                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-slate-700 rounded-full flex-shrink-0"
                  >
                    <Copy className="h-3 w-3 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm items-center gap-2">
                <span className="text-white font-semibold">Order Progress</span>
                <span className="text-white font-semibold">{orderProgress}%</span>
              </div>
              <Progress
                value={orderProgress}
                className="rounded-full h-2 bg-white-100 border border-slate-600 hover:cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Detailed Tracking Timeline */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="text-lg sm:text-xl font-bold text-white">Order Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                {trackingHistory.map((event: TrackingEvent, index) => (
                  <div key={event.id} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2
                        ${event.completed
                            ? event.current
                              ? "bg-blue-500 border-blue-500 ring-4 ring-blue-500/20"
                              : "bg-green-500 border-green-500"
                            : "bg-slate-700 border-slate-600"
                          }
                      `}
                      >
                        {event.completed ? (
                          event.current ? (
                            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          ) : (
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          )
                        ) : (
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        )}
                      </div>
                      {index < trackingHistory.length - 1 && (
                        <div
                          className={`w-px h-12 sm:h-16 mt-2 ${event.completed ? "bg-green-500" : "bg-slate-600"}`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4 sm:pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={`font-semibold mb-1 text-sm sm:text-base ${event.current ? "text-blue-400" : event.completed ? "text-white" : "text-gray-400"
                              }`}
                          >
                            {event.status}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400 mb-2">{event.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                            <span>{event.timestamp}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  <span className="text-lg sm:text-xl font-bold text-white">
                    Order Items ({currentOrder.orderItems.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {currentOrder.orderItems.map((item, index) => {
                  // Find user's review for this product and order
                  const userReview = userReviews.find(
                    (r) => r.productId === item.productId && r.orderId === currentOrder.id,
                  )
                  return (
                    <div key={item.id}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={item.product?.imageUrl || "/placeholder.svg"}
                              alt={item.product?.title || "Product image"}
                              width={64}
                              height={64}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover bg-slate-700"
                            />
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-medium">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white mb-1 text-sm sm:text-base truncate">
                              {item.product?.title || `Product ${item.productId}`}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400">
                              ${Number.parseFloat(item.unitPrice).toFixed(2)} each
                            </p>
                            {/* Show user's review if exists */}
                            {userReview && (
                              <div className="mt-2 mb-2 p-2 sm:p-3 rounded bg-slate-800 border border-slate-700">
                                <div className="flex items-center gap-2 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-sm sm:text-xl ${star <= userReview.rating ? "text-yellow-400" : "text-gray-600"}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="text-gray-400 text-xs ml-2">Your Review</span>
                                </div>
                                <div className="text-gray-300 text-xs sm:text-sm">{userReview.text}</div>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                              {currentOrder.status.toLowerCase() === "delivered" && !userReview && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 sm:h-8 bg-gradient-to-r from-[var(--color-primary,#02a7fd)] to-[var(--color-secondary,#2e2d7b)] text-white hover:opacity-90 transition-all flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 w-fit font-medium"
                                  onClick={() => handleWriteReview(item.productId, currentOrder.id)}
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Write a Review
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/shop')}
                                className="h-7 sm:h-8 bg-gradient-to-r from-[var(--color-primary,#02a7fd)] to-[var(--color-secondary,#2e2d7b)] text-white hover:opacity-90 transition-all flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 w-fit font-medium"
                              >
                                Buy Again
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-base sm:text-lg text-white">
                            ${Number.parseFloat(item.totalPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {index < currentOrder.orderItems.length - 1 && <Separator className="my-4 bg-slate-700" />}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${paymentBreakdown.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">-${paymentBreakdown.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white">${paymentBreakdown.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Tax</span>
                    <span className="text-white">${paymentBreakdown.tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-white text-sm sm:text-base">Total</span>
                    <span className="font-semibold text-lg sm:text-xl text-blue-400">
                      ${paymentBreakdown.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Payment Method</p>
                    <p className="text-white font-medium text-sm sm:text-base">{currentOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Transaction ID</p>
                    <code className="text-xs bg-slate-700 px-2 py-1 rounded font-mono text-blue-400 block truncate">
                      {currentOrder.transactionId}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Payment Status</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">{currentOrder?.payment?.status || currentOrder.paymentDetails.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                <Button
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium text-sm sm:text-base py-2 sm:py-3"
                  onClick={handleTrackLiveOrder}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Track Live Order
                </Button>

                {/* Download Invoice - Only show for delivered orders */}
                {currentOrder.status.toLowerCase() === "delivered" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium text-sm sm:text-base py-2 sm:py-3"
                        disabled={downloadingInvoice || downloadingPdf}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingInvoice || downloadingPdf ? "Downloading..." : "Download Invoice"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={handleDownloadInvoiceCsv}
                        disabled={downloadingInvoice}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Download as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDownloadInvoicePdf}
                        disabled={downloadingPdf}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Download as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium text-sm sm:text-base py-2 sm:py-3"
                  onClick={handleContactSupport}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Contact</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white">
                      <Phone className="h-3 w-3" />
                      <span>{userProfile?.phoneNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{userProfile?.email || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Customer</p>
                    <div className="text-white text-xs sm:text-sm">
                      <p>{userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "N/A"}</p>
                      <p>User ID: {userProfile?.id || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={reviewProductId!}
        orderId={reviewOrderId!}
        onSuccess={() => {
          // Refetch order data to show the new review
          if (orderId) {
            dispatch(fetchOrderById(orderId) as any);
          }
        }}
      />
    </div>
  )
}