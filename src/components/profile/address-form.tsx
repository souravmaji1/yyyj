"use client";

import { useState, useEffect } from "react";

import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Icons } from "@/src/core/icons";
import { useAddressValidation } from "@/src/hooks/useAddressValidation";
import { AddressSuggestions } from "./address-suggestions";
import { addressApi, AddressValidationRequest } from "@/src/app/apis/address/addressApi";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

interface Address {
  id?: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  pincode: string;
  state: string;
  city: string;
  streetAddress: string; // Merged field for houseNo + roadName
  type: string;
  country: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  initialData?: Partial<Address>;
  onSave: (data: Partial<Address>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  currentAddressesCount?: number; // Add this to check address limit
  existingAddressTypes?: string[]; // Add this to show which types are taken
}

export function AddressForm({ initialData, onSave, onCancel, isSubmitting, currentAddressesCount = 0, existingAddressTypes = [] }: AddressFormProps) {
  // Check if this is an edit mode (has an ID or existing data)
  const isEditMode = Boolean(initialData?.id || (initialData && Object.keys(initialData).length > 0));
  const { showError } = useNotificationUtils();

  const [formData, setFormData] = useState<Address>({
    fullName: initialData?.fullName || '',
    phoneNumber: initialData?.phoneNumber || '',
    alternatePhone: initialData?.alternatePhone || '',
    pincode: initialData?.pincode || '',
    state: initialData?.state || '',
    city: initialData?.city || '',
    streetAddress: initialData?.streetAddress || '',
    type: initialData?.type || 'Home',
    country: initialData?.country || 'India'
  });
  const [pincodeError, setPincodeError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [zipcodeValidation, setZipcodeValidation] = useState<{ 
    isValid: boolean; 
    message: string; 
    city?: string; 
    state?: string; 
  } | null>(null);
  const [stateValidation, setStateValidation] = useState<{ 
    isValid: boolean; 
    message: string; 
  } | null>(null);

  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);

  // Address validation hook
  const { validationState, updateAddressData, clearValidation, selectSuggestion, resetValidationState } = useAddressValidation();
  
  // Trigger validation when address fields change (for US addresses)
  useEffect(() => {
    // Skip validation if we already have a valid suggestion selected
    if (suggestionSelected && validationState.isValid) {
      return;
    }
    
    if (formData.country === 'United States') {
      const addressData = {
        street: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipcode: formData.pincode,
        country: formData.country
      };

      if (addressData.street && addressData.city && addressData.state && addressData.zipcode) {
        updateAddressData('street', addressData.street);
        updateAddressData('city', addressData.city);
        updateAddressData('state', addressData.state);
        updateAddressData('zipcode', addressData.zipcode);
        updateAddressData('country', addressData.country);
      }
    }
  }, [formData.streetAddress, formData.city, formData.state, formData.pincode, formData.country, updateAddressData, suggestionSelected, validationState.isValid]);

  // Control suggestions visibility
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (validationState.suggestions && validationState.suggestions.length > 0 && !validationState.isValidating) {
      setShowSuggestions(true);
      
      // Auto-hide suggestions after 5 seconds if they're not selected
      timer = setTimeout(() => {
        if (validationState.isValid) {
          setShowSuggestions(false);
        }
      }, 5000);
    } else {
      setShowSuggestions(false);
    }
    
    // Auto-hide suggestions if validation is successful and no suggestions needed
    if (validationState.isValid && (!validationState.suggestions || validationState.suggestions.length === 0)) {
      setShowSuggestions(false);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [validationState.suggestions, validationState.isValidating, validationState.isValid]);

  const handleChange = (field: keyof Address, value: string) => {
    // Add validation for phone number to only allow digits and max 12 characters
    if (field === 'phoneNumber' || field === 'alternatePhone') {
      // Remove any non-digit characters and limit to 12 digits
      const digitsOnly = value.replace(/\D/g, '');
      const limitedValue = digitsOnly.slice(0, 12);
      setFormData(prev => ({ ...prev, [field]: limitedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear suggestion state if user starts typing again
    if (field === 'streetAddress' && suggestionSelected) {
      setSuggestionSelected(false);
      // Reset validation state to allow new suggestions
      resetValidationState();
    }
    
    // Update address validation data for US addresses
    if (field === 'streetAddress' || field === 'city' || field === 'state' || field === 'pincode' || field === 'country') {
      // Map form fields to validation API fields
      if (field === 'pincode') {
        updateAddressData('zipcode', value);
      } else if (field === 'streetAddress') {
        updateAddressData('street', value);
      } else {
        updateAddressData(field as 'city' | 'state' | 'country', value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check address limit for new addresses (not edit mode)
    if (!isEditMode && currentAddressesCount >= 5) {
      showError('Address Limit Reached', 'You can only save up to 5 addresses. Please delete an existing address before adding a new one.');
      return;
    }

    // Check if any required field is empty or only contains spaces
    const trimmedData = { ...formData };

    // Check and trim required fields
    if (!formData.fullName.trim()) {
      console.error('Full name cannot be empty or contain only spaces');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      console.error('Phone number cannot be empty or contain only spaces');
      return;
    }
    if (!formData.pincode.trim()) {
      console.error('Pincode cannot be empty or contain only spaces');
      return;
    }
    if (!formData.state.trim()) {
      console.error('State cannot be empty or contain only spaces');
      return;
    }
    if (!formData.city.trim()) {
      console.error('City cannot be empty or contain only spaces');
      return;
    }
    if (!formData.streetAddress.trim()) {
      console.error('Street address cannot be empty or contain only spaces');
      return;
    }

    // Trim all fields
    trimmedData.fullName = formData.fullName.trim();
    trimmedData.phoneNumber = formData.phoneNumber.trim();
    trimmedData.pincode = formData.pincode.trim();
    trimmedData.state = formData.state.trim();
    trimmedData.city = formData.city.trim();
    trimmedData.streetAddress = formData.streetAddress.trim();

    // Trim optional fields
    if (trimmedData.alternatePhone) {
      trimmedData.alternatePhone = trimmedData.alternatePhone.trim();
    }

    onSave({ ...trimmedData, isDefault });
  };

  const handleUseMyLocation = () => {
    // Implement geolocation logic here
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // You would typically make an API call here to get address details
        console.log(position.coords.latitude, position.coords.longitude);
      });
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    // Use the hook's selectSuggestion method to properly handle the suggestion
    const parsedData = selectSuggestion(suggestion);
    
    // Update form data with the COMPLETE suggestion data
    setFormData(prev => ({
      ...prev,
      streetAddress: suggestion.street || `${parsedData.houseNo} ${parsedData.roadName}`.trim(),
      city: suggestion.city || parsedData.city,
      state: suggestion.state || parsedData.state,
      pincode: suggestion.zipcode || parsedData.pincode,
      country: suggestion.country || 'United States'
    }));

    // Clear suggestions and validation
    setShowSuggestions(false);
    
    // IMPORTANT: Clear validation state to prevent further API calls
    clearValidation();
    
    // Clear any existing validation states
    setZipcodeValidation(null);
    setStateValidation(null);
    
    // Set success flag for better UX
    setSuggestionSelected(true);
    
    // Clear success flag after 3 seconds
    setTimeout(() => setSuggestionSelected(false), 3000);
  };

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
    clearValidation();
    setSuggestionSelected(false);
  };

  // State suggestions functionality with debounce
  const [stateSearchTimeout, setStateSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleStateChange = async (value: string) => {
    handleChange('state', value);
    
    // Clear state suggestions when user types
    setShowStateSuggestions(false);
    setStateSuggestions([]);
    
    // Clear ZIP code validation when state changes
    setZipcodeValidation(null);
    
    // Clear existing timeout
    if (stateSearchTimeout) {
      clearTimeout(stateSearchTimeout);
    }
    
    // Get state suggestions for US addresses with debounce
    // Only show suggestions if the value is not a complete state name
    if (formData.country === 'United States' && value.trim() && value.length < 20) {
      const timeout = setTimeout(async () => {
        try {
          const response = await addressApi.getStateSuggestions(value);
          if (response.suggestions && response.suggestions.length > 0) {
            // Filter out exact matches to avoid showing suggestions for complete state names
            const filteredSuggestions = response.suggestions.filter(suggestion => 
              suggestion.toLowerCase() !== value.toLowerCase()
            );
            if (filteredSuggestions.length > 0) {
              setStateSuggestions(filteredSuggestions);
              setShowStateSuggestions(true);
            }
          }
        } catch (error) {
          console.error('Error fetching state suggestions:', error);
        }
      }, 300); // 300ms debounce
      
      setStateSearchTimeout(timeout);
    }
    
    // Re-validate ZIP code with new state if ZIP code is already entered
    if (formData.country === 'United States' && value.trim() && formData.pincode.trim()) {
      // Trigger ZIP code validation with new state
      const digitsOnly = formData.pincode.replace(/\D/g, '');
      if (digitsOnly.length >= 5) {
        try {
          const response = await addressApi.validateZipcode(digitsOnly, 'United States', value);
          if (response.valid) {
            setZipcodeValidation({ 
              isValid: true, 
              message: 'Valid ZIP code for selected state', 
              city: response.city,
              state: response.state
            });
            
            // Auto-fill city if provided by API (validation already ensures state matches)
            if (response.city) {
              setFormData(prev => ({
                ...prev,
                city: response.city || prev.city
              }));
            }
          } else {
            setZipcodeValidation({ 
              isValid: false, 
              message: response.error || 'Invalid ZIP code for selected state' 
            });
          }
        } catch (error: any) {
          console.error('Error re-validating ZIP code:', error);
          // Check if it's an API error with validation result
          if (error.response?.data?.data) {
            const apiResult = error.response.data.data;
            setZipcodeValidation({ 
              isValid: apiResult.valid, 
              message: apiResult.error || 'Invalid ZIP code for selected state' 
            });
          }
        }
      }
    }
  };

  const handleStateSuggestionSelect = (state: string) => {
    // Set the state directly without triggering suggestions
    setFormData(prev => ({ ...prev, state }));
    setShowStateSuggestions(false);
    setStateSuggestions([]);
    
    // Clear ZIP code validation when state changes
    setZipcodeValidation(null);
    
    // Re-validate ZIP code with new state if ZIP code is already entered
    if (formData.country === 'United States' && state.trim() && formData.pincode.trim()) {
      // Trigger ZIP code validation with new state
      const digitsOnly = formData.pincode.replace(/\D/g, '');
      if (digitsOnly.length >= 5) {
        // Use setTimeout to avoid blocking the UI
        setTimeout(async () => {
          try {
            const response = await addressApi.validateZipcode(digitsOnly, 'United States', state);
            if (response.valid) {
              setZipcodeValidation({ 
                isValid: true, 
                message: 'Valid ZIP code for selected state', 
                city: response.city,
                state: response.state
              });
              
              // Auto-fill city if provided by API (validation already ensures state matches)
              if (response.city) {
                setFormData(prev => ({
                  ...prev,
                  city: response.city || prev.city
                }));
              }
            } else {
              setZipcodeValidation({ 
                isValid: false, 
                message: response.error || 'Invalid ZIP code for selected state' 
              });
            }
          } catch (error: any) {
            console.error('Error re-validating ZIP code:', error);
            // Check if it's an API error with validation result
            if (error.response?.data?.data) {
              const apiResult = error.response.data.data;
              setZipcodeValidation({ 
                isValid: apiResult.valid, 
                message: apiResult.error || 'Invalid ZIP code for selected state' 
              });
            }
          }
        }, 100);
      }
    }
  };

  const handleDismissStateSuggestions = () => {
    setShowStateSuggestions(false);
    setStateSuggestions([]);
  };

  // Dismiss suggestions when clicking outside
  const handleStateFieldBlur = () => {
    // Use setTimeout to allow suggestion click to register first
    setTimeout(() => {
      setShowStateSuggestions(false);
      setStateSuggestions([]);
    }, 200);
  };



    // ZIP code validation functionality with debounce
  const [zipcodeValidationTimeout, setZipcodeValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleZipcodeChange = async (value: string) => {
    // Clear existing validation
    setZipcodeValidation(null);
    
    // Clear existing timeout
    if (zipcodeValidationTimeout) {
      clearTimeout(zipcodeValidationTimeout);
    }

    // Basic validation for non-US addresses
    if (formData.country !== 'United States') {
      if (/^[a-zA-Z0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, pincode: value }));
        setPincodeError("");
      } else {
        setPincodeError("PIN/ZIP code cannot contain special characters or spaces");
      }
      return;
    }

    // For US addresses, use the validation API
    if (formData.country === 'United States') {
      // Only allow digits for US ZIP codes
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, pincode: digitsOnly }));
      setPincodeError("");

      // Validate ZIP code format with debounce
      if (digitsOnly.length >= 5) {
        const timeout = setTimeout(async () => {
          try {
            // Pass the current state for cross-validation
            const response = await addressApi.validateZipcode(digitsOnly, 'United States', formData.state);
            if (response.valid) {
              setZipcodeValidation({ 
                isValid: true, 
                message: 'Valid ZIP code for selected state', 
                city: response.city,
                state: response.state
              });
              
              // Auto-fill city if provided by API (validation already ensures state matches)
              if (response.city) {
                setFormData(prev => ({
                  ...prev,
                  city: response.city || prev.city
                }));
              }
            } else {
              setZipcodeValidation({ 
                isValid: false, 
                message: response.error || 'Invalid ZIP code' 
              });
            }
          } catch (error: any) {
            console.error('Error validating ZIP code:', error);
            // Check if it's an API error with validation result
            if (error.response?.data?.data) {
              const apiResult = error.response.data.data;
              setZipcodeValidation({ 
                isValid: apiResult.valid, 
                message: apiResult.error || 'Invalid ZIP code' 
              });
            } else {
              setZipcodeValidation({ isValid: false, message: 'Error validating ZIP code' });
            }
          }
        }, 500); // 500ms debounce
        
        setZipcodeValidationTimeout(timeout);
      } else if (digitsOnly.length > 0) {
        setZipcodeValidation({ isValid: false, message: 'ZIP code must be 5 digits' });
      }
    }
  };

  // Enhanced validation for street address
  const validateStreetAddress = (address: string): string => {
    if (!address.trim()) return "Street address is required";
    
    // Check if address is too short (likely incomplete)
    if (address.trim().length < 10) {
      return "Address seems too short. Please include house number, building name, and street name";
    }
    
    // Check if address contains only house number and building name without street
    const hasStreetName = /\b(street|road|avenue|drive|lane|boulevard|way|plaza|circle|court|terrace|highway|freeway|expressway|st|rd|ave|dr|ln|blvd|way|plz|cir|ct|terr|hwy|fwy|expy)\b/i.test(address);
    const hasDirectional = /\b(north|south|east|west|n|s|e|w)\b/i.test(address);
    const hasNumberSuffix = /\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|13th|14th|15th|16th|17th|18th|19th|20th|21st|22nd|23rd|24th|25th|26th|27th|28th|29th|30th|31st)\b/i.test(address);
    
    // Check if it looks like a complete address with house number + street name
    const hasHouseNumber = /^\d+\s+/.test(address.trim());
    const hasStreetNameAfterNumber = /^\d+\s+[A-Za-z]+/.test(address.trim());
    
    // If it has house number + street name, it's likely valid even without street type
    if (hasHouseNumber && hasStreetNameAfterNumber) {
      return "";
    }
    
    // If no street indicators found, warn user
    if (!hasStreetName && !hasDirectional && !hasNumberSuffix) {
      return "Please include the actual street name (e.g., Main Street, Broadway, etc.)";
    }
    
    return "";
  };

  // Check if all required fields are filled (not just spaces)
  const isFormValid = () => {
    const basicValidation = (
      formData.fullName.trim() &&
      formData.phoneNumber.trim() &&
      formData.pincode.trim() &&
      formData.state.trim() &&
      formData.city.trim() &&
      formData.streetAddress.trim()
    );

    // Check if selected address type is already taken (for new addresses only)
    // Allow multiple "Other" addresses, but only one "Home" and one "Work"
    const isAddressTypeTaken = !isEditMode && 
      formData.type !== 'Other' && 
      existingAddressTypes.includes(formData.type);

    // If a suggestion was selected, trust the API validation
    if (suggestionSelected && validationState.isValid) {
      return basicValidation && !isAddressTypeTaken;
    }

    // Validate street address format only if no suggestion was selected
    const streetAddressError = !suggestionSelected ? validateStreetAddress(formData.streetAddress) : "";
    if (streetAddressError) {
      return false;
    }

    // For US addresses, check comprehensive validation
    if (formData.country === 'United States') {
      const zipcodeValid = zipcodeValidation?.isValid !== false; // Allow if not explicitly invalid
      
      // COORDINATED VALIDATION: Only show Smarty API success if frontend validation passes
      const frontendValid = !streetAddressError;
      const addressValid = frontendValid && validationState.isValid;
      
      return basicValidation && zipcodeValid && addressValid && !isAddressTypeTaken;
    }

    return basicValidation && !isAddressTypeTaken;
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[#667085]/30 p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white relative inline-block">
          Address Information
          <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"></span>
        </h2>

        {/* Address limit indicator */}
        {!isEditMode && (
          <div className="text-sm text-gray-400">
            {currentAddressesCount}/5 addresses
            {currentAddressesCount >= 5 && (
              <span className="text-red-400 ml-2">(Limit reached)</span>
            )}
          </div>
        )}
      </div>

      {/* Address limit warning */}
      {!isEditMode && currentAddressesCount >= 5 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <Icons.alertCircle className="h-4 w-4" />
            <span className="font-medium">Address Limit Reached</span>
          </div>
          <p className="text-red-300 text-sm mt-1">
            You have reached the maximum of 5 addresses. Please delete an existing address before adding a new one.
          </p>
        </div>
      )}

      {/* Enhanced validation info for US addresses */}
      {formData.country === 'United States' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-400">
            <Icons.info className="h-4 w-4" />
            <span className="font-medium">Enhanced Address Validation</span>
          </div>
          <p className="text-blue-300 text-sm mt-1">
            For US addresses: Select state first, then enter a ZIP code that belongs to that state. 
            The city will be auto-filled based on the ZIP code validation.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="fullName" className="text-gray-300 text-sm font-medium mb-1.5 block">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="text-gray-300 text-sm font-medium mb-1.5 block">Phone Number <span className="text-red-500">*</span></Label>
            <Input
              id="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              maxLength={12}
              required
            />
          </div>

          <div>
            <Label htmlFor="alternatePhone" className="text-gray-300 text-sm font-medium mb-1.5 block">Alternate Phone Number</Label>
            <Input
              id="alternatePhone"
              placeholder="Enter alternate phone number"
              value={formData.alternatePhone}
              onChange={(e) => handleChange('alternatePhone', e.target.value)}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              maxLength={12}
            />
          </div>


          <div>
            <Label htmlFor="country" className="text-gray-300 text-sm font-medium mb-1.5 block">Country <span className="text-red-500">*</span></Label>
            <Select
              value={formData.country}
              onValueChange={(value) => {
                handleChange('country', value);
              }}
            >
              <SelectTrigger
                className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              >
                <SelectValue placeholder="Select country" className="text-white placeholder:text-gray-400" />
              </SelectTrigger>
              <SelectContent
                className="bg-[var(--color-surface)] border-[#667085]/50 text-white shadow-lg shadow-black/20"
              >
                <SelectItem value="India" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  India
                </SelectItem>
                <SelectItem value="United States" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  United States
                </SelectItem>
                <SelectItem value="United Kingdom" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  United Kingdom
                </SelectItem>
                <SelectItem value="Canada" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  Canada
                </SelectItem>
                <SelectItem value="Australia" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  Australia
                </SelectItem>
                <SelectItem value="Germany" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  Germany
                </SelectItem>
                <SelectItem value="France" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  France
                </SelectItem>
                <SelectItem value="Japan" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  Japan
                </SelectItem>
                <SelectItem value="Singapore" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  Singapore
                </SelectItem>
                <SelectItem value="Other" className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* <div>
            <Label className="text-gray-300 text-sm font-medium mb-1.5 block">Location </Label>
            <Button 
              type="button"
              onClick={handleUseMyLocation}
              className="w-full bg-[var(--color-surface)]/80 border border-[#667085]/50 text-white hover:bg-[#667085]/20 hover:border-[var(--color-primary)]/50 transition-all flex items-center justify-center gap-2"
            >
              <Icons.mapPin className="h-4 w-4 text-[var(--color-primary)]" />
              Use My Location
            </Button>
          </div> */}

                    <div className="relative">
            <Label htmlFor="state" className="text-gray-300 text-sm font-medium mb-1.5 block">State <span className="text-red-500">*</span></Label>
            <Input 
              id="state" 
              placeholder="Enter your state"
              value={formData.state}
              onChange={(e) => handleStateChange(e.target.value)}
              onBlur={handleStateFieldBlur}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              required
            />

            {/* State validation status for US addresses */}
            {formData.country === 'United States' && stateValidation && (
              <div className="mt-2">
                {stateValidation.isValid ? (
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <Icons.check className="h-3 w-3" />
                    <span>{stateValidation.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <Icons.alertCircle className="h-3 w-3" />
                    <span>{stateValidation.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* State suggestions for US addresses */}
            {showStateSuggestions && formData.country === 'United States' && stateSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[#667085]/50 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">State Suggestions</span>
                    <button
                      onClick={handleDismissStateSuggestions}
                      className="text-gray-400 hover:text-white"
                    >
                      <Icons.x className="h-3 w-3" />
                    </button>
                  </div>
                  {stateSuggestions.map((state, index) => (
                    <button
                      key={index}
                      onClick={() => handleStateSuggestionSelect(state)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--color-primary)]/10 rounded-md transition-colors"
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="pincode" className="text-gray-300 text-sm font-medium mb-1.5 block">PIN/ZIP Code <span className="text-red-500">*</span></Label>
            <Input
              id="pincode"
              placeholder={formData.country === 'United States' ? "Enter ZIP code (e.g., 10001)" : "Enter your area PIN/ZIP code"}
              value={formData.pincode}
              onChange={(e) => handleZipcodeChange(e.target.value)}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              required
            />

            {/* Error messages */}
            {pincodeError && (
              <p className="text-red-400 text-xs mt-1">{pincodeError}</p>
            )}

            {/* ZIP code validation status for US addresses */}
            {formData.country === 'United States' && zipcodeValidation && (
              <div className="mt-2">
                {zipcodeValidation.isValid ? (
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <Icons.check className="h-3 w-3" />
                    <span>{zipcodeValidation.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <Icons.alertCircle className="h-3 w-3" />
                    <span>{zipcodeValidation.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>


          <div>
            <Label htmlFor="city" className="text-gray-300 text-sm font-medium mb-1.5 block">City <span className="text-red-500">*</span></Label>
            <Input
              id="city"
              placeholder="Enter your city"

              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              required
            />
          </div>

    
          <div className="relative">
            <Label htmlFor="streetAddress" className="text-gray-300 text-sm font-medium mb-1.5 block">Street Address <span className="text-red-500">*</span></Label>
            <Input
              id="streetAddress"
              placeholder="Enter street address (House No/Building Name, Road Name)"
              value={formData.streetAddress}
              onChange={(e) => handleChange('streetAddress', e.target.value)}
              className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              required
            />
            {/* Street address validation error */}
            {formData.streetAddress.trim() && validateStreetAddress(formData.streetAddress) && !suggestionSelected && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <Icons.alertCircle className="w-3 h-3" />
                {validateStreetAddress(formData.streetAddress)}
              </p>
            )}
            {/* Street address validation success */}
            {formData.streetAddress.trim() && !validateStreetAddress(formData.streetAddress) && !suggestionSelected && (
              <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                <Icons.check className="w-3 w-3" />
                Address format looks good!
              </p>
            )}

            {/* Address validation status for US addresses */}
            {formData.country === 'United States' && !suggestionSelected && (
              <div className="mt-2">
                {validationState.isValidating && (
                  <div className="flex items-center gap-2 text-blue-400 text-xs">
                    <Icons.spinner className="h-3 w-3 animate-spin" />
                    <span>Validating address...</span>
                  </div>
                )}

                {!validationState.isValidating && validationState.isValid && !validateStreetAddress(formData.streetAddress) && (
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <Icons.check className="h-3 w-3" />
                    <span>Address validated successfully</span>
                  </div>
                )}

                {!validationState.isValidating && validationState.isValid && validateStreetAddress(formData.streetAddress) && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs">
                    <Icons.alertTriangle className="h-3 w-3" />
                    <span>Address validated by API but format could be improved</span>
                  </div>
                )}

                {!validationState.isValidating && !validationState.isValid && validationState.error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <Icons.alertCircle className="h-3 w-3" />
                    <span>Address validation failed</span>
                  </div>
                )}
              </div>
            )}

            {/* Address suggestions */}
            {showSuggestions && formData.country === 'United States' && (
              <AddressSuggestions
                suggestions={validationState.suggestions}
                onSelectSuggestion={handleSuggestionSelect}
                onDismiss={handleDismissSuggestions}
                isLoading={validationState.isValidating}
              />
            )}

            {/* Success message when suggestion is selected */}
            {suggestionSelected && (
              <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Icons.check className="h-4 w-4" />
                    <span>Address suggestion applied successfully! Form is now pre-filled with validated data.</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSuggestionSelected(false);
                      clearValidation();
                    }}
                    className="text-green-400 hover:text-green-300 hover:bg-green-400/20"
                  >
                    <Icons.x className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="type" className="text-gray-300 text-sm font-medium mb-1.5 block">
              Type of Address
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                handleChange('type', value);
              }}
            >
              <SelectTrigger
                className="bg-[var(--color-surface)]/80 border-[#667085]/50 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              >
                <SelectValue placeholder="Select address type" className="text-white placeholder:text-gray-400" />
              </SelectTrigger>
              <SelectContent
                className="bg-[var(--color-surface)] border-[#667085]/50 text-white shadow-lg shadow-black/20"
              >
                <SelectItem
                  value="Home"
                  className={`hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white ${existingAddressTypes.includes('Home') && !isEditMode ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  disabled={existingAddressTypes.includes('Home') && !isEditMode}
                >
                  <div className="flex items-center gap-2 hover:text-white">
                    <Icons.home className="h-4 w-4 text-[var(--color-primary)] " />
                    <span>Home</span>
                    {existingAddressTypes.includes('Home') && !isEditMode && (
                      <span className="text-xs text-gray-400 ml-auto">(Already exists)</span>
                    )}
                  </div>
                </SelectItem>
                <SelectItem
                  value="Work"
                  className={`hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white ${existingAddressTypes.includes('Work') && !isEditMode ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  disabled={existingAddressTypes.includes('Work') && !isEditMode}
                >
                  <div className="flex items-center gap-2 hover:text-white">
                    <Icons.briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>Work</span>
                    {existingAddressTypes.includes('Work') && !isEditMode && (
                      <span className="text-xs text-gray-400 ml-auto">(Already exists)</span>
                    )}
                  </div>
                </SelectItem>
                <SelectItem
                  value="Other"
                  className="hover:bg-[var(--color-primary)]/10 focus:bg-[var(--color-primary)]/10 cursor-pointer text-white hover:!text-white"
                >
                  <div className="flex items-center gap-2 hover:text-white">
                    <Icons.mapPin className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>Other</span>
                    <span className="text-xs text-gray-400 ml-auto">(Multiple allowed)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1">
              You can have one Home, one Work, and multiple Other addresses
            </p>
            {existingAddressTypes.includes('Home') && existingAddressTypes.includes('Work') && !isEditMode && (
              <p className="text-xs text-blue-400 mt-1">
                Home and Work addresses are used. You can still add multiple "Other" addresses.
              </p>
            )}
          </div>

          {/* Manual address validation button for US addresses */}
          {formData.country === 'United States' && (
            <div className="md:col-span-2">
              <Button
                type="button"
                onClick={() => {
                  const addressData = {
                    street: formData.streetAddress,
                    city: formData.city,
                    state: formData.state,
                    zipcode: formData.pincode,
                    country: formData.country
                  };
                  if (addressData.street && addressData.city && addressData.state && addressData.zipcode) {
                    // Trigger validation manually using already destructured functions
                    updateAddressData('street', addressData.street);
                    updateAddressData('city', addressData.city);
                    updateAddressData('state', addressData.state);
                    updateAddressData('zipcode', addressData.zipcode);
                    updateAddressData('country', addressData.country);
                  }
                }}
                disabled={validationState.isValidating || !formData.streetAddress || !formData.city || !formData.state || !formData.pincode}
                className="w-full bg-[var(--color-surface)]/80 border border-[#667085]/50 text-white hover:bg-[#667085]/20 hover:border-[var(--color-primary)]/50 transition-all flex items-center justify-center gap-2"
              >
                <Icons.search className="h-4 w-4 text-[var(--color-primary)]" />
                {validationState.isValidating ? 'Validating...' : 'Validate Address'}
              </Button>
            </div>
          )}

          {/* Only show default checkbox when creating a new address */}
          {!isEditMode && (
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="defaultAddress"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                  className="border-[#667085]/50 text-[var(--color-primary)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                />
                <label
                  htmlFor="defaultAddress"
                  className="text-sm font-medium leading-none text-gray-300 cursor-pointer"
                >
                  Set as default address
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8 border-t border-[#667085]/30 pt-6">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/10"
            disabled={isSubmitting || !isFormValid() || (!isEditMode && currentAddressesCount >= 5)}
            title={!isEditMode && formData.type !== 'Other' && existingAddressTypes.includes(formData.type) ?
              `Address type "${formData.type}" already exists. Please select a different type.` :
              undefined
            }
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icons.save className="mr-2 h-4 w-4" />
                Save Address
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
