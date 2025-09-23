import { useState, useCallback, useEffect } from 'react';
import { addressApi, AddressValidationRequest, AddressSuggestion } from '@/src/app/apis/address/addressApi';
import { useDebounce } from './useDebounce';

export interface AddressValidationState {
  isValidating: boolean;
  isValid: boolean;
  suggestions: AddressSuggestion[];
  error: string | null;
  lastValidated: string | null;
}

export const useAddressValidation = () => {
  const [validationState, setValidationState] = useState<AddressValidationState>({
    isValidating: false,
    isValid: false,
    suggestions: [],
    error: null,
    lastValidated: null
  });

  const [addressData, setAddressData] = useState<Partial<AddressValidationRequest>>({});
  const debouncedAddressData = useDebounce(addressData, 1000); // 1 second delay

  // Auto-validate when address data changes (debounced)
  useEffect(() => {
    // Skip validation if we already have a valid suggestion selected for the SAME address
    if (validationState.isValid && validationState.lastValidated) {
      const currentAddress = `${debouncedAddressData.street}-${debouncedAddressData.city}-${debouncedAddressData.state}-${debouncedAddressData.zipcode}`;
      
      // Only skip if it's the exact same address
      if (currentAddress === validationState.lastValidated) {
        return;
      }
    }
    
    if (debouncedAddressData.street && debouncedAddressData.city && 
        debouncedAddressData.state && debouncedAddressData.zipcode && 
        debouncedAddressData.country === 'United States') {
      validateAddress(debouncedAddressData as AddressValidationRequest);
    }
  }, [debouncedAddressData, validationState.isValid, validationState.lastValidated]);

  const validateAddress = useCallback(async (data: AddressValidationRequest) => {
    const addressKey = `${data.street}-${data.city}-${data.state}-${data.zipcode}`;
    
    // Skip if we've already validated this exact address
    if (validationState.lastValidated === addressKey) {
      return;
    }

    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      error: null
    }));

    try {
      const result = await addressApi.validateAddress(data);
      
      if (result.valid && result.suggestions && result.suggestions.length > 0) {
        // Address is valid and has suggestions
        setValidationState({
          isValidating: false,
          isValid: true,
          suggestions: result.suggestions,
          error: null,
          lastValidated: addressKey
        });
      } else if (result.valid) {
        // Address is valid but no suggestions needed
        setValidationState({
          isValidating: false,
          isValid: true,
          suggestions: [], // Clear suggestions when address is valid
          error: null,
          lastValidated: addressKey
        });
      } else {
        // Address is invalid
        setValidationState({
          isValidating: false,
          isValid: false,
          suggestions: [],
          error: result.error || 'Address validation failed',
          lastValidated: null
        });
      }
    } catch (error) {
      setValidationState({
        isValidating: false,
        isValid: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Validation failed',
        lastValidated: null
      });
    }
  }, [validationState.lastValidated]);

  const validateZipcode = useCallback(async (zipcode: string, country: string = 'United States') => {
    try {
      const result = await addressApi.validateZipcode(zipcode, country);
      return result.valid;
    } catch (error) {
      console.error('ZIP code validation error:', error);
      return false;
    }
  }, []);

  const getStateSuggestions = useCallback(async (query: string) => {
    try {
      const result = await addressApi.getStateSuggestions(query);
      return result.suggestions;
    } catch (error) {
      console.error('State suggestions error:', error);
      return [];
    }
  }, []);

  const updateAddressData = useCallback((field: keyof AddressValidationRequest, value: string) => {
    // If we're clearing data (empty value), allow it
    if (!value.trim()) {
      setAddressData(prev => ({
        ...prev,
        [field]: value
      }));
      return;
    }
    
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      isValid: false,
      suggestions: [],
      error: null,
      lastValidated: null
    });
    // Also clear address data to prevent re-validation
    setAddressData({});
    // Don't disable suggestions completely - just clear current state
    // setSuggestionsDisabled(true); // Removed this line
  }, []);

  const resetValidationState = useCallback(() => {
    setValidationState({
      isValidating: false,
      isValid: false,
      suggestions: [],
      error: null,
      lastValidated: null
    });
    setAddressData({});
  }, []);

  const selectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    // Parse the suggestion to extract house number and street name
    let houseNo = '';
    let roadName = '';
    
    if (suggestion.components) {
      // Use components if available (preferred method)
      houseNo = suggestion.components.primary_number || '';
      roadName = suggestion.components.street_name || '';
    } else if (suggestion.street) {
      // Parse the full street address
      const streetParts = suggestion.street.split(' ');
      const firstPart = streetParts[0];
      if (streetParts.length > 0 && firstPart && /^\d+/.test(firstPart)) {
        houseNo = firstPart;
        roadName = streetParts.slice(1).join(' ');
      } else {
        roadName = suggestion.street;
      }
    }
    
    // Create a unique key for this validated address
    const addressKey = `${suggestion.street}-${suggestion.city}-${suggestion.state}-${suggestion.zipcode}`;
    
    // Update address data with the COMPLETE suggestion
    setAddressData({
      street: suggestion.street,
      city: suggestion.city,
      state: suggestion.state,
      zipcode: suggestion.zipcode,
      country: suggestion.country
    });

    // Set validation state to SUCCESS and prevent further validation
    setValidationState({
      isValidating: false,
      isValid: true,
      suggestions: [], // Clear suggestions to prevent them from showing again
      error: null,
      lastValidated: addressKey // This prevents re-validation of the same address
    });
    
    // Return parsed data for form update
    return {
      houseNo,
      roadName,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.zipcode
    };
  }, []);

  return {
    validationState,
    addressData,
    validateAddress,
    validateZipcode,
    getStateSuggestions,
    updateAddressData,
    clearValidation,
    resetValidationState,
    selectSuggestion
  };
}; 