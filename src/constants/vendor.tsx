import { Icons } from "@/src/core/icons";
export interface VendorBenefit {
    id: number;
    heading: string;
    description: string;
    icon: keyof typeof Icons;
    iconBgColor: string;
    iconColor: string;
}


export const vendorBenefits: VendorBenefit[] = [
    {
        id: 1,
        heading: "Token Payments",
        description: "Accept our platform tokens as payment and tap into our gaming community's economy.",
        icon: "token",
        iconBgColor: "bg-[var(--color-primary)]/20",
        iconColor: "text-[var(--color-primary)]"
    },
    {
        id: 2,
        heading: "NFT Discounts",
        description: "Offer special discounts to NFT holders and create exclusive product offerings.",
        icon: "tag",
        iconBgColor: "bg-purple-500/20",
        iconColor: "text-purple-400"
    },
    {
        id: 3,
        heading: "Gaming Marketplace",
        description: "Reach a dedicated community of gamers looking for quality products and experiences.",
        icon: "shoppingBag",
        iconBgColor: "bg-green-500/20",
        iconColor: "text-green-400"
    }
];