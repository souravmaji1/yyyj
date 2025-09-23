        "use client"

    import { useState, useEffect } from "react"
    import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
    import { Button } from "@/src/components/ui/button"
    import { Input } from "@/src/components/ui/input"
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
    import { Badge } from "@/src/components/ui/badge"
    import { Calendar } from "@/src/components/ui/calendar"
    import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
    import { useDispatch, useSelector } from "react-redux";
    import { fetchUserPaymentDetails } from "@/src/store/slices/paymentSlice";
    import { RootState } from "@/src/store";
    import { AppDispatch } from "@/src/store";
    import { exportUserPaymentsCsv } from "@/src/store/slices/paymentSlice";
    import { Tooltip } from "@/src/components/ui/tooltip";
import { aiStudioTransactionService, AIStudioTransaction } from "@/src/app/apis/aiStudioTransactionService";


    import {
        Search,
        Filter,
        Download,
        CreditCard,
        ArrowUpRight,
        ArrowDownLeft,
        Coins,
        Wallet,
        Clock,
        Menu,
        X,
        CalendarIcon,
    } from "lucide-react"
    import { format } from "date-fns"
    import { cn } from "@/src/lib/utils"

    export default function TransactionHistory() {
        const userId = useSelector((state: RootState) => state.user.profile?.id);
        const dispatch = useDispatch<AppDispatch>();
        const userPayments = useSelector((state: RootState) => state.payment.userPayments);
        const paymentLoading = useSelector((state: RootState) => state.payment.loading);

        // AI Studio transactions state
        const [aiStudioTransactions, setAiStudioTransactions] = useState<AIStudioTransaction[]>([]);
        const [aiStudioLoading, setAiStudioLoading] = useState(false);

        const [fromDate, setFromDate] = useState<Date>()
        const [toDate, setToDate] = useState<Date>()
        const [typeFilter, setTypeFilter] = useState("all")
        const [usageFilter, setUsageFilter] = useState("all")
        const [showFilters, setShowFilters] = useState(false)
        const [searchFocused, setSearchFocused] = useState(false)
        const [methodFilter, setMethodFilter] = useState("app_token");
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 10;

        useEffect(() => {
            if (userId) {
                dispatch(fetchUserPaymentDetails(userId));
            }
        }, [userId, dispatch]);

        // Fetch AI Studio transactions
        useEffect(() => {
            const fetchAIStudioTransactions = async () => {
                if (userId) {
                    setAiStudioLoading(true);
                    try {
                        const response = await aiStudioTransactionService.getAIStudioTransactions(userId);
                        setAiStudioTransactions(response.data.transactions);
                    } catch (error) {
                        console.error('Failed to fetch AI Studio transactions:', error);
                        // Don't show error to user, just log it
                    } finally {
                        setAiStudioLoading(false);
                    }
                }
            };

            fetchAIStudioTransactions();
        }, [userId]);

        useEffect(() => {
            // Set default date range to last 30 days on initial mount
            if (!fromDate && !toDate) {
                const today = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 29); // 29 to include today as the 30th day
                setFromDate(thirtyDaysAgo);
                setToDate(today);
            }
        }, []);

        // Map userPayments to the structure expected by the UI
        const paymentTransactions = (userPayments || [])
            .filter(payment =>
                (payment.forpayment === "buyToken" && payment.paymentMethod === "stripe") ||
                (payment.forpayment === "buyProduct" && payment.paymentMethod === "crypto" || payment.paymentMethod ==="app_token")
            )
            .map((payment, idx) => ({
                id: payment.paymentId || `TXN-${idx + 1}`,
                date: payment.createdAt ? new Date(payment.createdAt).toISOString().slice(0, 10) : "-",
                time: payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString() : "-",
                type:
                    payment.type ||
                    (payment.forpayment === "buyToken" && payment.paymentMethod === "stripe"
                        ? "credit"
                        : payment.forpayment === "buyProduct" &&(payment.paymentMethod === "crypto" || payment.paymentMethod==="app_token") 
                            ? "debit"
                            : "debit"),
                amount: payment.forpayment === "buyToken"
                    ? (
                        payment.appTokensUsed && payment.appTokensUsed > 0
                            ? payment.appTokensUsed
                            : (
                                payment.metadata?.totalAmount ||
                                (Array.isArray(payment.metadata?.orderItems)
                                    ? payment.metadata.orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
                                    : 0
                                )
                            )
                    )
                    : (payment.appTokensUsed || payment.amount || 0),
                method: payment.paymentMethod || "-",
                usage: payment.forpayment === "buyProduct"
                    ? "Buy Product"
                    : payment.forpayment === "buyToken"
                        ? "Buy Token"
                        : payment.forpayment || payment.usage || "-",
                description: payment.description || payment.message || payment.metadata?.description || payment.paymentMethod || "-",
                status: payment.status || "-",
                reference: payment.paymentId || payment.transactionId || `REF-${idx + 1}`,
                source: 'payment' as const
            }));

        // Map AI Studio transactions to the same structure
        const aiStudioTransactionMapped = (aiStudioTransactions || []).map((tx, idx) => ({
            id: tx.id || `AI-${idx + 1}`,
            date: tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 10) : "-",
            time: tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString() : "-",
            type: tx.type === 'deduction' ? 'debit' : 'credit',
            amount: tx.amount || 0,
            method: 'AI Studio',
            usage: 'AI Generation',
            description: tx.description || 'AI Studio token deduction',
            status: 'completed',
            reference: tx.referenceId || `AI-REF-${idx + 1}`,
            source: 'aiStudio' as const
        }));

        // Combine both transaction types
        const transactions = [...paymentTransactions, ...aiStudioTransactionMapped];

        // Filter transactions based on selected filters
        const filteredTransactions = transactions.filter((transaction) => {
            const transactionDate = new Date(transaction.date)
            // Make fromDate and toDate inclusive (cover the whole day)
            let from = fromDate ? new Date(fromDate) : undefined;
            let to = toDate ? new Date(toDate) : undefined;
            if (from) {
                from.setHours(0, 0, 0, 0);
            }
            if (to) {
                to.setHours(23, 59, 59, 999);
            }
            const matchesFromDate = !from || transactionDate >= from;
            const matchesToDate = !to || transactionDate <= to;

            let matchesType = true;
            let matchesUsage = true;
            let matchesMethod = true;

            if (typeFilter === "credit") {
                matchesType = transaction.type === "credit";
                matchesUsage = transaction.usage === "Buy Token";
                matchesMethod = transaction.method === "stripe";
            } else if (typeFilter === "debit") {
                matchesType = transaction.type === "debit";
                matchesUsage = transaction.usage === "Buy Product" || transaction.usage === "AI Generation";
                matchesMethod = transaction.method === "crypto" || transaction.method === "app_token" || transaction.method === "AI Studio";
            } else {
                matchesType = typeFilter === "all" || transaction.type === typeFilter;
                matchesUsage = usageFilter === "all" || transaction.usage === usageFilter;
            }

            return matchesFromDate && matchesToDate && matchesType && matchesUsage && matchesMethod;
        })

        // Calculate pagination
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        const paginatedTransactions = filteredTransactions.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        const totalBalance =
            transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0) -
            transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

        const clearFilters = () => {
            setFromDate(undefined)
            setToDate(undefined)
            setTypeFilter("all")
            setUsageFilter("all")
        }
        const handleExportCsv = () => {
            // Use filteredTransactions for export
            const csvRows = [
                [
                    "ID",
                    "Date",
                    "Time",
                    "Type",
                    "Amount",
                    "Method",
                    "Usage",
                    "Description",
                    "Status",
                    "Reference"
                ],
                ...filteredTransactions.map(txn => [
                    txn.id,
                    txn.date ? `'${txn.date}` : "",
                    txn.time ? `'${txn.time}` : "",
                    txn.type,
                    txn.amount,
                    txn.method,
                    txn.usage,
                    txn.description,
                    txn.status,
                    txn.reference
                ])
            ];
        
            const csvContent = csvRows.map(row =>
                row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
            ).join("\n");
        
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `payments-filtered-${userId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        };

        const handleTypeFilterChange = (value: string) => {
            setTypeFilter(value);
            if (value === "credit") {
                setUsageFilter("Buy Token");
            } else if (value === "debit") {
                setUsageFilter("Buy Product");
            } else if (value === "all") {
                setUsageFilter("all");
            }
        };

        const handleUsageFilterChange = (value: string) => {
            setUsageFilter(value);
            if (value === "Buy Product") {
                setTypeFilter("debit");
            } else if (value === "Buy Token") {
                setTypeFilter("credit");
            } else if (value === "all") {
                setTypeFilter("all");
            }
        };

        // Calculate dynamic days range for badge
        let daysRangeLabel = '';
        if (fromDate && toDate) {
            const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            daysRangeLabel = `Last ${diffDays} days`;
        }

        return (
            <div className="min-h-screen  bg-[var(--color-bg)] p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                    {/* Header Section - Mobile Optimized */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="w-full sm:w-auto">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Transaction History</h1>
                                <p className="text-slate-400 text-sm sm:text-base">View and manage your token transactions</p>
                            </div>

                        </div>
                    </div>

                    {/* Loading Spinner */}
                    {paymentLoading && (
                        <div className="flex justify-center items-center py-10">
                            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            <span className="ml-3 text-cyan-400 text-lg">Loading transactions...</span>
                        </div>
                    )}

                    {/* Filters Section - Mobile Optimized */}
                    <Card className=" bg-[var(--color-bg)] border-slate-700">
                        <CardHeader className="pb-2 sm:pb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                    Filters
                                </CardTitle>

                                {/* Mobile Filter Toggle */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="sm:hidden border-slate-600 text-white hover:bg-slate-700 flex-1"
                                    >
                                        {showFilters ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
                                        {showFilters ? "Hide Filters" : "Show Filters"}
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={handleExportCsv}
                                        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium flex-1 sm:flex-none"
                                    >
                                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        <span className="text-xs sm:text-sm">Export</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className={`space-y-4 ${!showFilters ? "hidden sm:block" : ""}`}>
                            {/* Filter Grid - Mobile Responsive */}
                            <div className="sm:flex sm:justify-end">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 items-end w-full max-w-4xl">
                                    {/* From Date Filter */}
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 sm:hidden ">From Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal  bg-[var(--color-bg)]  text-white hover:bg-slate-600 hover:text-white",
                                                        !fromDate && "text-slate-400",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {fromDate ? format(fromDate, "PPP") : <span>From date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0  bg-[var(--color-bg)] border-slate-600" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={fromDate || undefined}
                                                    onSelect={setFromDate}
                                                    disabled={(date) => date > new Date() || (!!toDate && date > toDate!)}
                                                    className=" bg-[var(--color-bg)] text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* To Date Filter */}
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 sm:hidden">To Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal  bg-[var(--color-bg)]border-slate-600 text-white hover:bg-slate-600 hover:text-white",
                                                        !toDate && "text-slate-400",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {toDate ? format(toDate, "PPP") : <span>To date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0  bg-[var(--color-bg)] border-slate-600" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={toDate || undefined}
                                                    onSelect={setToDate}
                                                    disabled={(date) => date > new Date() || (!!fromDate && date < fromDate!)}
                                                    className=" bg-[var(--color-bg)] text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Transaction Type Filter */}
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 sm:hidden">Transaction Type</label>
                                        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                                            <SelectTrigger className=" bg-[var(--color-bg)] border-slate-600 text-white text-sm sm:text-base">
                                                <SelectValue placeholder="Transaction Type" />
                                            </SelectTrigger>
                                            <SelectContent className=" bg-[var(--color-bg)] border-slate-600">
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="all">
                                                    Payment Types
                                                </SelectItem>
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="credit">
                                                    Credit
                                                </SelectItem>
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="debit">
                                                    Debit
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Usage Type Filter */}
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 sm:hidden">Usage Type</label>
                                        <Select value={usageFilter} onValueChange={handleUsageFilterChange}>
                                            <SelectTrigger className=" bg-[var(--color-bg)] border-slate-600 text-white text-sm sm:text-base">
                                                <SelectValue placeholder="Usage Type" />
                                            </SelectTrigger>
                                            <SelectContent className=" bg-[var(--color-bg)] border-slate-600">
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="all">
                                                    Transaction usage
                                                </SelectItem>
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="Buy Product">
                                                    Buy Product
                                                </SelectItem>
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="Buy Token">
                                                    Buy Token
                                                </SelectItem>
                                                <SelectItem className="text-white focus:bg-white focus:text-[var(--color-bg)] hover:bg-white hover:text-[var(--color-bg)]" value="AI Generation">
                                                    AI Generation
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                   {/* Clear Filters Button - Mobile Optimized */}
                            <div className="flex justify-center sm:justify-end pt-2 gap-2 ml-4 mb-[2px]">
                                <Tooltip content="Clear Filters">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="border-slate-600 text-white  w-full sm:w-auto bg-transparent"
                                    >
                                        X
                                    </Button>
                                </Tooltip>
                            </div>
                            </div>

                         
                        </CardContent>
                    </Card>

                    {/* Transactions Section - Mobile Optimized */}
                    <Card className=" bg-[var(--color-bg)] border-slate-700">
                        <CardHeader className="pb-2 sm:pb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                                <CardTitle className="text-white text-lg sm:text-xl">
                                    Recent Transactions ({filteredTransactions.length})
                                </CardTitle>
                                <Badge className=" bg-[var(--color-bg)] text-slate-300 text-xs sm:text-sm">
                                    {daysRangeLabel}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {paginatedTransactions.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400 text-base sm:text-lg">No transactions found</p>
                                        <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                                    </div>
                                ) : (
                                    paginatedTransactions.map((transaction) => (
                                        <div key={transaction.id} className=" bg-[var(--color-bg)] rounded-lg p-3 sm:p-4 border border-slate-600">
                                            {/* New heading for transaction summary */}
                                            <div className="mb-2">
                                                <div className="text-base font-bold text-white">
                                                    {transaction.usage}
                                                </div>

                                            </div>
                                            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between sm:gap-4">
                                                {/* Transaction Info - Mobile Optimized */}
                                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                                                    <div
                                                        className={`p-2 rounded-full flex-shrink-0 ${transaction.type === "credit"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : "bg-red-500/20 text-red-400"
                                                            }`}
                                                    >
                                                        {transaction.type === "credit" ? (
                                                            <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        ) : (
                                                            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white font-medium text-sm sm:text-base truncate pr-2">
                                                            {transaction.description}
                                                        </h3>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-400 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">
                                                                    {transaction.date} at {transaction.time}
                                                                </span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{transaction.method}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{transaction.type}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Transaction Details - Mobile Optimized */}
                                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                                    <div className="text-left sm:text-right">
                                                        <p
                                                            className={`text-base sm:text-lg font-bold ${transaction.type === "credit" ? "text-green-400" : "text-red-400"
                                                                }`}
                                                        >
                                                            {transaction.type === "credit" ? "+" : "-"}
                                                            {transaction.amount.toLocaleString()} tokens
                                                        </p>
                                                        <p className="text-xs text-slate-400">{transaction.reference}</p>
                                                    </div>

                                                    <Badge
                                                        className={`text-xs flex-shrink-0 ${transaction.status === "completed"
                                                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                            }`}
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination - Mobile Optimized */}
                            {totalPages > 1 && (
                                <div className="flex justify-end mt-4 sm:mt-6">
                                    <div className="flex gap-1 sm:gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-600 text-slate-300  bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Prev
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <Button
                                                key={i + 1}
                                                size="sm"
                                                className={`px-2 sm:px-3 ${currentPage === i + 1 ? "bg-cyan-500 hover:bg-cyan-600 text-slate-900" : "border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent text-xs sm:text-sm"}`}
                                                onClick={() => setCurrentPage(i + 1)}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-600 text-slate-300  bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }