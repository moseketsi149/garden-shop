import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sampleProducts } from '../../api/seedProducts';

let unsubscribeProducts = null;

/**
  * Start realtime Firestore listener
  */
export const startProductsListener = () => async (dispatch) => {
  if (unsubscribeProducts) return;

  dispatch(setProductsLoading(true));
  dispatch(setProductsError(null));

  try {
    console.log('Starting Firestore products listener...');

    const productsRef = collection(db, 'products');

    unsubscribeProducts = onSnapshot(
      productsRef,

      (snapshot) => {
        console.log(
          `Firestore products count: ${snapshot.size} (fromCache=${snapshot.metadata.fromCache}, hasPendingWrites=${snapshot.metadata.hasPendingWrites})`
        );

        const products = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter((product, index, array) => {
            return array.findIndex((item) => item.name === product.name) === index;
          });

        console.log(
          'Products loaded (deduplicated):',
          products.map((p) => p.name)
        );

        dispatch(setProducts(products));
        dispatch(setProductsLoading(false));

        if (products.length === 0) {
          console.warn('Snapshot returned 0 products despite no listener error.');
        }
      },

      (error) => {
        console.error(
          'Firestore listener error:',
          error.message || error
        );

        const fallback = ['not-found', 'unavailable', 'permission-denied'].includes(error?.code) ||
          error?.message?.toLowerCase().includes('offline') ||
          error?.message?.toLowerCase().includes('could not reach cloud firestore backend');

        if (fallback) {
          console.warn('Using fallback sample products due to Firestore failure');
          const fallbackProducts = sampleProducts.map((product, index) => ({
            id: product.name ? product.name.replace(/\s+/g, '-').toLowerCase() : `local-${index}`,
            ...product,
          }));
          dispatch(setProducts(fallbackProducts));
          dispatch(setProductsError(null));
          dispatch(setProductsLoading(false));
          return;
        }

        dispatch(
          setProductsError(
            error?.message ||
              (error?.code === 'permission-denied' ? 'Permission denied - check Firestore rules' : 'Failed to sync products')
          )
        );

        dispatch(setProductsLoading(false));
      }
    );
  } catch (error) {
    console.error(
      'Failed to start products listener:',
      error.message || error
    );

    dispatch(
      setProductsError(
        error?.message ||
          'Failed to start products listener'
      )
    );

    dispatch(setProductsLoading(false));
  }
};

/**
 * Stop listener
 */
export const stopProductsListener = () => () => {
  if (unsubscribeProducts) {
    unsubscribeProducts();
    unsubscribeProducts = null;
    console.log('Products listener stopped');
  }
};

/**
 * Add Product
 */
export const addProduct = createAsyncThunk(
  'order/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const payload = {
        ...productData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, 'products'),
        payload
      );

      return {
        id: docRef.id,
        ...productData,
      };
    } catch (error) {
      console.error('Add product failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update Product
 */
export const updateProduct = createAsyncThunk(
  'order/updateProduct',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const payload = {
        ...productData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(
        doc(db, 'products', id),
        payload
      );

      return {
        id,
        ...productData,
      };
    } catch (error) {
      console.error('Update product failed:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete Product
 */
export const deleteProduct = createAsyncThunk(
  'order/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'products', id));

      return id;
    } catch (error) {
      console.error('Delete product failed:', error);
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

    setProductsLoading(state, action) {
      state.loading = action.payload;
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
        state.error =
          action.payload ||
          'Failed to add product';
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );

        if (index >= 0) {
          state.products[index] =
            action.payload;
        }
      })

      .addCase(updateProduct.rejected, (state, action) => {
        state.error =
          action.payload ||
          'Failed to update product';
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p) => p.id !== action.payload
        );
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.error =
          action.payload ||
          'Failed to delete product';
      });
  },
});

export const {
  setProducts,
  setProductsLoading,
  setProductsError,
  createOrder,
} = orderSlice.actions;

export default orderSlice.reducer;