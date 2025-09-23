/**
 * Subscription Service
 * Handles subscription management, billing, and package operations
 */

import authAxiosClient from "./auth/axios";

// Types for Subscription API
export interface SubscriptionStatus {
  id?: string;
  userId: string;
  status: "active" | "inactive" | "cancelled" | "expired" | "trial";
  planId?: string;
  planName?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  daysRemaining?: number;
  autoRenew?: boolean;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
  isPopular?: boolean;
  priceId: string;
}

export interface CreateCheckoutRequest {
  priceId: string;
  redirectUrl: string;
}

export interface CreateCheckoutResponse {
  status: boolean;
  message: string;
  data: {
    checkoutUrl: string;
  };
}

export interface CheckSubscriptionResponse {
  status: boolean;
  message: string;
  data: SubscriptionStatus;
}

export interface GetPackagesResponse {
  status: boolean;
  message: string;
  data: SubscriptionPackage[];
}

export interface CancelSubscriptionResponse {
  status: boolean;
  message: string;
  data?: any;
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
  priceId: string;
  isPopular?: boolean;
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  duration?: number;
  features?: string[];
  priceId?: string;
  isPopular?: boolean;
}

export interface PackageResponse {
  status: boolean;
  message: string;
  data: SubscriptionPackage;
}

// Subscription Service Class
class SubscriptionService {
  private basePath = "/subscription";

  // Check user subscription status
  async checkSubscription(): Promise<SubscriptionStatus> {
    try {
      const response = await authAxiosClient.get(
        `${this.basePath}/check-subscription`
      );
      const data = response.data.data;

      // Transform the nested structure to match the expected interface
      if (data.subscription) {
        return {
          id: data.subscription.id,
          userId: data.subscription.userId || "",
          status: data.subscription.status as
            | "active"
            | "inactive"
            | "cancelled"
            | "expired"
            | "trial",
          planId: data.subscription.package?.id,
          planName: data.subscription.package?.name,
          startDate: data.subscription.startDate,
          endDate: data.subscription.endDate,
          isActive: data.isActive,
          daysRemaining: data.subscription.daysRemaining,
          autoRenew: data.subscription.autoRenew,
        };
      }

      // Fallback for cases where subscription is null
      return {
        userId: "",
        status: "inactive",
        isActive: false,
      };
    } catch (error) {
      console.error("Error checking subscription:", error);
      throw error;
    }
  }

  // Create checkout session for subscription
  async createCheckout(data: CreateCheckoutRequest): Promise<string> {
    try {
      const response = await authAxiosClient.post<CreateCheckoutResponse>(
        `${this.basePath}/create-checkout`,
        data
      );
      return response.data.data.checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }
  }

  // Get available subscription packages (public endpoint)
  async getPackages(): Promise<SubscriptionPackage[]> {
    try {
      const response = await authAxiosClient.get<any>(
        `${this.basePath}/get-packages`
      );

      // Handle the new API response structure
      const packagesData = response.data.data.packages;
      const allPackages = [];

      // Combine monthly and yearly packages
      if (packagesData.monthly && Array.isArray(packagesData.monthly)) {
        allPackages.push(...packagesData.monthly);
      }
      if (packagesData.yearly && Array.isArray(packagesData.yearly)) {
        allPackages.push(...packagesData.yearly);
      }

      // Transform the packages to match the expected interface
      return allPackages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: parseFloat(pkg.price),
        currency: pkg.currency,
        duration:
          pkg.type === "monthly" ? 30 : pkg.type === "yearly" ? 365 : 30,
        features: pkg.featuresList || [],
        isPopular: pkg.isPopular || false,
        priceId: pkg.priceId,
      }));
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  }

  // Cancel user subscription
  async cancelSubscription(): Promise<{ message: string; data?: any }> {
    try {
      const response = await authAxiosClient.post<CancelSubscriptionResponse>(
        `${this.basePath}/cancel-subscription`
      );
      return {
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  // Helper method to check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.checkSubscription();
      return subscription.isActive;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }

  // Helper method to get subscription details with error handling
  async getSubscriptionDetails(): Promise<SubscriptionStatus | null> {
    try {
      return await this.checkSubscription();
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      return null;
    }
  }

  // Helper method to create checkout with validation
  async createCheckoutSession(
    priceId: string,
    redirectUrl?: string
  ): Promise<string> {
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    const defaultRedirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard`
        : "/dashboard";

    return this.createCheckout({
      priceId,
      redirectUrl: redirectUrl || defaultRedirectUrl,
    });
  }

  // Helper method to get packages with error handling
  async getAvailablePackages(): Promise<SubscriptionPackage[]> {
    try {
      return await this.getPackages();
    } catch (error) {
      console.error("Error fetching subscription packages:", error);
      return [];
    }
  }

  // Helper method to cancel subscription with confirmation
  async cancelUserSubscription(): Promise<boolean> {
    try {
      const result = await this.cancelSubscription();
      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }

  // Package Management Methods

  // Create a new subscription package
  async createPackage(
    data: CreatePackageRequest
  ): Promise<SubscriptionPackage> {
    try {
      const response = await authAxiosClient.post<PackageResponse>(
        `${this.basePath}/packages`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  }

  // Update an existing subscription package
  async updatePackage(
    packageId: string,
    data: UpdatePackageRequest
  ): Promise<SubscriptionPackage> {
    try {
      const response = await authAxiosClient.put<PackageResponse>(
        `${this.basePath}/packages/${packageId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating package:", error);
      throw error;
    }
  }

  // Delete a subscription package
  async deletePackage(packageId: string): Promise<{ message: string }> {
    try {
      const response = await authAxiosClient.delete(
        `${this.basePath}/packages/${packageId}`
      );
      return {
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }

  // Get a specific package by ID
  async getPackageById(packageId: string): Promise<SubscriptionPackage> {
    try {
      const response = await authAxiosClient.get<PackageResponse>(
        `${this.basePath}/packages/${packageId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching package details:", error);
      throw error;
    }
  }

  // Helper method to create package with validation
  async createSubscriptionPackage(
    packageData: CreatePackageRequest
  ): Promise<SubscriptionPackage> {
    if (!packageData.name || !packageData.price || !packageData.priceId) {
      throw new Error("Missing required fields: name, price, and priceId");
    }

    return this.createPackage(packageData);
  }

  // Helper method to update package with error handling
  async updateSubscriptionPackage(
    packageId: string,
    packageData: UpdatePackageRequest
  ): Promise<SubscriptionPackage | null> {
    try {
      return await this.updatePackage(packageId, packageData);
    } catch (error) {
      console.error("Error updating package:", error);
      return null;
    }
  }

  // Helper method to delete package with confirmation
  async deleteSubscriptionPackage(packageId: string): Promise<boolean> {
    try {
      await this.deletePackage(packageId);
      return true;
    } catch (error) {
      console.error("Error deleting package:", error);
      return false;
    }
  }

  // Helper method to get package by ID with error handling
  async getPackageDetails(
    packageId: string
  ): Promise<SubscriptionPackage | null> {
    try {
      return await this.getPackageById(packageId);
    } catch (error) {
      console.error("Error fetching package details:", error);
      return null;
    }
  }
}

// Create and export singleton instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;
export { subscriptionService };
