import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartApi from '../api/cartApi';

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
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  loading: false,
  error: null,
};

// Helper: Chuyển đổi dữ liệu từ Backend sang Frontend interface
const mapBackendToFrontend = (backendCart: any): CartItem[] => {
  if (!backendCart || !backendCart.items) return [];
  
  return backendCart.items.map((item: any) => {
    const product = item.productId || {};
    return {
      _id: product._id || '',
      name: product.name || '',
      price: product.price || 0,
      image: product.images?.[0] || '',
      quantity: item.quantity || 0,
      discount: product.discount || 0,
      category: product.categoryId?.name
    };
  });
};

// Helper: Tính toán tổng tiền và số lượng
const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => {
    const priceAfterDiscount = item.discount ? item.price - (item.price * item.discount / 100) : item.price;
    return total + (priceAfterDiscount * item.quantity);
  }, 0);
  return { totalQuantity, totalAmount };
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartApi.getCart();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Không thể tải giỏ hàng');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string, quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartApi.addItem(productId, quantity);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  }
);

export const updateQuantityThunk = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }: { productId: string, quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateQuantity(productId, quantity);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể cập nhật số lượng');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeItem(productId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
    }
  }
);

export const clearCartThunk = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const response = await cartApi.clearCart();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Không thể làm trống giỏ hàng');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = mapBackendToFrontend(action.payload);
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add To Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = mapBackendToFrontend(action.payload);
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;
      })
      
      // Update Quantity
      .addCase(updateQuantityThunk.fulfilled, (state, action) => {
        state.items = mapBackendToFrontend(action.payload);
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;
      })
      
      // Remove Item
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = mapBackendToFrontend(action.payload);
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;
      })
      
      // Clear Cart
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.items = [];
        state.totalQuantity = 0;
        state.totalAmount = 0;
      });
  },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
