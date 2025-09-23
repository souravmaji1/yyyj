import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface ProductVariant {
  id: number;
  shopifyId: string;
  title: string;
  price: string;
  tokenPrice: string;
  sku: string;
  position: string | null;
  product_id: number;
  inventory_policy: string;
  compare_at_price: string | null;
  option1: string;
  option2: string | null;
  option3: string;
  admin_graphql_api_id: string;
  image_id: string;
  old_inventory_quantity: number | null;
  inventory_quantity: number;
  inventoryManagement: string | null;
  requires_shipping: boolean;
  barcode: string | null;
  fulfillment_service: string;
  inventory_management: string;
  grams: number | null;
  taxable: boolean;
  weight: string;
  weight_unit: string;
  inventory_item_id: string;
  color: string;
  measurement: string;
  measurementType: string | null;
  fulfillmentService: string | null;
  inventoryStatus: string;
  dimensions: {
    width: string;
    height: string;
    length: string;
  };
  sizes: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductOption {
  id: number;
  name: string;
  product_id: number;
  position: number;
  values: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  id: number;
  shopifyId: string | null;
  mediaID: string | null;
  metadata: {
    name?: string;
    size?: number;
    type?: string;
    alt?: string;
    width?: number;
    height?: number;
    s3Key?: string;
    prompt?: string;
    promptKey?: string;
    productTags?: string[];
    productTitle?: string;
    originalImageUrl?: string;
    productDescription?: string;
  } | null;
  media_type: string;
  media_origin: number;
  product_id: number;
  userId: string | null;
  src: string;
  position: number | null;
  isTrial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
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
  isTrial: boolean;
  media: ProductMedia[];
  variants: ProductVariant[];
  options: ProductOption[];
  tags: string[];
  images: string[];
  image: string | null;
  isBestseller?: boolean;
  discount?: number;
  nftDiscount?: {
    discountPercentage: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  featuredProduct: Product | null;
  featuredProducts: Product[];
  pagination: PaginationInfo;
  featuredPagination: PaginationInfo;
  loading: boolean;
  featuredLoading: boolean;
  selectedProductLoading: boolean;
  error: string | null;
  featuredError: string | null;
  message: string | null;
  filters: {
    category: string | null;
    searchQuery: string;
  };
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  featuredProduct: null,
  featuredProducts: [],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
    hasMore: false
  },
  featuredPagination: {
    currentPage: 1,
    pageSize: 5,
    total: 0,
    hasMore: false
  },
  loading: true,
  featuredLoading: true,
  selectedProductLoading: false,
  error: null,
  featuredError: null,
  message: null,
  filters: {
    category: null,
    searchQuery: '',
  },
};

interface FetchProductsParams {
  page: number;
  limit: number;
  productType: string,
  query?: string;
  sortOption?: string;
  priceMin?: number;
  priceMax?: number;
  catalogs?: string;
  colors?: string;
  sizes?: string;
  append?: boolean;
}

interface FetchKioskProductsParams extends FetchProductsParams {
  machineId: string;
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: FetchProductsParams) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/custom/all-products-for-user`, {
      params
    });
    return response.data;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/custom/featured-products`, {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: number) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/custom/${productId}`);
    return response.data;
  }
);


export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: FormData) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/products`, productData);
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }: { productId: number; productData: FormData }) => {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/products/${productId}`, productData);
    return response.data;
  }
);

// Assuming this is the thunk for uploading digital files
export const uploadDigitalFile = createAsyncThunk(
  'products/uploadDigitalFile',
  async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/products/custom/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

// Fetch products for a specific kiosk machine
export const getProductsForKiosk = createAsyncThunk(
  'products/getProductsForKiosk',
  async (params: FetchKioskProductsParams) => {
    const { machineId, ...rest } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/kiosk-products/published-products-for-machine`,
      {
        params: {
          machineId,
          ...rest,
        },
      }
    );
    return response.data;
  }
);

// --- Kiosk Products (New API) ---

export interface KioskProductMedia {
  id: string;
  productId: string;
  src: string;
  alt: string;
  mediaType: string;
  media_origin: number;
  position: number;
  metadata: {
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface KioskProductSlot {
  id: string;
  machineId: string;
  row: number;
  column: number;
  productId: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KioskProduct {
  id: string;
  name: string;
  catalogType: number;
  tags: string[];
  price: string;
  tokenPrice: string | null;
  quantity: number;
  image: string;
  description: string;
  isActive: boolean;
  isTrial: boolean;
  createdAt: string;
  updatedAt: string;
  machineSlots: KioskProductSlot[];
  media: KioskProductMedia[];
}

interface KioskProductsState {
  items: KioskProduct[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialKioskProductsState: KioskProductsState = {
  items: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchKioskProductsByMachine = createAsyncThunk(
  'products/fetchKioskProductsByMachine',
  async (machineId: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/kiosk-products/by-machine`, {
      params: { machineId },
    });
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    ...initialState,
    kioskProducts: initialKioskProductsState,
  },
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
    },
    setFeaturedPage: (state, action: PayloadAction<number>) => {
      state.featuredPagination.currentPage = action.payload;
    },
    setFeaturedPageSize: (state, action: PayloadAction<number>) => {
      state.featuredPagination.pageSize = action.payload;
    },
    clearProducts: (state) => {
      state.items = [];
      state.pagination = {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        hasMore: false
      };
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Check if we should append or replace products
        if (action.meta.arg.append) {
          state.items = [...state.items, ...(action.payload.products || [])];
        } else {
          state.items = action.payload.products || [];
        }
        state.pagination = action.payload.pagination;
        state.message = action.payload.message;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
        state.items = [];
      })
      // Handle getProductsForKiosk
      .addCase(getProductsForKiosk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsForKiosk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.append) {
          state.items = [...state.items, ...(action.payload.products || [])];
        } else {
          state.items = action.payload.products || [];
        }
        state.pagination = action.payload.pagination;
        state.message = action.payload.message;
      })
      .addCase(getProductsForKiosk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch kiosk products';
        state.items = [];
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedProductLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProductLoading = false;
        state.selectedProduct = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedProductLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
        state.selectedProduct = null;
      })
      // Kiosk Products (New API)
      .addCase(fetchKioskProductsByMachine.pending, (state) => {
        state.kioskProducts.loading = true;
        state.kioskProducts.error = null;
      })
      .addCase(fetchKioskProductsByMachine.fulfilled, (state, action) => {
        state.kioskProducts.loading = false;
        state.kioskProducts.items = action.payload.data || [];
        state.kioskProducts.message = action.payload.message;
      })
      .addCase(fetchKioskProductsByMachine.rejected, (state, action) => {
        state.kioskProducts.loading = false;
        state.kioskProducts.error = action.error.message || 'Failed to fetch kiosk products (new API)';
        state.kioskProducts.items = [];
      });
  },
});

export const {
  setSelectedProduct,
  setCategoryFilter,
  setSearchQuery,
  setPage,
  setPageSize,
  setFeaturedPage,
  setFeaturedPageSize,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer; 