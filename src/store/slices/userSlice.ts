import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';
import { RootState } from '@/src/store';
import { paymentAxiosClient } from '@/src/app/apis/auth/axios';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
  shopifyConnected: boolean;
  shopifyAccessToken: string | null;
  shopifyShopName: string | null;
  role: string;
  age: number | null;
  kycStatus: string;
  isKycCompleted?: boolean;
  accountStatus: string;
  isAdult: boolean;
  idpUsername: string;
  createdAt: string;
  updatedAt: string;
  walletAddress: string;
  tokenBalance?: number | null;
  isEnableEmailNotification?: boolean;
  isEnablePushNotification?: boolean;
  isAdManagementEnabled?: boolean;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  location: string;
  houseNo: string;
  buildingName: string;
  typeOfAddress: string;
  setAsDefault: boolean;
}

interface UserState {
  profile: UserProfile | null;
  addresses: Address[];
  loading: boolean;
  error: string | null;
  selectedAddressId: string | null;
  tokenBalance: number | null;
  passwordChangeLoading: boolean;
  passwordChangeError: string | null;
  userCache?: Record<string, UserProfile>;
}

const initialState: UserState = {
  profile: null,
  addresses: [],
  loading: false,
  error: null,
  selectedAddressId: null,
  tokenBalance: null,
  passwordChangeLoading: false,
  passwordChangeError: null,
  userCache: {},
};

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const userId = state.user.profile?.id; // Get user ID from existing state if available

      // Fetch user profile details
      const profileResponse = await authAxiosClient.get('/auth/me');
      let profileData = profileResponse.data.data; // Profile data

      if (profileResponse.data.status) {
        return profileData; // Return combined data
      }
      return rejectWithValue(profileResponse.data.message || 'Failed to fetch profile');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Add new thunk for addresses
export const fetchUserAddresses = createAsyncThunk(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get('/addresses');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

// Add this enum for address types
export enum AddressType {
    Home = 'Home',
    Work = 'Work',
    Office = 'Office',
    Other = 'Other'
}

// Add this interface for the save address payload
interface SaveAddressPayload {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isActive: boolean;
    fullName: string;
    phoneNumber: string;
    alternatePhoneNumber: string;
    location: string;
    houseNo: string;
    buildingName: string;
    typeOfAddress: AddressType;
    setAsDefault: boolean;
}

// Add new thunk for saving address
export const saveUserAddress = createAsyncThunk(
    'user/saveAddress',
    async (addressData: SaveAddressPayload, { rejectWithValue, dispatch }) => {
        try {
            const response = await authAxiosClient.post('/addresses', addressData);
            // Fetch updated addresses after saving
            dispatch(fetchUserAddresses());
            return response.data;
        } catch (error: any) {
            const errorMessage = error || 'Failed to save address';
            return rejectWithValue(errorMessage);
        }
    }
);

// Add new thunk for updating address
export const updateUserAddress = createAsyncThunk(
    'user/updateAddress',
    async ({ addressId, addressData }: { addressId: string; addressData: Partial<SaveAddressPayload> }, { rejectWithValue, dispatch }) => {
        try {
            const response = await authAxiosClient.put(`/addresses/${addressId}`, addressData);
            
            if (response.data.status) {
                // Fetch updated addresses after updating
                dispatch(fetchUserAddresses());
                return {
                    addressId,
                    updatedAddress: response.data.data,
                    message: response.data.message || 'Address updated successfully'
                };
            }
            return rejectWithValue(response.data.message || 'Failed to update address');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update address';
            return rejectWithValue(errorMessage);
        }
    }
);

// Add new thunk for setting address as default
export const setDefaultAddress = createAsyncThunk(
    'user/setDefaultAddress',
    async (addressId: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await authAxiosClient.put(`/addresses/${addressId}/default`);
            
            if (response.data.status) {
                // Fetch updated addresses after setting default
                dispatch(fetchUserAddresses());
                return {
                    addressId,
                    message: response.data.message || 'Default address updated successfully'
                };
            }
            return rejectWithValue(response.data.message || 'Failed to set default address');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to set default address';
            return rejectWithValue(errorMessage);
        }
    }
);

