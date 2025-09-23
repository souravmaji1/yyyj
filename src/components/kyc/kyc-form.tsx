"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Separator } from "@/src/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Loader2, CalendarIcon, ShieldCheck, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import { createKycSession, fetchKycStatus } from "@/src/store/slices/kycSlice";
import { KYCModal } from "@/src/components/modals/kyc-modal";
import CountrySelect from 'react-select';
import countryList from 'react-select-country-list';

const countryOptions = countryList().getData();


const formSchema = z.object({
    userId: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email address" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    documentType: z.enum(["ID_CARD", "PASSPORT", "DRIVERS_LICENSE", "RESIDENCE_PERMIT"], {
        required_error: "Please select a document type",
    }),
    idNumber: z.string().min(1, { message: "ID number is required" }),
    phoneNumber: z.string().min(7, { message: "Please enter a valid phone number" }),
    gender: z.enum(["M", "F", "O"], { required_error: "Please select a gender" }),
    dateOfBirth: z.date({ required_error: "Date of birth is required" }),
    documentNumber: z.string().min(1, { message: "Document number is required" }),
    documentCountry: z.string().min(2, { message: "Please select a country" }),
    firstIssue: z.date({ required_error: "Document issue date is required" }),
    fullAddress: z.string().min(5, { message: "Please enter your full address" }),
    idCardType: z.enum(["CE", "CC", "TI"]).optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function KycVerificationForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showColombianFields, setShowColombianFields] = useState(false)
    const [urlSessionId, setUrlSessionId] = useState<string | null>(null)
    const [hasCheckedStatus, setHasCheckedStatus] = useState(false)
    const { showError, showSuccess } = useNotificationUtils();
    const [kycModalOpen, setKycModalOpen] = useState(false);
    const userProfile = useSelector((state: RootState) => state.user.profile);
    const kyc = useSelector((state: RootState) => state.kyc);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    // Initialize form with react-hook-form and zod validation
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: userProfile?.id || crypto.randomUUID(),
            email: userProfile?.email || "",
            firstName: userProfile?.firstName || "",
            lastName: userProfile?.lastName || "",
            documentType: undefined,
            idNumber: "",
            phoneNumber: "",
            gender: undefined,
            documentNumber: "",
            documentCountry: "",
            fullAddress: "",
        },
    })

    const selectedCountry = form.watch("documentCountry")
    if (selectedCountry === "CO" && !showColombianFields) {
        setShowColombianFields(true)
    } else if (selectedCountry !== "CO" && showColombianFields) {
        setShowColombianFields(false)
        form.setValue("idCardType", undefined)
    }

    // Handle form submission
    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        try {
            const formatDate = (date: Date | string | undefined) => {
                if (!date) return "";
                if (typeof date === "string") {

                    return date.replace(/\//g, "-");
                }
                const d = date;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const payload = {
                userId: data.userId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                documentType: data.documentType,
                idNumber: data.idNumber,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                dateOfBirth: formatDate(data.dateOfBirth),
                documentNumber: data.documentNumber,
                documentCountry: data.documentCountry,
                idCardType: data.idCardType,
                firstIssue: formatDate(data.firstIssue),
                fullAddress: data.fullAddress,
                endUserId: data.userId,
            };

            const result = await dispatch(createKycSession(payload)).unwrap();

            if (result.status === "success") {
                showSuccess("KYC Session Created", "Scan the QR code or follow the link to complete verification.");
                setKycModalOpen(true);
                console.log(result);
            } else {
                showError("KYC Error", result.message || "Failed to create KYC session.");
            }
        } catch (error: any) {
            showError("KYC Error", error?.message || "Failed to create KYC session.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionIdFromUrl = urlParams.get('sessionId');
        if (sessionIdFromUrl) {
            setSessionId(sessionIdFromUrl);
        }
    }, []);

    useEffect(() => {
        if (sessionId && !hasCheckedStatus) {
            setHasCheckedStatus(true); // Mark that status has been checked

            // User returned from KYC verification, check status once
            const checkKycStatus = async () => {
                try {
                    const resultAction = await dispatch(fetchKycStatus(sessionId!)).unwrap();
                    console.log("KYC Status Result:", resultAction);

                    // Extract status from the nested response structure
                    const status = resultAction?.data?.verifications?.[0]?.status || resultAction?.data?.status || resultAction;

                    if (status === "success" || status === "approved") {
                        showSuccess("KYC Verified", "Your KYC has been successfully verified.");
                        router.push('/profile');
                    } else if (status === "failed" || status === "expired") {
                        showError("KYC Failed", "Your KYC verification has failed. Please try again.");
                    }

                    else if (status === "pending") {
                        showError("KYC Pending", "Your KYC verification is pending. Please wait for it to be approved.");
                        router.push('/profile');
                    } else if (status === "declined") {
                        showError("KYC Declined", "Your KYC verification was unsuccessful. Please try again using a valid ID.");
                    }
                    else {
                        showError("KYC Status Unknown", "Unable to determine KYC status. Please contact support.");
                    }
                } catch (error: any) {
                    console.log("Error checking KYC status:", error);
                    const errorMessage = error?.message || error || "Failed to check KYC status!";
                    showError("KYC Status Error", errorMessage);
                }
            };

            checkKycStatus();
        }
    }, [sessionId, hasCheckedStatus]);

    return (
        <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">KYC Verification</h1>
                    <p className="text-slate-400">Complete your identity verification to access all features</p>
                </div>

                <Card className="bg-[var(--color-bg)] border-slate-700 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-white" />
                            <div>
                                <CardTitle>Identity Verification</CardTitle>
                                <CardDescription className="text-blue-100">
                                    Please provide your personal information for KYC verification
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <Alert className="bg-[var(--color-bg)] border-amber-500/50 text-amber-300 mx-6 mt-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            Please ensure all information matches your identification document exactly to avoid verification delays.
                        </AlertDescription>
                    </Alert>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6 pt-6">
                                {/* Personal Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white flex items-center gap-2">Personal Information</h3>
                                    <Separator className="bg-[var(--color-bg)]" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        First Name
                                                        {!userProfile?.firstName && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={!!userProfile?.firstName}
                                                            className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                            placeholder="Enter your first name"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Last Name
                                                        {!userProfile?.lastName && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={!!userProfile?.lastName}
                                                            className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                            placeholder="Enter your last name"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Email Address
                                                        {!userProfile?.email && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            disabled={!!userProfile?.email}
                                                            className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                            placeholder="your.email@example.com"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Phone Number
                                                        {!userProfile?.phoneNumber && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                            placeholder="Enter your phone number"
                                                            type="tel"
                                                            onChange={e => {
                                                                // Prevent alphabetic characters
                                                                const value = e.target.value.replace(/[^0-9+\-() ]/g, "");
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                    {/* Show error if alphabetic characters are present */}
                                                    {form.getValues("phoneNumber") && /[a-zA-Z]/.test(form.getValues("phoneNumber")) && (
                                                        <div className="text-red-500 text-xs mt-1">Phone no. field should not contain the alphabet characters</div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Gender
                                                        {userProfile && 'gender' in userProfile ? !userProfile.gender && <span className="text-red-500 ml-1">*</span> : <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex space-x-4 items-center"
                                                        >
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl className="flex items-center">
                                                                    <RadioGroupItem value="M" />
                                                                </FormControl>
                                                                <FormLabel className="text-slate-300 cursor-pointer mb-0">Male</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl className="flex items-center">
                                                                    <RadioGroupItem value="F" />
                                                                </FormControl>
                                                                <FormLabel className="text-slate-300 cursor-pointer mb-0">Female</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl className="flex items-center">
                                                                    <RadioGroupItem value="O" />
                                                                </FormControl>
                                                                <FormLabel className="text-slate-300 cursor-pointer mb-0">Other</FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Date of Birth
                                                        {userProfile && 'dateOfBirth' in userProfile
                                                            ? !userProfile.dateOfBirth && <span className="text-red-500 ml-1">*</span>
                                                            : <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type="date"
                                                                className="bg-[var(--color-bg)] border border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                                                max={new Date().toISOString().split("T")[0]}
                                                                value={
                                                                    field.value
                                                                        ? typeof field.value === 'string'
                                                                            ? field.value
                                                                            : field.value.toISOString().split('T')[0]
                                                                        : ''
                                                                }
                                                                onChange={e =>
                                                                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                                                                }
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="fullAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-300">
                                                    Full Address
                                                    {userProfile && 'fullAddress' in userProfile ? !userProfile.fullAddress && <span className="text-red-500 ml-1">*</span> : <span className="text-red-500 ml-1">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                        placeholder="Enter your full address including city, state, and postal code"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Document Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white flex items-center gap-2">Document Information</h3>
                                    <Separator className="bg-[var(--color-bg)]" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="documentType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Document Type
                                                        {!form.getValues("documentType") && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-[var(--color-bg)] border-slate-600 text-white hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]">
                                                                <SelectValue placeholder="Select document type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-[var(--color-bg)] border-slate-600">
                                                            <SelectItem value="ID_CARD" className="text-white focus:bg-[var(--color-primary-50)] focus:text-[var(--color-bg)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-bg)]">ID Card</SelectItem>
                                                            <SelectItem value="PASSPORT" className="text-white focus:bg-[var(--color-primary-50)] focus:text-[var(--color-bg)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-bg)]">Passport</SelectItem>
                                                            <SelectItem value="DRIVERS_LICENSE" className="text-white focus:bg-[var(--color-primary-50)] focus:text-[var(--color-bg)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-bg)]">Driver's License</SelectItem>
                                                            <SelectItem value="RESIDENCE_PERMIT" className="text-white focus:bg-[var(--color-primary-50)] focus:text-[var(--color-bg)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-bg)]">Residence Permit</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="documentCountry"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Document Country
                                                        {!form.getValues("documentCountry") && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <CountrySelect
                                                        classNamePrefix="react-select"
                                                        options={countryOptions}
                                                        value={countryOptions.find((option: { value: string }) => option.value === field.value) || null}
                                                        onChange={(option: { value: string } | null) => field.onChange(option ? option.value : '')}
                                                        placeholder="Select country"
                                                        isClearable
                                                        className="bg-[var(--color-bg)]   text-white placeholder:text-white-600"
                                                        styles={{
                                                            control: (base: any, state: any) => ({
                                                                ...base,
                                                                backgroundColor: 'var(--color-bg)',
                                                                borderColor: state.isFocused ? 'var(--color-primary)' : '#334155',
                                                                color: 'white',
                                                                boxShadow: state.isFocused ? '0 0 0 2px rgba(2, 167, 253, 0.4)' : 'none',
                                                                minHeight: 44,
                                                                fontSize: 16,
                                                                '&:hover': {
                                                                    borderColor: 'var(--color-primary)',
                                                                },
                                                            }),
                                                            input: (base: any) => ({
                                                                ...base,
                                                                color: 'white',
                                                            }),
                                                            placeholder: (base: any) => ({
                                                                ...base,
                                                                color: 'white',
                                                                opacity: 1,
                                                            }),
                                                            singleValue: (base: any) => ({
                                                                ...base,
                                                                color: 'white',
                                                            }),
                                                            menu: (base: any) => ({
                                                                ...base,
                                                                backgroundColor: 'var(--color-bg)',
                                                                color: 'white',
                                                                border: '1px solid white',
                                                                zIndex: 20,
                                                            }),
                                                            option: (base: any, state: any) => ({
                                                                ...base,
                                                                color: 'white',
                                                                backgroundColor: 'var(--color-bg)',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    backgroundColor: '#071a4b', // slight hover feedback without breaking theme
                                                                },
                                                            }),
                                                            dropdownIndicator: (base: any, state: any) => ({
                                                                ...base,
                                                                color: 'white',
                                                                '&:hover': { color: 'var(--color-primary)' },
                                                            }),
                                                            indicatorSeparator: (base: any) => ({
                                                                ...base,
                                                                backgroundColor: '#334155',
                                                            }),
                                                            clearIndicator: (base: any) => ({
                                                                ...base,
                                                                color: 'white',
                                                                '&:hover': { color: 'var(--color-primary)' },
                                                            }),
                                                        }}

                                                    />
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="documentNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Document Number
                                                        {!form.getValues("documentNumber") && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-[var(--color-bg)]  border-slate-600 text-white placeholder:text-slate-400"
                                                            placeholder="Enter document number"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="idNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        ID Number
                                                        {userProfile && 'idNumber' in userProfile ? !userProfile.idNumber && <span className="text-red-500 ml-1">*</span> : <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                            placeholder="Enter your ID number"
                                                            onChange={e => {
                                                                // Prevent special characters
                                                                const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                    {/* Show error if special characters are present */}
                                                    {form.getValues("idNumber") && /[^a-zA-Z0-9 ]/.test(form.getValues("idNumber")) && (
                                                        <div className="text-red-500 text-xs mt-1">Enter valid ID number</div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="firstIssue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-300">
                                                        Document Issue Date
                                                        {!form.getValues("firstIssue") && <span className="text-red-500 ml-1">*</span>}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type="date"
                                                                className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400"
                                                                max={new Date().toISOString().split("T")[0]}
                                                                value={field.value ? (typeof field.value === 'string' ? field.value : field.value.toISOString().split('T')[0]) : ''}
                                                                onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Colombian-specific field */}
                                        {showColombianFields && (
                                            <FormField
                                                control={form.control}
                                                name="idCardType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-300">ID Card Type (Colombia)</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-[var(--color-bg)]  border-slate-600 text-white">
                                                                    <SelectValue placeholder="Select ID card type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-[var(--color-bg)]  border-slate-600">
                                                                <SelectItem value="CE" className="text-white">
                                                                    CE - Cédula de Extranjería
                                                                </SelectItem>
                                                                <SelectItem value="CC" className="text-white">
                                                                    CC - Cédula de Ciudadanía
                                                                </SelectItem>
                                                                <SelectItem value="TI" className="text-white">
                                                                    TI - Tarjeta de Identidad
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Privacy Notice */}
                                <div className="bg-[var(--color-bg)] /50 p-4 rounded-lg border border-slate-600 text-sm text-slate-300">
                                    <p>
                                        By submitting this form, you agree to our{" "}
                                        <a href="#" className="text-cyan-400 hover:underline">
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a href="#" className="text-cyan-400 hover:underline">
                                            Privacy Policy
                                        </a>
                                        . Your information will be securely processed by Veriff for identity verification purposes.
                                    </p>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col  justify-end bg-[var(--color-bg)]   sm:flex-row gap-4  border-t border-slate-700 px-6 py-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto border-slate-600 text-white h  bg-transparent"
                                    onClick={() => router.push('/')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Submit Verification"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
                <div className="mt-6 text-center text-sm text-slate-400">
                    <p>
                        Need help with verification?{" "}
                        <a href="#" className="text-cyan-400 hover:underline">
                            Contact Support
                        </a>
                    </p>
                </div>
                <KYCModal open={kycModalOpen} onClose={() => setKycModalOpen(false)} />
            </div>
        </div>
    )
}