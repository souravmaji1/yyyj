"use client";

import { useState, useEffect } from "react";
import { subscriptionService } from "@/src/app/apis/subscriptionService";
import type { SubscriptionStatus } from "@/src/app/apis/subscriptionService";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Settings,
  Receipt,
} from "lucide-react";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  description: string;
  invoiceUrl?: string;
}

const BillingPage = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const subscriptionData =
        await subscriptionService.getSubscriptionDetails();
      setSubscription(subscriptionData);
    } catch (err) {
      setError("Failed to load billing information");
      console.error("Error loading billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll lose access at the end of your current billing period."
      )
    ) {
      return;
    }

    try {
      setActionLoading("cancel");
      setError(null);

      const success = await subscriptionService.cancelUserSubscription();
      if (success) {
        setSuccess(
          "Subscription cancelled successfully. You'll continue to have access until the end of your current billing period."
        );
        loadBillingData();
      } else {
        setError("Failed to cancel subscription");
      }
    } catch (err) {
      setError("Failed to cancel subscription");
      console.error("Error cancelling subscription:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "trial":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "cancelled":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "expired":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "trial":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "cancelled":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      case "expired":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-slate-400 bg-slate-500/20 border-slate-500/30";
    }
  };

  const getBillingStatusIcon = (status: "paid" | "pending" | "failed") => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getBillingStatusColor = (status: "paid" | "pending" | "failed") => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-500/20";
      case "pending":
        return "text-yellow-400 bg-yellow-500/20";
      case "failed":
        return "text-red-400 bg-red-500/20";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <span className="ml-2 text-slate-300">
              Loading billing information...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <Button
              variant="outline"
              onClick={loadBillingData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-6 border-red-500/30 bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500/30 bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Subscription */}
            <div className="lg:col-span-2">
              <Card className="mb-8 bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(subscription.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}
                          >
                            {subscription.status.charAt(0).toUpperCase() +
                              subscription.status.slice(1)}
                          </span>
                        </div>
                        {subscription.isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleCancelSubscription}
                            disabled={actionLoading === "cancel"}
                          >
                            {actionLoading === "cancel" ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Cancel Subscription
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscription.planName && (
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">
                              Current Plan
                            </p>
                            <p className="font-semibold text-lg">
                              {subscription.planName}
                            </p>
                          </div>
                        )}

                        {subscription.startDate && (
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">
                              Started
                            </p>
                            <p className="font-semibold">
                              {new Date(
                                subscription.startDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        {subscription.endDate && (
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">
                              {subscription.status === "cancelled"
                                ? "Access Until"
                                : "Next Billing"}
                            </p>
                            <p className="font-semibold">
                              {new Date(
                                subscription.endDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        {subscription.daysRemaining !== undefined && (
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">
                              Days Remaining
                            </p>
                            <p className="font-semibold text-lg">
                              {subscription.daysRemaining} days
                            </p>
                          </div>
                        )}
                      </div>

                      {subscription.autoRenew !== undefined && (
                        <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-renewal</p>
                            <p className="text-sm text-slate-400">
                              {subscription.autoRenew
                                ? "Your subscription will automatically renew"
                                : "Auto-renewal is disabled"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-100 mb-2">
                        No Active Subscription
                      </h3>
                      <p className="text-slate-400 mb-6">
                        You don't have an active subscription. Choose a plan to
                        get started.
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/pricing")}
                      >
                        View Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = "/pricing")}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    View All Plans
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = "/subscription")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={loadBillingData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>

              {/* Billing Summary */}
              {subscription && (
                <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className="font-medium capitalize">
                        {subscription.status}
                      </span>
                    </div>

                    {subscription.endDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Billing</span>
                        <span className="font-medium">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {subscription.daysRemaining !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Days Left</span>
                        <span className="font-medium">
                          {subscription.daysRemaining}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Support */}
              <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">
                    Have questions about your billing or subscription? We're
                    here to help.
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
