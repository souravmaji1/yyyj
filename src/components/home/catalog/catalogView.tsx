import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CatalogViewProps {
    href: string;
    title: string;
    icon: LucideIcon;
    titleIcon?: LucideIcon;
}

const CatalogView = ({ href, title, icon: Icon, titleIcon: TitleIcon }: CatalogViewProps) => {
    return (
        <div className="mt-3 relative">
            <Link href={href}>
                <div className="group relative h-16 bg-gradient-to-r from-[var(--color-surface)]/80 to-[var(--color-surface)]/80 rounded-xl overflow-hidden border border-[#667085]/30 hover:border-[var(--color-primary)]/30 transition-all duration-300 cursor-pointer">
                    {/* Background gradient that slides up on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>

                    {/* Content that stays visible */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                        <span className="text-white font-medium flex items-center">
                            {TitleIcon && <TitleIcon className="mr-2 h-5 w-5" />}
                            {title}
                        </span>

                        {/* Arrow icon that animates on hover */}
                        <div className="w-8 h-8 rounded-full bg-[#667085]/30 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                            <Icon className="w-4 h-4 text-white transform rotate-90 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default CatalogView;