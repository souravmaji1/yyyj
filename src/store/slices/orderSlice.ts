import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';
import { CartItem } from './cartSlice';

interface ProductMedia {
  id: number;
  shopifyId: string | null;
  mediaID: string | null;
  metadata: {
    name: string;
    size: number;
    type: string;
  } | null;
  media_type: string;
  media_origin: number;
  product_id: number;
  userId: string | null;
  src: string;
  position: number;
  isTrial: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  shopifyId: string | null;
  userId: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  status: string;
  handle: string | null;
  template_suffix: string | null;
  admin_graphql_api_id: string | null;
  publishedAt: string | null;
  isTrial: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
  isPublish: number;
  tagName: string;
  features: string[];
  catalog: string | null;
  inventoryStatus: string;
  sellablePlatform: string;
  ageRestriction: boolean;
  originCountry: string;
  manufacturerAddress: string | null;
  productFor: string | null;
  material: string | null;
  compliance: string | null;
  isMultiVariants: boolean;
  expiryDate: string | null;
  source: string;
  isFeature: boolean;
  digitalFiles: string[];
  productFormat: string;
  media: ProductMedia[];
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: number;
  variantId: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface PaymentDetails {
  amount: number;
  currency: string;
  orderType: string;
  paymentMethod: string;
  status?: string;
  transactionId: string;
}

export interface Order {
  id: string;
  totalAmount: string;
  discountAmount: string;
  couponCode: string | null;
  message: string | null;
  status: string;
  userId: string;
  addressId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedReason: string | null;
  transactionId: string;
  paymentMethod: string;
  currency: string;
  paymentDetails: PaymentDetails;
  payment: PaymentDetails;
  paymentId: string;
  orderPaymentId: string;
  orderType: string;
  orderItems: OrderItem[];
  nftDiscount?: {
    nftName: string;
    nftImage: string;
    discountPercent: number;
    collectionName: string;
  };
  logs: any[];

}

interface OrderState {
  userOrders: Order[];
  userOrdersLoading: boolean;
  userOrdersError: string | null;
  currentOrder: Order | null;
  currentOrderLoading: boolean;
  currentOrderError: string | null;
  orderId: string | null;
  orderItems: CreateOrderItem[] | null;
  simulatedDigitalOrder: CartItem[] | null;
  createOrderLoading: boolean;
  createOrderError: string | null;
  createOrderSuccess: boolean;
  createdOrderId: string | null;
  selectedDiscountNFT: any | null;
}

interface CreateOrderItem {
  productId: number | string; // Support both number (regular products) and string (kiosk products UUID)
  variantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreateOrderRequest {
  totalAmount: number;
  discountAmount: number;
  couponCode?: string;
  message?: string;
  addressId?: string;
  currency: string;
  orderItems: CreateOrderItem[];
  machineId?: string; // For kiosk orders
  nftId?: string | null;
  nftName?: string | null;
  nftDiscountAmount?: number;
  nftDiscountPercentage?: number;
  paymentMethod?: string;
}

interface CreateOrderResponse {
  statusCode: number;
  success: boolean;
  message: string;
  orderId: string;
  orderStatus: string;
  totalAmount: number;
  paymentRequired: boolean;
}

const initialState: OrderState = {
  userOrders: [],
  userOrdersLoading: false,
  userOrdersError: null,
  currentOrder: null,
  currentOrderLoading: false,
  currentOrderError: null,
  orderId: null,
  orderItems: null,
  simulatedDigitalOrder: null,
  createOrderLoading: false,
  createOrderError: null,
  createOrderSuccess: false,
  createdOrderId: null,
  selectedDiscountNFT: null,
};

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

export const fetchLatestOrder = createAsyncThunk(
  'order/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get('/orders/latest');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch latest order');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async ({ userId, orderType }: { userId: string; orderType: 'physical' | 'digital' }, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get(`/orders`, {
        params: {
          userId,
          orderType
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post<CreateOrderResponse>('/orders', orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create order'
      );
    }
  }
);

export const createKioskOrder = createAsyncThunk(
  'order/createKiosk',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post<CreateOrderResponse>('/orders/kiosk', orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create kiosk order'
      );
    }
  }
);

export const downloadInvoice = createAsyncThunk(
  'order/downloadInvoice',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice');
    }
  }
);

export const downloadInvoicePdf = createAsyncThunk(
  'order/downloadInvoicePdf',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get(`/orders/${orderId}/invoice/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download PDF invoice');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setSelectedDiscountNFT: (state: OrderState, action: PayloadAction<any>) => {
      state.selectedDiscountNFT = action.payload;
    },
    clearSelectedDiscountNFT: (state: OrderState) => {
      state.selectedDiscountNFT = null;
    },


    clearOrder: (state) => {
      state.userOrders = [];
      state.userOrdersLoading = false;
      state.userOrdersError = null;
      state.currentOrder = null;
      state.currentOrderError = null;
      state.orderId = null;
      state.orderItems = null;
      state.simulatedDigitalOrder = null;
      state.createOrderLoading = false;
      state.createOrderError = null;
      state.createOrderSuccess = false;
      state.createdOrderId = null;
    },
    setOrderId: (state, action) => {
      state.orderId = action.payload;
    },
    setOrderItems: (state, action) => {
      state.orderItems = action.payload;
    },
    setSimulatedDigitalOrder: (state, action) => {
      state.simulatedDigitalOrder = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.currentOrderLoading = true;
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrderError = action.payload as string;
      })
      .addCase(fetchLatestOrder.pending, (state) => {
        state.currentOrderLoading = true;
        state.currentOrderError = null;
      })
      .addCase(fetchLatestOrder.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
        state.orderId = action.payload.id;
      })
      .addCase(fetchLatestOrder.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrderError = action.payload as string;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.userOrdersLoading = true;
        state.userOrdersError = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.userOrdersLoading = false;
        state.userOrders = action.payload;
        state.userOrdersError = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.userOrdersLoading = false;
        state.userOrdersError = action.payload as string;
      })
      .addCase(createOrder.pending, (state) => {
        state.createOrderLoading = true;
        state.createOrderError = null;
        state.createOrderSuccess = false;
        state.createdOrderId = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderSuccess = true;
        state.createdOrderId = action.payload.orderId;
        state.createOrderError = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderSuccess = false;
        state.createOrderError = action.payload as string;
        state.createdOrderId = null;
      })
      .addCase(createKioskOrder.pending, (state) => {
        state.createOrderLoading = true;
        state.createOrderError = null;
        state.createOrderSuccess = false;
        state.createdOrderId = null;
      })
      .addCase(createKioskOrder.fulfilled, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderSuccess = true;
        state.createdOrderId = action.payload.orderId;
        state.createOrderError = null;
      })
      .addCase(createKioskOrder.rejected, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderSuccess = false;
        state.createOrderError = action.payload as string;
        state.createdOrderId = null;
      });
  }
});

export const { clearOrder, setOrderId, setOrderItems, setSimulatedDigitalOrder, setSelectedDiscountNFT, clearSelectedDiscountNFT } = orderSlice.actions;
export default orderSlice.reducer; 