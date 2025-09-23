import { xutForUsd, type BonusTier } from '@/src/utils/xut';

export type TokenPackage = {
  id: string;
  name: string;
  usd: number;
  bonus: BonusTier;
  perks?: string[];
  badge?: string;
  image: string;
  popular?: boolean;
  href?: string;
  ariaLabel?: string;
};

export type SubscriptionPlan = {
  id: 'creator_dev' | 'professional';
  name: string;
  monthlyUSD: number;
  bonus: BonusTier;
  perks?: string[];
  badge?: string;
  billingNote?: string;
  href?: string;
  ariaLabel?: string;
};

const PACKAGES = [
  { usd: 25,  bonus: 0.10 as BonusTier },
  { usd: 50,  bonus: 0.10 as BonusTier },
  { usd: 100, bonus: 0.10 as BonusTier }, // example yields 1100 XUT
  { usd: 250, bonus: 0.15 as BonusTier },
  { usd: 500, bonus: 0.15 as BonusTier },
  { usd: 1000, bonus: 0.20 as BonusTier },
];

// Transform to new format with computed XUT values
export const tokenPackages: TokenPackage[] = [
  {
    id: "token_25",
    name: "Starter Pack",
    usd: 25,
    bonus: 0.10,
    perks: ["Perfect for beginners", "Instant delivery"],
    image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=500&auto=format&fit=crop&q=60",
    popular: false
  },
  {
    id: "token_50",
    name: "Hobby Pack",
    usd: 50,
    bonus: 0.10,
    perks: ["Great for casual use", "Quick start bonus"],
    image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
    popular: false
  },
  {
    id: "token_100",
    name: "Creator Pack",
    usd: 100,
    bonus: 0.10,
    perks: ["Perfect for creators", "Priority support"],
    badge: "Most Popular",
    image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
    popular: true
  },
  {
    id: "token_250",
    name: "Pro Pack",
    usd: 250,
    bonus: 0.15,
    perks: ["Enhanced bonus", "Premium features"],
    badge: "Great Value",
    image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
    popular: false
  },
  {
    id: "token_500",
    name: "Business Pack",
    usd: 500,
    bonus: 0.15,
    perks: ["Best for teams", "Advanced tools"],
    image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
    popular: false
  },
  {
    id: "token_1000",
    name: "Enterprise Pack",
    usd: 1000,
    bonus: 0.20,
    perks: ["Maximum bonus", "Enterprise support"],
    badge: "Best Deal",
    image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
    popular: false
  }
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'creator_dev',
    name: 'Creator / Game Dev',
    monthlyUSD: 4.99,
    bonus: 0.10,
    perks: ['Monthly XUT drop', 'Creator perks', 'Community access'],
    badge: 'Great for Starters',
    billingNote: 'Cancel anytime',
    href: '/subscribe?plan=creator_dev'
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyUSD: 9.99,
    bonus: 0.15,
    perks: ['Higher XUT allocation', 'Priority support', 'Exclusive features', 'Advanced tools'],
    badge: 'Best Value',
    billingNote: 'Cancel anytime',
    href: '/subscribe?plan=professional'
  }
];