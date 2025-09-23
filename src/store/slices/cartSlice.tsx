import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: number;
  variantId: number;
  shopifyId: string | null;
  title: string;
  price: string;
  compareAtPrice: string | null;
  color: string | null;
  size: string | null;
  length: string | null;
  dimension?: string | null;
  weight?: string | null;
  quantity: number;
  image: string | null;
  inventoryQuantity: number | null;
  tokenPrice: string;
  productHandle: string;
  variantTitle: string;
  soldBy: string;
  userId?: string;
  isDigital: boolean;
}

interface CartTotals {
  subtotal: number;
  tokenSubtotal: number;
  savings: number;
  itemCount: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  totals: CartTotals;
  cartType: "physical" | "digital" | "mixed";
}

const calculateCartTotals = (items: CartItem[]): CartTotals => {
  return items.reduce(
    (totals, item) => {
      const itemPrice = parseFloat(item.price) * item.quantity;
      const itemTokenPrice = parseFloat(item.tokenPrice) * item.quantity;
      const itemComparePrice = item.compareAtPrice
        ? parseFloat(item.compareAtPrice) * item.quantity
        : itemPrice;

      return {
        subtotal: totals.subtotal + itemPrice,
        tokenSubtotal: totals.tokenSubtotal + itemTokenPrice,
        savings: totals.savings + (itemComparePrice - itemPrice),
        itemCount: totals.itemCount + item.quantity,
      };
    },
    {
      subtotal: 0,
      tokenSubtotal: 0,
      savings: 0,
      itemCount: 0,
    }
  );
};

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  totals: {
    subtotal: 0,
    tokenSubtotal: 0,
    savings: 0,
    itemCount: 0,
  },
  cartType: "physical",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;

      // Find if the same product with same variant exists
      const existingItemIndex = state.items.findIndex((item) => {
        // For digital products, only match by productId and variantId
        if (
          newItem.color === null &&
          newItem.size === null &&
          newItem.length === null
        ) {
          return (
            item.productId === newItem.productId &&
            item.variantId === newItem.variantId
          );
        }
        // For physical products, match all attributes including dimension
        return (
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId &&
          item.color === newItem.color &&
          item.size === newItem.size &&
          item.length === newItem.length &&
          item.dimension === newItem.dimension
        );
      });

      if (existingItemIndex !== -1) {
        // If item exists, update quantity
        const existingItem = state.items[existingItemIndex];
        if (existingItem) {
          const newQuantity = existingItem.quantity + newItem.quantity;

        // Check if new quantity exceeds inventory (skip for digital products)
        if (
          existingItem.inventoryQuantity !== null &&
          newQuantity > existingItem.inventoryQuantity
        ) {
          state.error = `Cannot add more items. Only ${existingItem.inventoryQuantity} available in stock.`;
          return;
        }

          existingItem.quantity = newQuantity;
        }
      } else {
        // If item doesn't exist, add new item
        state.items.push(newItem);
      }
      state.error = null;
      state.totals = calculateCartTotals(state.items);

      // Determine and set cartType after adding/updating item
      const hasPhysical = state.items.some((item) => !item.isDigital);
      const hasDigital = state.items.some((item) => item.isDigital);

      if (hasPhysical && hasDigital) {
        state.cartType = "mixed";
      } else if (hasDigital) {
        state.cartType = "digital";
      } else {
        state.cartType = "physical";
      }
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ productId: number; variantId: number }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.variantId === action.payload.variantId
          )
      );
      state.totals = calculateCartTotals(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: number;
        variantId: number;
        quantity: number;
      }>
    ) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.productId === productId && item.variantId === variantId
      );

      if (item) {
        if (quantity < 1) {
          // Remove item if quantity is less than 1
          state.items = state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          );
        } else if (
          item.inventoryQuantity !== null &&
          quantity > item.inventoryQuantity
        ) {
          state.error = `Cannot add more items. Only ${item.inventoryQuantity} available in stock.`;
          return;
        } else {
          item.quantity = quantity;
        }
        state.error = null;
        state.totals = calculateCartTotals(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.error = null;
      state.totals = {
        subtotal: 0,
        tokenSubtotal: 0,
        savings: 0,
        itemCount: 0,
      };
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Selector to get cart totals
export const selectCartTotals = (state: { cart: CartState }) =>
  state.cart.totals;

// Selector to get cart items count
export const selectCartItemsCount = (state: { cart: CartState }) =>
  state.cart.totals.itemCount;

// Selector to check if a specific variant is in cart
export const selectIsVariantInCart = (
  state: { cart: CartState },
  variantId: number
) => state.cart.items.some((item) => item.variantId === variantId);

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;
