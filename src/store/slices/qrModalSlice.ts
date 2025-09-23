import { createSlice } from '@reduxjs/toolkit';

const qrModalSlice = createSlice({
  name: 'qrModal',
  initialState: { open: false },
  reducers: {
    openQrModal: (state) => { state.open = true; },
    closeQrModal: (state) => { state.open = false; },
    setQrModal: (state, action) => { state.open = action.payload; }
  }
});

export const { openQrModal, closeQrModal, setQrModal } = qrModalSlice.actions;
export default qrModalSlice.reducer; 