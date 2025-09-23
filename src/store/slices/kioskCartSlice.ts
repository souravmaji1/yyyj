import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KioskProduct } from "./productSlice";

export interface KioskCartItem {
  productId: string;
  name: string;
  price: string;
  tokenPrice: string;
  image: string;
  description: string;
  quantity: number;
  totalStock: number;
  tags: string[];
}

interface KioskCartTotals {
  subtotal: number;
  itemCount: number;
}

interface KioskCartState {
  items: KioskCartItem[];
  totals: KioskCartTotals;
  isLoading: boolean;
  error: string | null;
}

const calculateKioskCartTotals = (items: KioskCartItem[]): KioskCartTotals => {
  console.log('Calculating totals for items:', items); // Debug log
  return items.reduce(
    (totals, item) => {
      // Use tokenPrice for XUT calculation, fallback to price if tokenPrice is not available
      const itemPrice = parseFloat(item.tokenPrice || item.price) * item.quantity;
      console.log(`Item ${item.name}: tokenPrice=${item.tokenPrice}, price=${item.price}, quantity=${item.quantity}, itemPrice=${itemPrice}`); // Debug log
      return {
        subtotal: totals.subtotal + itemPrice,
        itemCount: totals.itemCount + item.quantity,
      };
    },
    {
      subtotal: 0,
      itemCount: 0,
    }
  );
};

const initialState: KioskCartState = {
  items: [],
  totals: {
    subtotal: 0,
    itemCount: 0,
  },
  isLoading: false,
  error: null,
};

const kioskCartSlice = createSlice({
  name: "kioskCart",
  initialState,
  reducers: {
    addToKioskCart: (state, action: PayloadAction<KioskCartItem>) => {
      const newItem = action.payload;
      
      // Find if the same product exists
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === newItem.productId
      );

      if (existingItemIndex !== -1) {
        // If same product exists, update quantity
        const existingItem = state.items[existingItemIndex];
        if (existingItem) {
          const newQuantity = existingItem.quantity + newItem.quantity;

          // Check if new quantity exceeds stock
          if (newQuantity > existingItem.totalStock) {
            state.error = `Cannot add more items. Only ${existingItem.totalStock} available in stock.`;
            return;
          }

          existingItem.quantity = newQuantity;
        }
      } else {
        // If different product, replace entire cart with new product
        state.items = [newItem]; // Replace all items with just the new one
      }
      
      state.error = null;
      console.log('Cart items after adding:', state.items); // Debug log
      state.totals = calculateKioskCartTotals(state.items);
      console.log('Calculated totals:', state.totals); // Debug log
    },

    removeFromKioskCart: (state, action: PayloadAction<{ productId: string }>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload.productId
      );
      state.totals = calculateKioskCartTotals(state.items);
    },

    updateKioskCartQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.productId === productId);

      if (item) {
        if (quantity < 1) {
          // Remove item if quantity is less than 1
          state.items = state.items.filter((i) => i.productId !== productId);
        } else if (quantity > item.totalStock) {
          state.error = `Cannot add more items. Only ${item.totalStock} available in stock.`;
          return;
        } else {
          item.quantity = quantity;
        }
        state.error = null;
        state.totals = calculateKioskCartTotals(state.items);
      }
    },

    clearKioskCart: (state) => {
      state.items = [];
      state.error = null;
      state.totals = {
        subtotal: 0,
        itemCount: 0,
      };
    },

    setKioskCartError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Selectors
export const selectKioskCartTotals = (state: { kioskCart: KioskCartState }) =>
  state.kioskCart.totals;

export const selectKioskCartItemsCount = (state: { kioskCart: KioskCartState }) =>
  state.kioskCart.totals.itemCount;

export const {
  addToKioskCart,
  removeFromKioskCart,
  updateKioskCartQuantity,
  clearKioskCart,
  setKioskCartError,
} = kioskCartSlice.actions;

export default kioskCartSlice.reducer; 