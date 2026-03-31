import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  savedForLater?: boolean;
  designThumbnail?: string;
  slug?: string;
};

interface PromoState {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  discount: number;
  description: string | null;
}

type CartState = {
  items: CartItem[];
  promo: PromoState | null;
};

const initialState: CartState = {
  items: [],
  promo: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id && !item.savedForLater,
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, savedForLater: false });
      }
    },

    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    saveForLater: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.savedForLater = true;
      }
    },

    moveToCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.savedForLater = false;
      }
    },

    setPromo: (state, action: PayloadAction<PromoState | null>) => {
      state.promo = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
      state.promo = null;
    },
  },
});

export const {
  addItem,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  saveForLater,
  moveToCart,
  setPromo,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
