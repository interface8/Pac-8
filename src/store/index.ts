import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

const CART_STORAGE_KEY = "pac8_cart";

function loadCartState() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    return { cart: JSON.parse(raw) };
  } catch {
    return undefined;
  }
}

function saveCartState(state: ReturnType<typeof store.getState>["cart"]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or SSR — ignore
  }
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: typeof window !== "undefined" ? loadCartState() : undefined,
});

// Persist cart to localStorage on every state change
store.subscribe(() => {
  saveCartState(store.getState().cart);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
