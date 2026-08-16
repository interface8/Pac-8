import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string;
  cartLineId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  savedForLater?: boolean;
  designThumbnail?: string;
  slug?: string;
  customPrint?: boolean;
  printPrice?: number;
  designId?: string;
  // Full design JSON snapshot (element positions, colors, fonts, per-view state, etc.)
  // stored locally so a customization can always be reopened for editing / re-ordered
  // even if it was never (or couldn't be) saved server-side as a SavedDesign (e.g. guests).
  designData?: string;
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

function generateCartLineId() {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, "cartLineId">>) => {
      const pl = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.id === pl.id &&
          !item.savedForLater &&
          Boolean(item.customPrint) === Boolean(pl.customPrint) &&
          (item.designId ?? null) === (pl.designId ?? null),
      );

      if (existingItem) {
        existingItem.quantity += pl.quantity || 1;
      } else {
        state.items.push({ ...pl, cartLineId: generateCartLineId(), savedForLater: false });
      }
    },

    // Replaces a specific cart line's design/quantity/price in place (rather than
    // merging quantities like addItem) — used when re-editing a design that's
    // already in the cart, so it updates that exact line instead of duplicating
    // or bumping the quantity of a stale, unrelated match.
    updateItemDesign: (
      state,
      action: PayloadAction<{ cartLineId: string } & Partial<Omit<CartItem, "cartLineId">>>
    ) => {
      const { cartLineId, ...updates } = action.payload;
      const item = state.items.find((i) => i.cartLineId === cartLineId);
      if (item) Object.assign(item, updates);
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
  updateItemDesign,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  saveForLater,
  moveToCart,
  setPromo,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