// Add new thunk for deleting address
export const deleteUserAddress = createAsyncThunk(
    'user/deleteAddress',
    async (addressId: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await authAxiosClient.delete(`/addresses/${addressId}`);
            
            if (response.data.status) {
                // Fetch updated addresses after deletion
                dispatch(fetchUserAddresses());
                return {
                    addressId,
                    message: response.data.message || 'Address deleted successfully'
                };
            }
            return rejectWithValue(response.data.message || 'Failed to delete address');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete address';
            return rejectWithValue(errorMessage);
        }
    }
);

// Add new thunk for fetching wallet balance
export const fetchWalletBalance = createAsyncThunk(
  'user/fetchWalletBalance',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.get(`/getUserWalletBalance/${userId}`);
      if (response.data.success) {
        return response.data.data.balance;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add new thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAxiosClient.put('/user/profile', profileData);
      
      if (response.data.status) {
        // Fetch updated profile after updating
        dispatch(fetchUserProfile());
        return {
          data: response.data.data,
          message: response.data.message || 'Profile updated successfully'
        };
      }
      return rejectWithValue(response.data.message || 'Failed to update profile');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      return rejectWithValue(errorMessage);
    }
  }
);

// Add new thunk for updating notification settings
export const updateNotificationSettings = createAsyncThunk(
  'user/updateNotificationSettings',
  async (settings: { isEnableEmailNotification?: boolean; isEnablePushNotification?: boolean }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAxiosClient.put('/notifications/settings', settings);
      
      if (response.data.status) {
        // Fetch updated profile after updating settings
        dispatch(fetchUserProfile());
        return {
          data: response.data.data,
          message: response.data.message || 'Notification settings updated successfully'
        };
      }
      return rejectWithValue(response.data.message || 'Failed to update notification settings');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update notification settings';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for updating user profile picture
export const updateProfilePicture = createAsyncThunk(
  'user/updateProfilePicture',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authAxiosClient.put('/user/change-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.status) {
        return {
          data: response.data.data,
          message: response.data.message
        };
      }
      return rejectWithValue(response.data.message || 'Failed to update profile picture');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile picture');
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.put('/user/change-password', passwordData);
      
      if (response.data.status) {
        return {
          message: response.data.message || 'Password changed successfully'
        };
      }
      return rejectWithValue(response.data.message || 'Failed to change password');
    } catch (error: any) {
      return rejectWithValue(error)
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.profile = null;
      state.addresses = [];
      state.loading = false;
      state.error = null;
      state.selectedAddressId = null;
      state.tokenBalance = null;
      state.passwordChangeLoading = false;
      state.passwordChangeError = null;
      state.userCache = {};
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updateSelectedAddressId: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload;
    },
    // Update wallet balance immediately after payment
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      state.tokenBalance = action.payload;
      if (state.profile) {
        state.profile.tokenBalance = action.payload;
      }
    },
       // Update token balance for AI Studio operations
    updateTokenBalance: (state, action: PayloadAction<number>) => {
      // Update token balance in both places
      state.tokenBalance = action.payload;
      if (state.profile) {
        state.profile = {
          ...state.profile,
          tokenBalance: action.payload
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // Store token balance separately
        const tokenBalance = action.payload.tokenBalance || state.tokenBalance;
        state.tokenBalance = tokenBalance;
        
        state.profile = {
          ...action.payload,
          tokenBalance: tokenBalance, // Ensure token balance is in profile
          isKycCompleted:
            action.payload.kycStatus === 'verified',
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload.data || [];
        state.loading = false;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserAddress.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        const { addressId, updatedAddress } = action.payload;
        // Update the specific address in the addresses array
        state.addresses = state.addresses.map(address => 
          address.id === addressId ? { ...address, ...updatedAddress } : address
        );
        state.loading = false;
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.tokenBalance = action.payload; // Update separate storage
        if (state.profile) {
          state.profile = {
            ...state.profile,
            tokenBalance: action.payload
          };
        }
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = {
            ...state.profile,
            ...action.payload.data,
            tokenBalance: state.tokenBalance // Preserve token balance
          };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = {
            ...state.profile,
            profilePicture: action.payload.data.profilePicture || action.payload.data,
            tokenBalance: state.tokenBalance // Preserve token balance
          };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload as string;
      })
      .addCase(updateNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = {
            ...state.profile,
            ...action.payload.data,
            tokenBalance: state.tokenBalance // Preserve token balance
          };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearUser, updateProfile, updateSelectedAddressId, updateWalletBalance, updateTokenBalance } = userSlice.actions;
export default userSlice.reducer; 