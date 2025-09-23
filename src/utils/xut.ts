export const XUT_LABEL = "X Universe Token";
export const BASE_XUT_PER_USD = 1000; // assumption from example; change to 1000 if required

export type BonusTier = 0 | 0.10 | 0.15 | 0.20;

export function xutForUsd(usd: number, bonus: BonusTier = 0) {
  const base = usd * BASE_XUT_PER_USD;
  const total = Math.round(base * (1 + bonus));
  return { base, bonusAmount: total - base, total };
}
