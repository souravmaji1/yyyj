"use client";

import { useState, useEffect } from "react";
import { subscriptionService } from "@/src/app/apis/subscriptionService";
import type { SubscriptionPackage } from "@/src/app/apis/subscriptionService";
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
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

interface SubscriptionCardProps {
  package: SubscriptionPackage;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSubscribe: () => void;
  disabled: boolean;
}

const SubscriptionCard = ({
  package: pkg,
  isCurrentPlan,
  isPopular,
  onSubscribe,
  disabled,
}: SubscriptionCardProps) => {
  return (
    <Card
      className={`relative bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 ${isPopular ? "ring-2 ring-blue-500" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="h-3 w-3" />
            Popular
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{pkg.name}</span>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {pkg.currency === "USD" ? "$" : pkg.currency}
              {pkg.price}
            </div>
            <div className="text-sm text-slate-400">/{pkg.duration} days</div>
          </div>
        </CardTitle>
        {pkg.description && (
          <CardDescription>{pkg.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Features */}
          {pkg.features.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Package Details */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>{pkg.duration} days duration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <DollarSign className="h-4 w-4" />
              <span>
                {pkg.currency} {pkg.price}
              </span>
            </div>
          </div>

          {/* Subscribe Button */}
          <Button
            className="w-full mt-4"
            onClick={onSubscribe}
            disabled={disabled || isCurrentPlan}
            variant={isPopular ? "default" : "outline"}
          >
            {disabled ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : isCurrentPlan ? (
              "Current Plan"
            ) : (
              "Subscribe"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PricingPage = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const packagesData = await subscriptionService.getAvailablePackages();
      setPackages(packagesData);
    } catch (err) {
      setError("Failed to load pricing packages");
      console.error("Error loading packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      setSubscribingTo(priceId);
      setError(null);

      const checkoutUrl = await subscriptionService.createCheckoutSession(
        priceId,
        `${window.location.origin}/subscription?success=true`
      );

      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError("Failed to start subscription process");
      console.error("Error creating checkout:", err);
    } finally {
      setSubscribingTo(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : currency;
    return `${symbol}${price}`;
  };

  const getDurationText = (duration: number) => {
    if (duration === 30) return "Monthly";
    if (duration === 365) return "Yearly";
    if (duration === 7) return "Weekly";
    return `${duration} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <span className="ml-2 text-slate-300">
              Loading pricing plans...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Select the perfect plan for your needs. Upgrade or downgrade at
              any time.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-8 border-red-500/30 bg-red-900/20 max-w-2xl mx-auto">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Pricing Cards */}
          {packages.length === 0 ? (
            <Card className="max-w-md mx-auto bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
              <CardContent className="text-center py-16">
                <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  No Plans Available
                </h3>
                <p className="text-slate-400">
                  We're working on bringing you amazing subscription plans.
                  Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <SubscriptionCard
                  key={pkg.id}
                  package={pkg}
                  isCurrentPlan={false}
                  isPopular={pkg.isPopular}
                  onSubscribe={() => handleSubscribe(pkg.priceId)}
                  disabled={subscribingTo === pkg.priceId}
                />
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I change my plan later?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    Yes! You can upgrade or downgrade your plan at any time.
                    Changes will be reflected in your next billing cycle.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    What payment methods do you accept?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    We accept all major credit cards, debit cards, and digital
                    wallets through our secure payment processor.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I cancel my subscription?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    Absolutely! You can cancel your subscription at any time
                    from your account settings. You'll continue to have access
                    until the end of your current billing period.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-700">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to get started?
                </h2>
                <p className="text-xl mb-8 text-slate-300">
                  Join thousands of satisfied customers and take your experience
                  to the next level.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-3"
                  onClick={() => {
                    const popularPackage = packages.find(
                      (pkg) => pkg.isPopular
                    );
                    if (popularPackage) {
                      handleSubscribe(popularPackage.priceId);
                    }
                  }}
                  disabled={
                    !packages.some((pkg) => pkg.isPopular) ||
                    subscribingTo !== null
                  }
                >
                  {subscribingTo ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
