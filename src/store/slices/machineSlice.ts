import authAxiosClient from '@/src/app/apis/auth/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to get user by machine ID
export const getUserByMachineId = createAsyncThunk(
  'machine/getUserByMachineId',
  async (machineId: string, { rejectWithValue }) => {
    try {      

       const response = await authAxiosClient.post('/machine/get-user', {machineId});

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to get user by machine ID'
      );
    }
  }
);

interface MachineState {
  userData: any;
  loading: boolean;
  error: string | null;
}

const initialState: MachineState = {
  userData: null,
  loading: false,
  error: null,
};

const machineSlice = createSlice({
  name: 'machine',
  initialState,
  reducers: {
    clearMachineData: (state) => {
      state.userData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserByMachineId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserByMachineId.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(getUserByMachineId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMachineData } = machineSlice.actions;
export default machineSlice.reducer; 