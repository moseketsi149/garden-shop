import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/order/orderSlice';
import userReducer from '../features/auth/userSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import locationsReducer from '../features/locations/locationsSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    locations: locationsReducer,
  }
});

export default store;
