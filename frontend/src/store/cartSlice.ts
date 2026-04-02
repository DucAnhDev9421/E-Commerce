import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  totalQuantity: JSON.parse(localStorage.getItem('cartTotalQuantity') || '0'),
  totalAmount: JSON.parse(localStorage.getItem('cartTotalAmount') || '0'),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<any>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item._id === newItem._id);
      
      state.totalQuantity++;
      state.totalAmount += newItem.price;

      if (!existingItem) {
        state.items.push({
          _id: newItem._id,
          name: newItem.name,
          price: newItem.price,
          image: newItem.images?.[0] || '',
          quantity: 1,
          category: newItem.categoryId?.name,
          discount: newItem.discount,
        });
      } else {
        existingItem.quantity++;
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('cartTotalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('cartTotalAmount', JSON.stringify(state.totalAmount));
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item._id === id);
      if (existingItem && quantity >= 1) {
        const diff = quantity - existingItem.quantity;
        state.totalQuantity += diff;
        state.totalAmount += diff * existingItem.price;
        existingItem.quantity = quantity;
        
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('cartTotalQuantity', JSON.stringify(state.totalQuantity));
        localStorage.setItem('cartTotalAmount', JSON.stringify(state.totalAmount));
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item._id === id);
      
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item._id !== id);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('cartTotalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('cartTotalAmount', JSON.stringify(state.totalAmount));
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartTotalQuantity');
      localStorage.removeItem('cartTotalAmount');
    },
  },
});

export const { addItem, removeItem, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
