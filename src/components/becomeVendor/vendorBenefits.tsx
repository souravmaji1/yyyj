import { VendorBenefit } from "@/src/constants/vendor";
import { Icons } from "@/src/core/icons";

interface VendorBenefitsProps extends Pick<VendorBenefit, 'heading' | 'description' | 'icon' | 'iconBgColor' | 'iconColor'> { }

const VendorBenefits = ({ heading, description, icon, iconBgColor, iconColor }: VendorBenefitsProps) => {
    const Icon = Icons[icon];
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-[var(--color-primary)]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10">
            <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h3 className="text-white font-medium mb-2">{heading}</h3>
            <p className="text-gray-300 text-sm">
                {description}
            </p>
        </div>
    )
}

export default VendorBenefits;