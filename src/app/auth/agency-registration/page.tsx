"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { authAPI, userAPI } from "@/lib/api";
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { CATEGORIES } from "@/config/categories";

const agencyTypes = [
    { value: "government", label: "Government Agency" },
    { value: "municipal", label: "Municipal Corporation" },
    { value: "state", label: "State Department" },
    { value: "federal", label: "Federal Agency" },
    { value: "utility", label: "Public Utility Company" },
    { value: "transport", label: "Transportation Authority" },
    { value: "health", label: "Health Department" },
    { value: "education", label: "Education Board" },
    { value: "police", label: "Police Department" },
    { value: "fire", label: "Fire Department" },
    { value: "environmental", label: "Environmental Agency" },
    { value: "private", label: "Private Company" },
    { value: "ngo", label: "Non-Governmental Organization" },
    { value: "other", label: "Other" }
];


const districts = [
    "Central District", "Northern District", "Southern District", "Eastern District", 
    "Western District", "Metropolitan Area", "Suburban Area", "Industrial Zone"
];

const sectors = [
    "Residential", "Commercial", "Industrial", "Mixed-Use", "Rural", "Urban Core", 
    "Suburban", "Special Economic Zone"
];

function AgencyRegistrationContent() {
    const [formData, setFormData] = useState({
        agencyName: "",
        agencyType: "",
        registrationNumber: "",
        website: "",
        address: "",
        district: "",
        sector: "",
        description: "",
        serviceDomains: [] as string[]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check for tokens in URL parameters and store them
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        
        if (accessToken && refreshToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            // Clean URL by removing tokens
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }

        // Check if user is authenticated and fetch their data
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                
                // First, get user profile to ensure authentication
                console.log('Fetching user profile...');
                const profile = await userAPI.getProfile();
                
                if (!profile.success) {
                    console.error('Profile fetch failed:', profile);
                    // User not authenticated, redirect to login
                    router.push('/auth/login');
                    return;
                }
                
                console.log('User profile fetched successfully:', profile.user);
                
                // Check if user is verified
                if (!profile.user.isEmailVerified || !profile.user.isPhoneVerified) {
                    console.log('User not fully verified, redirecting...');
                    // User not verified, redirect to verification
                    router.push(`/auth/verify-account?email=${encodeURIComponent(profile.user.email)}&phone=${encodeURIComponent(profile.user.phone)}`);
                    return;
                }
                
                // Check if user has already registered an agency
                console.log('Checking agency status...');
                try {
                    const agencyStatus = await authAPI.getAgencyStatus();
                    console.log('Agency status:', agencyStatus);
                    
                    if (agencyStatus.hasAgency) {
                        // User already has an agency, redirect to dashboard
                        console.log('User already has agency, redirecting to dashboard');
                        router.push('/dashboard');
                        return;
                    }
                } catch (agencyErr: any) {
                    // If agency status check fails, log but continue
                    // (user might not have registered agency yet, which is fine)
                    console.warn('Agency status check failed (this is OK for new registration):', agencyErr.message);
                }
                
                setUserData(profile.user);
            } catch (err: any) {
                console.error('Error fetching user data:', err);
                setError(err.message || 'Failed to load user data');
                // If authentication fails, redirect to login
                setTimeout(() => router.push('/auth/login'), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router, searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleServiceDomainChange = (domain: string) => {
        setFormData(prev => ({
            ...prev,
            serviceDomains: prev.serviceDomains.includes(domain)
                ? prev.serviceDomains.filter(d => d !== domain)
                : [...prev.serviceDomains, domain]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        
        // Validate required fields
        if (!formData.agencyName || !formData.agencyType || !formData.registrationNumber || 
            !formData.address || !formData.district || !formData.sector || 
            formData.serviceDomains.length === 0) {
            setError("Please fill in all required fields and select at least one service domain.");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await authAPI.registerAgency(formData);
            
            if (response.success) {
                setSuccess(true);
                
                // Clear any stored data
                localStorage.removeItem('officerData');
                localStorage.removeItem('agencyData');
                
                // Navigate to confirmation page after a short delay
                setTimeout(() => {
                    router.push('/auth/confirmation?type=agency-registered');
                }, 2000);
            }
        } catch (err: any) {
            console.error('Agency registration error:', err);
            
            if (err.message.includes('verification required')) {
                setError("Please verify your email and phone number before registering an agency.");
            } else if (err.message.includes('Authentication')) {
                setError("Your session has expired. Please log in again.");
                setTimeout(() => router.push('/auth/login'), 2000);
            } else {
                setError(err.message || "Failed to register agency. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        // Go back to dashboard or profile
        router.push('/dashboard');
    };

    // Show loading state while fetching user data
    if (isLoading) {
        return (
            <AuthLayout 
                title="Agency Registration" 
                subtitle="Loading..."
                showBackButton={false}
                backHref="/dashboard"
            >
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            title="Agency Registration" 
            subtitle={userData ? `Welcome, ${userData.fullName}! Register your agency below.` : "Step 2: Enter your agency/organization details"}
            showBackButton={false}
            backHref="/dashboard"
        >
            <div className="space-y-6">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FaCheck className="text-green-500 mt-0.5  shrink-0" />
                            <div className="flex-1">
                                <p className="text-green-800 text-sm font-medium">Agency registered successfully!</p>
                                <p className="text-green-700 text-xs mt-1">
                                    Your agency is now under review. Redirecting to confirmation page...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 mt-0.5  shrink-0" />
                            <div className="flex-1">
                                <p className="text-red-800 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            <FaCheck size={14} />
                        </div>
                        <span className="ml-2 text-sm font-medium text-green-600">Officer Details</span>
                    </div>
                    <div className="w-12 h-0.5 bg-accent2"></div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-accent2 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            2
                        </div>
                        <span className="ml-2 text-sm font-medium text-accent2">Agency Details</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Agency Name */}
                    <div className="space-y-2">
                        <label htmlFor="agencyName" className="block text-sm font-medium text-almost-black">
                            Agency/Organization Name *
                        </label>
                        <div className="relative">
                            <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text" size={16} />
                            <input
                                type="text"
                                id="agencyName"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                placeholder="Enter your agency/organization name"
                                required
                            />
                        </div>
                    </div>

                    {/* Agency Type */}
                    <div className="space-y-2">
                        <label htmlFor="agencyType" className="block text-sm font-medium text-almost-black">
                            Agency Type *
                        </label>
                        <select
                            id="agencyType"
                            name="agencyType"
                            value={formData.agencyType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            required
                        >
                            <option value="">Select agency type</option>
                            {agencyTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Registration Number */}
                    <div className="space-y-2">
                        <label htmlFor="registrationNumber" className="block text-sm font-medium text-almost-black">
                            Registration Number / License ID *
                        </label>
                        <input
                            type="text"
                            id="registrationNumber"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="Enter registration number or license ID"
                            required
                        />
                    </div>

                    {/* Official Website */}
                    <div className="space-y-2">
                        <label htmlFor="website" className="block text-sm font-medium text-almost-black">
                            Official Website Domain
                        </label>
                        <div className="relative">
                            <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text" size={16} />
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                placeholder="https://www.yourorganization.com"
                            />
                        </div>
                    </div>

                    {/* Primary Office Address */}
                    <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-almost-black">
                            Primary Office Address *
                        </label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-text" size={16} />
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base resize-none"
                                placeholder="Enter complete office address"
                                required
                            />
                        </div>
                    </div>

                    {/* Service Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="district" className="block text-sm font-medium text-almost-black">
                                Service District *
                            </label>
                            <select
                                id="district"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                required
                            >
                                <option value="">Select district</option>
                                {districts.map((district) => (
                                    <option key={district} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="sector" className="block text-sm font-medium text-almost-black">
                                Service Sector *
                            </label>
                            <select
                                id="sector"
                                name="sector"
                                value={formData.sector}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                required
                            >
                                <option value="">Select sector</option>
                                {sectors.map((sector) => (
                                    <option key={sector} value={sector}>
                                        {sector}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Agency Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-almost-black">
                            Agency Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base resize-none"
                            placeholder="Describe your agency's mission, role, and responsibilities"
                            required
                        />
                    </div>

                    {/* Service Domains */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-almost-black">
                            Service Domains (Select all that apply) *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                            {CATEGORIES.map((category) => (
                                <label
                                    key={category.name}
                                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                                        formData.serviceDomains.includes(category.name)
                                            ? 'border-accent2 bg-accent2/5 text-accent2'
                                            : 'border-light-gray hover:border-accent2/50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.serviceDomains.includes(category.name)}
                                        onChange={() => handleServiceDomainChange(category.name)}
                                        className="w-4 h-4 text-accent2 border-light-gray rounded focus:ring-accent2 focus:ring-2"
                                    />
                                    <span className="text-sm font-medium">{category.name}</span>
                                </label>
                            ))}
                        </div>
                        {formData.serviceDomains.length === 0 && (
                            <p className="text-xs text-red-500">Please select at least one service domain</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || formData.serviceDomains.length === 0}
                        className="w-full bg-linear-to-r from-accent2 to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Completing registration...
                            </div>
                        ) : (
                            "Complete Registration"
                        )}
                    </button>

                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="w-full border-2 border-light-gray text-neutral-text font-semibold py-3 px-6 rounded-xl hover:border-accent2 hover:text-accent2 hover:bg-accent2/5 transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
                    >
                        Cancel
                    </button>
                </form>

                {/* Help Information */}
                <div className="bg-accent2/5 border border-accent2/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent2 rounded-full flex items-center justify-center  shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">💡</span>
                        </div>
                        <div className="text-sm text-neutral-text">
                            <p className="font-medium text-almost-black mb-2">Registration Guidelines:</p>
                            <ul className="space-y-1 text-xs">
                                <li>• Ensure all information is accurate and up-to-date</li>
                                <li>• Registration number should match official documents</li>
                                <li>• Select all service domains your agency handles</li>
                                <li>• Your account will be verified before activation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function AgencyRegistrationPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Loading...">
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                </div>
            </AuthLayout>
        }>
            <AgencyRegistrationContent />
        </Suspense>
    );
}
