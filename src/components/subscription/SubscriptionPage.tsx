"use client";

import { useState, useEffect } from "react";
import { subscriptionService } from "@/src/app/apis/subscriptionService";
import type {
  SubscriptionStatus,
  SubscriptionPackage,
} from "@/src/app/apis/subscriptionService";
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
  Package,
  DollarSign,
  Calendar,
  Star,
  Loader2,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  AlertTriangle,
} from "lucide-react";

interface SubscriptionStatusComponentProps {
  subscription: SubscriptionStatus | null;
  onRefresh: () => void;
  onCancel: () => void;
  loading: boolean;
}

const SubscriptionStatusComponent = ({
  subscription,
  onRefresh,
  onCancel,
  loading,
}: SubscriptionStatusComponentProps) => {
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

  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <CreditCard className="h-5 w-5 text-slate-300" />
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                {subscription.isActive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscription.planName && (
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-300 mb-1">Current Plan</p>
                  <p className="font-semibold text-lg text-slate-100">
                    {subscription.planName}
                  </p>
                </div>
              )}

              {subscription.startDate && (
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-300 mb-1">Started</p>
                  <p className="font-semibold text-slate-100">
                    {new Date(subscription.startDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}

              {subscription.endDate && (
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-300 mb-1">
                    {subscription.status === "cancelled"
                      ? "Access Until"
                      : "Next Billing"}
                  </p>
                  <p className="font-semibold text-slate-100">
                    {new Date(subscription.endDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}

              {subscription.daysRemaining !== undefined && (
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-300 mb-1">Days Remaining</p>
                  <p className="font-semibold text-lg text-slate-100">
                    {subscription.daysRemaining} days
                  </p>
                </div>
              )}
            </div>

            {subscription.autoRenew !== undefined && (
              <div className="flex items-center justify-between p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div>
                  <p className="font-medium text-slate-100">Auto-renewal</p>
                  <p className="text-sm text-slate-300">
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
              You don't have an active subscription. Choose a plan to get
              started.
            </p>
            <Button onClick={() => (window.location.href = "/pricing")}>
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subscription status and packages in parallel
      const [subscriptionData, packagesData] = await Promise.all([
        subscriptionService.getSubscriptionDetails(),
        subscriptionService.getAvailablePackages(),
      ]);

      setSubscription(subscriptionData);
      setPackages(packagesData);
    } catch (err) {
      setError("Failed to load subscription data");
      console.error("Error loading subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      setActionLoading(priceId);
      setError(null);

      const checkoutUrl = await subscriptionService.createCheckoutSession(
        priceId,
        `${window.location.origin}/subscription?success=true`
      );

      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError("Failed to create checkout session");
      console.error("Error creating checkout:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      setActionLoading("cancel");
      setError(null);

      const success = await subscriptionService.cancelUserSubscription();
      if (success) {
        setSuccess("Subscription cancelled successfully");
        loadSubscriptionData(); // Reload data
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
      case "expired":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/20";
      case "trial":
        return "text-blue-400 bg-blue-500/20";
      case "cancelled":
      case "expired":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <span className="ml-2 text-slate-300">
              Loading subscription data...
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
          <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

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

          {/* Current Subscription Status */}
          <div className="mb-8">
            <SubscriptionStatusComponent
              subscription={subscription}
              onRefresh={loadSubscriptionData}
              onCancel={handleCancelSubscription}
              loading={actionLoading === "cancel"}
            />
          </div>

          {/* Available Packages */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-100">
              Available Plans
            </h2>

            {packages.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No subscription packages available
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`relative bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 ${pkg.isPopular ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {pkg.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Popular
                        </span>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-slate-100">
                        <span>{pkg.name}</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-100">
                            {pkg.currency === "USD" ? "$" : pkg.currency}
                            {pkg.price}
                          </div>
                          <div className="text-sm text-slate-400">
                            /{pkg.duration} days
                          </div>
                        </div>
                      </CardTitle>
                      {pkg.description && (
                        <CardDescription className="text-slate-300">
                          {pkg.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Features */}
                        {pkg.features.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-slate-200">
                              Features:
                            </h4>
                            <ul className="space-y-1">
                              {pkg.features.map((feature, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-slate-300"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Package Details */}
                        <div className="pt-4 border-t border-slate-700 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{pkg.duration} days duration</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span>
                              {pkg.currency} {pkg.price}
                            </span>
                          </div>
                        </div>

                        {/* Subscribe Button */}
                        <Button
                          className="w-full mt-4"
                          onClick={() => handleSubscribe(pkg.priceId)}
                          disabled={
                            actionLoading === pkg.priceId ||
                            (subscription?.isActive &&
                              subscription.planId === pkg.id)
                          }
                          variant={pkg.isPopular ? "default" : "outline"}
                        >
                          {actionLoading === pkg.priceId ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : subscription?.isActive &&
                            subscription.planId === pkg.id ? (
                            "Current Plan"
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadSubscriptionData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
