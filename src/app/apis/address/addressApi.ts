import authAxiosClient from '../auth/axios';

export interface AddressValidationRequest {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  components?: {
    primary_number?: string;
    street_name?: string;
    city_name?: string;
    state_abbreviation?: string;
    zipcode?: string;
  };
}

export interface AddressValidationResponse {
  valid: boolean;
  suggestions?: AddressSuggestion[];
  error?: string;
}

export interface ZipcodeValidationResponse {
  valid: boolean;
  city?: string;
  state?: string;
  error?: string;
}

export interface StateSuggestionsResponse {
  suggestions: string[];
}

export const addressApi = {
  // Validate address using Smarty API
  validateAddress: async (addressData: AddressValidationRequest): Promise<AddressValidationResponse> => {
    try {
      const response = await authAxiosClient.post('/addresses/validate', addressData);
      return response.data.data;
    } catch (error) {
      console.error('Address validation error:', error);
      throw error;
    }
  },

  // Validate ZIP code format
  validateZipcode: async (zipcode: string, country: string = 'United States', state?: string): Promise<ZipcodeValidationResponse> => {
    try {
      const response = await authAxiosClient.get('/addresses/validate/zipcode', {
        params: { zipcode, country, state }
      });
      return response.data.data;
    } catch (error) {
      console.error('ZIP code validation error:', error);
      throw error;
    }
  },

  // Get state suggestions
  getStateSuggestions: async (query: string = ''): Promise<StateSuggestionsResponse> => {
    try {
      const response = await authAxiosClient.get('/addresses/suggestions/states', {
        params: { query }
      });
      return response.data.data;
    } catch (error) {
      console.error('State suggestions error:', error);
      throw error;
    }
  }
}; 