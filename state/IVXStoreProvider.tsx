"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IVXStoreState, IVXStoreAction, IVXSelection } from "@/lib/ivx-types";
import { fetchProductsFromAPI } from "@/lib/ivx-fetchers";
import { getCacheKey, createQueryString } from "@/lib/ivx-utils";

// Initial state
const initialState: IVXStoreState = {
  selected: null,
  productCache: {},
  walletXUT: 1250, // Mock wallet balance
  cartCount: 0,
};

// Reducer function
function ivxStoreReducer(state: IVXStoreState, action: IVXStoreAction): IVXStoreState {
  switch (action.type) {
    case "SELECT_ITEM":
      return {
        ...state,
        selected: action.payload,
      };

    case "LOAD_PRODUCTS_REQUEST":
      return {
        ...state,
        productCache: {
          ...state.productCache,
          [action.payload.key]: {
            status: "loading",
            items: [],
            error: undefined,
          },
        },
      };

    case "LOAD_PRODUCTS_SUCCESS":
      return {
        ...state,
        productCache: {
          ...state.productCache,
          [action.payload.key]: {
            status: "success",
            items: action.payload.items,
            error: undefined,
          },
        },
      };

    case "LOAD_PRODUCTS_FAILURE":
      return {
        ...state,
        productCache: {
          ...state.productCache,
          [action.payload.key]: {
            status: "error",
            items: [],
            error: action.payload.error,
          },
        },
      };

    case "UPDATE_WALLET":
      return {
        ...state,
        walletXUT: action.payload.balance,
      };

    case "UPDATE_CART":
      return {
        ...state,
        cartCount: action.payload.count,
      };

    default:
      return state;
  }
}

// Context
const IVXStoreContext = createContext<IVXStoreState | null>(null);
const IVXDispatchContext = createContext<React.Dispatch<IVXStoreAction> | null>(null);

// Provider component
interface IVXStoreProviderProps {
  children: React.ReactNode;
}

export function IVXStoreProvider({ children }: IVXStoreProviderProps) {
  const [state, dispatch] = useReducer(ivxStoreReducer, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize selection from URL params on mount
  useEffect(() => {
    const videoId = searchParams?.get("videoId");
    const eventId = searchParams?.get("eventId");

    if (videoId) {
      dispatch({
        type: "SELECT_ITEM",
        payload: { kind: "video", id: videoId },
      });
    } else if (eventId) {
      dispatch({
        type: "SELECT_ITEM",
        payload: { kind: "event", id: eventId },
      });
    }
  }, [searchParams]);

  // Auto-fetch products when selection changes
  useEffect(() => {
    if (!state.selected) return;

    const cacheKey = getCacheKey(state.selected.kind, state.selected.id);
    
    // Skip if already loading or loaded
    const cached = state.productCache[cacheKey];
    if (cached && (cached.status === "loading" || cached.status === "success")) {
      return;
    }

    // Start loading
    dispatch({
      type: "LOAD_PRODUCTS_REQUEST",
      payload: { key: cacheKey },
    });

    // Fetch products
    fetchProductsFromAPI(state.selected.kind, state.selected.id)
      .then((items) => {
        dispatch({
          type: "LOAD_PRODUCTS_SUCCESS",
          payload: { key: cacheKey, items },
        });
      })
      .catch((error) => {
        dispatch({
          type: "LOAD_PRODUCTS_FAILURE",
          payload: { key: cacheKey, error: error.message },
        });
      });
  }, [state.selected, state.productCache]);

  return (
    <IVXStoreContext.Provider value={state}>
      <IVXDispatchContext.Provider value={dispatch}>
        {children}
      </IVXDispatchContext.Provider>
    </IVXStoreContext.Provider>
  );
}

// Custom hooks
export function useIVXStore() {
  const context = useContext(IVXStoreContext);
  if (!context) {
    throw new Error("useIVXStore must be used within IVXStoreProvider");
  }
  return context;
}

export function useIVXDispatch() {
  const context = useContext(IVXDispatchContext);
  if (!context) {
    throw new Error("useIVXDispatch must be used within IVXStoreProvider");
  }
  return context;
}

// Helper hook for selection actions
export function useIVXSelection() {
  const dispatch = useIVXDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectItem = (selection: IVXSelection) => {
    // Update store state
    dispatch({
      type: "SELECT_ITEM",
      payload: selection,
    });

    // Update URL with query params
    const currentParams = new URLSearchParams(searchParams?.toString() || '');
    
    // Clear previous selection params
    currentParams.delete("videoId");
    currentParams.delete("eventId");
    
    // Set new selection param
    if (selection.kind === "video") {
      currentParams.set("videoId", selection.id);
    } else {
      currentParams.set("eventId", selection.id);
    }

    // Navigate with updated params
    const queryString = currentParams.toString();
    const newPath = queryString ? `?${queryString}` : "";
    
    router.replace(newPath, { scroll: false });
  };

  return { selectItem };
}