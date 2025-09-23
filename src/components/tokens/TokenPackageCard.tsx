"use client";

import { TokenPackage } from "@/src/lib/tokens-config";
import { Icons } from "@/src/core/icons";
import { xutForUsd, XUT_LABEL } from "@/src/utils/xut";

interface TokenPackageCardProps {
  package: TokenPackage;
  onSelect?: (pkg: TokenPackage) => void;
}

export function TokenPackageCard({ package: pkg, onSelect }: TokenPackageCardProps) {
  const { base, bonusAmount, total } = xutForUsd(pkg.usd, pkg.bonus);
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(pkg);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      aria-label={`Purchase ${total.toLocaleString()} ${XUT_LABEL} for $${pkg.usd} (${(pkg.bonus*100)|0}% bonus)`}
      className="group block rounded-xl border border-[var(--color-border)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--focus-ring)] hover:border-[var(--color-primary)]/30 transition-all duration-200 overflow-hidden motion-hover-scale w-full text-left"
    >
      <article className="relative bg-[var(--color-card)]/50 backdrop-blur-sm rounded-xl motion-fade-up">
        {pkg.badge && (
          <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-[var(--shadow-sm)]">
            {pkg.badge}
          </div>
        )}

        <div className="aspect-video relative">
          <img
            src={pkg.image}
            alt={`${total.toLocaleString()} ${XUT_LABEL} Tokens Package`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] to-transparent" />
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">{pkg.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Icons.token className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-2xl font-bold text-[var(--color-primary)]">
                {total.toLocaleString()}
              </span>
              <span className="text-[var(--color-muted)]" aria-label={XUT_LABEL}>XUT</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-foreground)]">
              ${pkg.usd}
            </div>
            {pkg.bonus > 0 && (
              <p className="mt-2 text-xs text-[var(--color-success)]">
                Includes {(pkg.bonus*100)|0}% bonus 
                <span className="sr-only">({bonusAmount} extra {XUT_LABEL})</span>
              </p>
            )}
          </div>

          {pkg.perks && pkg.perks.length > 0 && (
            <div className="mb-4">
              <ul className="space-y-1">
                {pkg.perks.map((perk, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <Icons.check className="h-4 w-4 text-[var(--color-success)] flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </button>
  );
}