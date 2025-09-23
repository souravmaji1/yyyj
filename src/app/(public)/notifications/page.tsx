"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"
import { Inbox } from "lucide-react"
import NotificationHeader from "@/src/components/notifications/notificationHeader"
import NotificationCard from "@/src/components/notifications/notificationCards"
import SupportTicketDetailsPopup from "@/src/components/notifications/SupportTicketDetailsPopup"
import { AppDispatch, RootState } from "@/src/store"
import { fetchNotifications, markNotificationsAsRead, markAllNotificationsAsRead, selectNotifications, selectNotificationCounts, selectNotificationPagination, selectNotificationsLoading, selectNotificationsError, clearErrors } from "@/src/store/slices/notificationSlice"
import { Spinner } from "@/src/components/ui/spinner"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

export default function NotificationsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { showSuccess } = useNotificationUtils();

  // Redux selectors
  const notifications = useSelector(selectNotifications)
  const counts = useSelector(selectNotificationCounts)
  const pagination = useSelector(selectNotificationPagination)
  const loading = useSelector(selectNotificationsLoading)
  const isUser = useSelector((state: RootState) => state.user.profile);
  const error = useSelector(selectNotificationsError)

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Support popup state
  const [showSupportPopup, setShowSupportPopup] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<{
    ticketId: number;
    notification: any;
  } | null>(null)

  // Handle support popup events
  useEffect(() => {
    const handleOpenSupportPopup = (event: CustomEvent) => {
      const { ticketId, notification } = event.detail;
      setSelectedTicket({ ticketId, notification });
      setShowSupportPopup(true);
    };

    window.addEventListener('openSupportPopup', handleOpenSupportPopup as EventListener);

    return () => {
      window.removeEventListener('openSupportPopup', handleOpenSupportPopup as EventListener);
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    const params: { page: number; limit: number; type?: string; isRead?: boolean } = {
      page: currentPage,
      limit: 10
    };

    // Add type filter if specified
    if (selectedType !== "all") {
      params.type = selectedType;
    }

    // Add isRead filter based on current filter state
    if (filter === "unread") {
      params.isRead = false;
    } else if (filter === "read") {
      params.isRead = true;
    }
    // If filter is "all", don't add isRead parameter (will get all notifications)

    isUser && dispatch(fetchNotifications(params));
  }, [dispatch, currentPage, filter, selectedType, isUser]);

  // Use backend filtered notifications directly - no manual filtering needed
  const filteredNotifications = useMemo(() => {
    // The backend already returns the correct filtered notifications
    // Just flatten the grouped notifications into a single array
    const allNotifications = [
      ...notifications.security,
      ...notifications.order,
      ...notifications.payment,
      ...notifications.account,
      ...notifications.general,
      ...notifications['ai-query']
    ];

    // Sort by creation date (newest first)
    return allNotifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  // Memoized counts - use backend counts directly
  const unreadCount = useMemo(() => {
    return counts?.unread || 0
  }, [counts])

  const totalCount = useMemo(() => {
    return counts?.total || 0
  }, [counts])

  const readCount = useMemo(() => {
    return counts?.read || 0
  }, [counts])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)

    const params: { page: number; limit: number; type?: string; isRead?: boolean } = {
      page,
      limit: 10
    };

    if (selectedType !== "all") {
      params.type = selectedType;
    }

    if (filter === "unread") {
      params.isRead = false;
    } else if (filter === "read") {
      params.isRead = true;
    }

    isUser && dispatch(fetchNotifications(params));
  }, [dispatch, selectedType, filter, isUser]);

  const handleTypeFilter = useCallback((type: string) => {
    setSelectedType(type)
    setCurrentPage(1)

    const params: { page: number; limit: number; type?: string; isRead?: boolean } = {
      page: 1,
      limit: 10
    };

    if (type !== "all") {
      params.type = type;
    }

    if (filter === "unread") {
      params.isRead = false;
    } else if (filter === "read") {
      params.isRead = true;
    }

    isUser && dispatch(fetchNotifications(params));
  }, [dispatch, filter, isUser]);

  const setSelectedTypeHandler = (value: string | ((prev: string) => string)) => {
    const type = typeof value === 'function' ? value(selectedType) : value;
    handleTypeFilter(type);
  };

  // Optimized auto-mark-as-read function using Redux
  const autoMarkAsRead = useCallback(async (notifications: any[]) => {
    try {
      // Get unread notification IDs from the current page
      const unreadNotificationIds = notifications
        .filter(notification => !notification.isRead)
        .map(notification => notification.id);

      // If there are unread notifications, mark them as read
      if (unreadNotificationIds.length > 0) {
        console.log('Auto-marking as read:', unreadNotificationIds);

        // Use Redux action instead of direct API call
        await dispatch(markNotificationsAsRead(unreadNotificationIds));

        // No need to refresh - the backend will handle the state update
        // The counts will be updated on the next fetch
      }
    } catch (error) {
      console.error('Error auto-marking notifications as read:', error);
    }
  }, [dispatch]);

  // Auto-mark as read when page loads (only once)
  useEffect(() => {
    if (filteredNotifications.length > 0 && !loading && filter !== "read") {
      // Only auto-mark once when page loads, not on every filter change
      const hasUnreadNotifications = filteredNotifications.some(n => !n.isRead);
      if (hasUnreadNotifications) {
        autoMarkAsRead(filteredNotifications);
      }
    }
  }, [filteredNotifications, loading, filter, autoMarkAsRead]);

  // Optimized manual mark-as-read functions
  const markAsRead = useCallback(async (id: string) => {
    try {
      await dispatch(markNotificationsAsRead([id]));
      // No need to refresh - let the user see the immediate effect
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [dispatch]);

  const markAllAsRead = useCallback(async () => {
    try {
      const resultAction = await dispatch(markAllNotificationsAsRead());
      if (markAllNotificationsAsRead.fulfilled.match(resultAction)) {
        // Extract the message from the API response
        const message = resultAction.payload?.data?.message || "All notifications marked as read!";
        showSuccess("Success", message);

        // Refetch notifications to update the UI
        const params: { page: number; limit: number; type?: string; isRead?: boolean } = {
          page: currentPage,
          limit: 10
        };
        if (selectedType !== "all") params.type = selectedType;
        if (filter === "unread") params.isRead = false;
        else if (filter === "read") params.isRead = true;
        isUser && dispatch(fetchNotifications(params));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [dispatch, currentPage, selectedType, filter, showSuccess, isUser]);

  const deleteNotification = useCallback(async (id: string) => {
    // Add to deleting set for animation
    setDeletingIds((prev) => new Set(prev).add(id))

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real implementation, you'd call the delete API
    // For now, we'll just refresh the notifications
    const params: { page: number; limit: number; type?: string; isRead?: boolean } = {
      page: currentPage,
      limit: 10
    };

    if (selectedType !== "all") {
      params.type = selectedType;
    }

    if (filter === "unread") {
      params.isRead = false;
    } else if (filter === "read") {
      params.isRead = true;
    }

    isUser && dispatch(fetchNotifications(params));

    setDeletingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [dispatch, currentPage, selectedType, filter, isUser]);

  // Redirect to a valid page if current page is empty and not the first page
  useEffect(() => {
    if (
      !loading &&
      currentPage > 1 &&
      filteredNotifications.length === 0 &&
      pagination &&
      pagination.totalPages > 0
    ) {
      // Go to the nearest valid page (last page with notifications, or page 1)
      const newPage = Math.min(currentPage - 1, pagination.totalPages) > 0 ? Math.min(currentPage - 1, pagination.totalPages) : 1;
      setCurrentPage(newPage);
    }
  }, [filteredNotifications, currentPage, loading, pagination]);

  // Enhanced empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-20 px-6"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-full flex items-center justify-center border border-[var(--color-primary)]/20"
      >
        <Inbox className="w-10 h-10 text-[var(--color-primary)]/60" />
      </motion.div>

      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-white mb-3"
      >
        {filter === "unread" ? "All caught up!" :
          filter === "read" ? "No read notifications" :
            "No notifications yet"}
      </motion.h3>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 max-w-md mx-auto leading-relaxed"
      >
        {filter === "unread"
          ? "You've read all your notifications. New ones will appear here when they arrive."
          : filter === "read"
            ? "You haven't read any notifications yet. Mark notifications as read to see them here."
            : "When you receive notifications, they'll show up here. Stay tuned for updates!"}
      </motion.p>

      {filter === "unread" && filteredNotifications.length > 0 && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setFilter("all")}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          View All Notifications
        </motion.button>
      )}
    </motion.div>
  )

  // Loading overlay component
  const LoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[var(--color-surface)]/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
    >
      <div className="flex items-center gap-3 text-white">
        {/* <Spinner className="w-4 h-4"/> */}
        {/* <div className="flex items-center justify-center p-8">
          <Spinner />
        </div> */}
        {/* <span className="text-sm font-medium">Loading notifications...</span> */}
      </div>
    </motion.div>
  )

  // Error state
  if (error && isUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2537] via-[var(--color-surface)] to-[#1B2537] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => {
              dispatch(clearErrors())
              const params: { page: number; limit: number; type?: string; isRead?: boolean } = {
                page: 1,
                limit: 10
              };

              if (selectedType !== "all") {
                params.type = selectedType;
              }

              if (filter === "unread") {
                params.isRead = false;
              } else if (filter === "read") {
                params.isRead = true;
              }

              dispatch(fetchNotifications(params))
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2537] via-[var(--color-surface)] to-[#1B2537]">
      <NotificationHeader
        filter={filter}
        setFilter={setFilter}
        selectedType={selectedType}
        setSelectedType={setSelectedTypeHandler}
        unreadCount={unreadCount}
        readCount={readCount}
        markAllAsRead={markAllAsRead}
        totalCount={totalCount}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto relative"
        >
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden relative">
            {/* Loading Overlay */}
            <AnimatePresence>{loading && <LoadingOverlay />}</AnimatePresence>

            {filteredNotifications.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-gray-700/50">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: deletingIds.has(notification.id) ? 0 : 1,
                        x: deletingIds.has(notification.id) ? -100 : 0,
                        scale: deletingIds.has(notification.id) ? 0.95 : 1,
                      }}
                      exit={{
                        opacity: 0,
                        x: -100,
                        scale: 0.95,
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut",
                        layout: { duration: 0.3 },
                      }}
                      whileHover={{
                        backgroundColor: "rgba(2, 167, 253, 0.02)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <NotificationCard
                        notification={{
                          id: notification.id,
                          type: notification.category === 'order' ? 'order' :
                            notification.category === 'payment' ? 'payment' :
                              notification.category === 'security' ? 'security' :
                                notification.category === 'account' ? 'account' :
                                  notification.category === 'general' ? 'general' :
                                    notification.category === 'ai-query' ? 'ai-query' : 'alert',
                          title: notification.title,
                          message: notification.message,
                          timestamp: new Date(notification.createdAt).toLocaleString(),
                          read: notification.isRead,
                          actionUrl: undefined
                        }}
                        onMarkAsRead={markAsRead}
                        isPopupOpen={showSupportPopup}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          {filteredNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-[var(--color-surface)]/60 backdrop-blur-sm rounded-full border border-gray-700/30">
                <span className="text-sm text-gray-400">
                  Showing <span className="text-white font-medium">{filteredNotifications.length}</span> of{" "}
                  <span className="text-white font-medium">{totalCount}</span> notifications
                </span>
                {unreadCount > 0 && (
                  <>
                    <div className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span className="text-sm text-[var(--color-primary)] font-medium">{unreadCount} unread</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Modern Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === 1
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-[var(--color-surface)]/80 border border-gray-700/50 text-white hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-2 rounded-lg bg-[var(--color-surface)]/80 border border-gray-700/50 text-white hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                  </>
                )}

                {/* Current Page Range */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${pageNum === currentPage
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg'
                        : 'bg-[var(--color-surface)]/80 border border-gray-700/50 text-white hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Last Page */}
                {currentPage < pagination.totalPages - 2 && (
                  <>
                    {currentPage < pagination.totalPages - 3 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className="px-3 py-2 rounded-lg bg-[var(--color-surface)]/80 border border-gray-700/50 text-white hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === pagination.totalPages
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-[var(--color-surface)]/80 border border-gray-700/50 text-white hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50'
                  }`}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Page Info */}
              {/* <div className="ml-4 px-4 py-2 bg-[var(--color-surface)]/60 backdrop-blur-sm rounded-lg border border-gray-700/30">
                <span className="text-sm text-gray-400">
                  Page <span className="text-white font-medium">{currentPage}</span> of{" "}
                  <span className="text-white font-medium">{pagination.totalPages}</span>
                </span>
                <span className="text-xs text-gray-500 block">
                  Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems}
                </span>
              </div> */}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Support Ticket Details Popup */}
      {selectedTicket && (
        <SupportTicketDetailsPopup
          isOpen={showSupportPopup}
          onClose={() => {
            setShowSupportPopup(false);
            setSelectedTicket(null);
          }}
          ticketId={selectedTicket.ticketId}
          notificationTitle={selectedTicket.notification.title}
          notificationMessage={selectedTicket.notification.message}
        />
      )}
    </div>
  )
}