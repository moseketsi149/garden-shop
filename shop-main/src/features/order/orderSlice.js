import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

let unsubscribeProducts = null;

export const startProductsListener = () => (dispatch) => {
  if (unsubscribeProducts) return;

  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

  unsubscribeProducts = onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      dispatch(setProducts(products));
    },
    (error) => {
      dispatch(setProductsError(error?.message || 'Failed to sync products'));
    }
  );

  return () => {
    if (unsubscribeProducts) {
      unsubscribeProducts();
      unsubscribeProducts = null;
    }
  };
};

export const stopProductsListener = () => () => {
  if (unsubscribeProducts) {
    unsubscribeProducts();
    unsubscribeProducts = null;
  }
};

export const addProduct = createAsyncThunk(
  'order/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const payload = {
        ...productData,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'products'), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'order/updateProduct',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const payload = {
        ...productData,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'products', id), payload);
      return { id, ...payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'order/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null,
  history: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setProducts(state, action) {
      state.products = action.payload;
    },
    setProductsError(state, action) {
      state.error = action.payload;
    },
    createOrder(state, action) {
      const order = {
        id: `ord-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      state.history.unshift(order);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add product';
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index >= 0) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update product';
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete product';
      });
  },
});

export const { setProducts, setProductsError, createOrder } = orderSlice.actions;
export default orderSlice.reducer;
