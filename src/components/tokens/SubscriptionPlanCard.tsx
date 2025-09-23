"use client";

import Link from "next/link";
import { SubscriptionPlan } from "@/src/lib/tokens-config";
import { Icons } from "@/src/core/icons";
import { xutForUsd, XUT_LABEL } from "@/src/utils/xut";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
}

export function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
  const { base, bonusAmount, total } = xutForUsd(plan.monthlyUSD, plan.bonus);
  
  return (
    <Link
      href={plan.href || `/subscribe?plan=${plan.id}`}
      aria-label={`Subscribe to ${plan.name} plan for $${plan.monthlyUSD} per month (${total.toLocaleString()} ${XUT_LABEL})`}
      className="group block rounded-xl border border-[#667085]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-all duration-200 overflow-hidden hover:scale-105 h-full"
    >
      <article className="relative bg-[var(--color-surface)]/50 backdrop-blur-sm rounded-xl h-full flex flex-col">
        {plan.badge && (
          <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            {plan.badge}
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-white">
                ${plan.monthlyUSD}
              </span>
              <span className="text-white/60 text-sm">/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.token className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-xl font-bold text-[var(--color-primary)]">
                {total.toLocaleString()}
              </span>
              <span className="text-white/80 text-sm" aria-label={`${XUT_LABEL} per month`}>
                XUT per month
              </span>
            </div>
            {plan.bonus > 0 && (
              <p className="mt-2 text-xs text-green-400">
                Includes {(plan.bonus*100)|0}% bonus 
                <span className="sr-only">({bonusAmount} extra {XUT_LABEL} per month)</span>
              </p>
            )}
          </div>

          {plan.perks && plan.perks.length > 0 && (
            <div className="mb-6 flex-1">
              <ul className="space-y-2 h-full">
                {plan.perks.map((perk, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                    <Icons.check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {perk}
                  </li>
                ))}
                {/* Add empty items to ensure consistent height */}
                {Array.from({ length: Math.max(0, 4 - plan.perks.length) }).map((_, index) => (
                  <li key={`empty-${index}`} className="h-6" />
                ))}
              </ul>
            </div>
          )}

          {plan.billingNote && (
            <div className="text-xs text-white/60 text-center mt-auto">
              {plan.billingNote}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}