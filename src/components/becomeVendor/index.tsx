"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Icons } from "@/src/core/icons";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import VendorBenefits from "./vendorBenefits";
import { vendorBenefits } from "@/src/constants/vendor";
import { VendorBenefit } from "@/src/constants/vendor";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";


const INITIAL_FORM_STATE = {
    businessName: "",
    businessAddress: "",
    businessEmail: "",
    supportId: "",
    contactNumber: "",
    storefront: "",
    applied: "",
    paymentPlan: "",
    shopifyIntegration: "no",
    acceptsTokens: false,
    nftDiscounts: false,
    description: "",
    agreeToTerms: false,
};

const VendorRegistrationPage = () => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { showError, showSuccess } = useNotificationUtils();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { id, value } = e.target;
            setFormData((prev) => ({ ...prev, [id]: value }));
        },
        []
    );

    const handleSelectChange = useCallback((id: string, value: string) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [id]: checked }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.agreeToTerms) {
            showError('Terms Required', 'You must agree to the terms and conditions');
            return;
        }

        try {
            setIsSubmitting(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showSuccess('Registration Submitted', 'Vendor registration submitted successfully!');
            router.push("/");
        } catch (error) {
            console.error("Failed to submit registration:", error);
            showError('Registration Failed', 'Failed to submit registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInputField = (
        id: keyof typeof INITIAL_FORM_STATE,
        label: string,
        type: string = "text",
        placeholder?: string,
        required = true
    ) => (
        <div className="space-y-1 sm:space-y-2">
            <Label htmlFor={id} className="text-gray-200 text-xs sm:text-sm font-medium">
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                className="bg-white/5 text-white placeholder:text-gray-400 border-white/10 focus:border-[var(--color-primary)] transition-all duration-200 focus:ring-1 focus:ring-[var(--color-primary)] h-10 sm:h-11"
                required={required}
                value={typeof formData[id] === 'boolean' ? '' : formData[id] as string}
                onChange={handleChange}
            />
        </div>
    );

    return (
        <>
            <div className="bg-[var(--color-surface)] min-h-screen">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('/gaming-pattern.svg')] opacity-10" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
                    <div className="max-w-4xl mx-auto pt-16">
                        <Card className="rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Join
                                </CardTitle>
                                <CardDescription className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
                                    Join the Intelliverse-X ecosystem and sell your products to our gaming community
                                </CardDescription>
                                <div className="flex justify-center gap-2 mt-4">
                                    <Badge className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                                        <Icons.token className="w-3 h-3 mr-1" /> Token Payments
                                    </Badge>
                                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/20">
                                        <Icons.tag className="w-3 h-3 mr-1" /> NFT Discounts
                                    </Badge>
                                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/20">
                                        <Icons.shoppingBag className="w-3 h-3 mr-1" /> Gaming Products
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        {renderInputField("businessName", "Business Name")}
                                        {renderInputField("businessAddress", "Business Address")}
                                        {renderInputField("businessEmail", "Business Email", "email")}
                                        {renderInputField("supportId", "Business Support ID")}
                                        {renderInputField("contactNumber", "Contact Number", "tel")}
                                        {renderInputField("storefront", "Existing Storefront URL (Optional)", "url", "", false)}

                                        {/* Select Fields */}
                                        {["applied", "paymentPlan"].map((id) => (
                                            <div key={id} className="space-y-1 sm:space-y-2">
                                                <Label htmlFor={id} className="text-gray-200 text-xs sm:text-sm font-medium">
                                                    {id === "applied" ? "Vendor Type" : "Preferred Payment Plan"}
                                                </Label>
                                                <Select
                                                    onValueChange={(value) => handleSelectChange(id, value)}
                                                >
                                                    <SelectTrigger className="bg-white/5 text-white border-white/10 focus:border-[var(--color-primary)] transition-all duration-200 focus:ring-1 focus:ring-[var(--color-primary)] h-10 sm:h-11 hover:bg-white/10">
                                                        <SelectValue
                                                            placeholder={`Select ${id === "applied" ? "vendor type" : "preferred payment plan"}`}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[var(--color-surface)] text-white border-white/10 rounded-lg shadow-xl">
                                                        {id === "applied"
                                                            ? ["retail", "wholesale", "manufacturer", "distributor", "gaming"].map((type) => (
                                                                <SelectItem key={type} value={type} className="hover:bg-white/10 cursor-pointer capitalize">
                                                                    {type.replace(/^\w/, (l) => l.toUpperCase())} Vendor
                                                                </SelectItem>
                                                            ))
                                                            : ["monthly", "quarterly", "annually"].map((plan) => (
                                                                <SelectItem key={plan} value={plan} className="hover:bg-white/10 cursor-pointer capitalize">
                                                                    {plan}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}

                                        {/* Shopify Integration */}
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label className="text-gray-200 text-xs sm:text-sm font-medium block">
                                                Shopify Integration Requested
                                            </Label>
                                            <RadioGroup
                                                defaultValue="no"
                                                className="flex gap-4 sm:gap-6 p-2 bg-[var(--color-surface)]/50 rounded-lg"
                                                onValueChange={(value) => handleSelectChange("shopifyIntegration", value)}
                                            >
                                                {["yes", "no"].map((val) => (
                                                    <div key={val} className="flex items-center space-x-2 hover:bg-[#667085]/20 p-2 rounded-md transition-all duration-200">
                                                        <RadioGroupItem
                                                            value={val}
                                                            id={val}
                                                            className="border-[#667085] text-[var(--color-primary)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                                                        />
                                                        <Label htmlFor={val} className="text-white text-sm cursor-pointer capitalize">
                                                            {val}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        {/* Token & NFT Options */}
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label className="text-gray-200 text-xs sm:text-sm font-medium block">
                                                Token & NFT Integration
                                            </Label>
                                            <div className="flex flex-col gap-2 p-2 bg-[var(--color-surface)]/50 rounded-lg">
                                                {[
                                                    { id: "acceptsTokens", label: "Accept token payments" },
                                                    { id: "nftDiscounts", label: "Offer NFT-based discounts" },
                                                ].map(({ id, label }) => (
                                                    <div key={id} className="flex items-center space-x-2 hover:bg-[#667085]/20 p-2 rounded-md transition-all duration-200">
                                                        <Checkbox
                                                            id={id}
                                                            checked={formData[id as keyof typeof formData] as boolean}
                                                            onCheckedChange={(checked) =>
                                                                handleCheckboxChange(id, checked as boolean)
                                                            }
                                                            className="border-[#667085] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                                                        />
                                                        <Label htmlFor={id} className="text-white text-sm cursor-pointer">
                                                            {label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1 sm:space-y-2">
                                        <Label htmlFor="description" className="text-gray-200 text-xs sm:text-sm font-medium">
                                            Business Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Tell us about your business and products..."
                                            className="bg-white/5 text-white placeholder:text-gray-400 border-white/10 focus:border-[var(--color-primary)] transition-all duration-200 focus:ring-1 focus:ring-[var(--color-primary)] min-h-[100px]"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Terms */}
                                    <div className="flex items-center space-x-2 hover:bg-[var(--color-surface)]/50 p-2 rounded-md transition-all duration-200">
                                        <Checkbox
                                            id="agreeToTerms"
                                            checked={formData.agreeToTerms}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange("agreeToTerms", checked as boolean)
                                            }
                                            className="border-[#667085] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                                        />
                                        <Label htmlFor="agreeToTerms" className="text-white text-sm cursor-pointer">
                                            I agree to the{" "}
                                            <a href="/terms" className="text-[var(--color-primary)] hover:underline">
                                                terms and conditions
                                            </a>{" "}
                                            and understand the token payment system
                                        </Label>
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-2 sm:pt-4 flex justify-center">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-8 py-2 text-base font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20 hover:shadow-xl border-none"
                                        >
                                            {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                            {isSubmitting ? "Submitting..." : "Register as Vendor"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {vendorBenefits.map((benefit: VendorBenefit) => (
                                <VendorBenefits
                                    key={benefit.id}
                                    heading={benefit.heading}
                                    description={benefit.description}
                                    icon={benefit.icon}
                                    iconBgColor={benefit.iconBgColor}
                                    iconColor={benefit.iconColor}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VendorRegistrationPage;