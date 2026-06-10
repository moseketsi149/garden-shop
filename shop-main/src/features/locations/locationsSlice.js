import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

let unsubscribeLocations = null;

export const startLocationsListener = () => (dispatch) => {
  if (unsubscribeLocations) return;

  const q = query(collection(db, 'locations'), orderBy('createdAt', 'desc'));

  unsubscribeLocations = onSnapshot(
    q,
    (snapshot) => {
      const locations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      dispatch(setLocations(locations));
    },
    (error) => {
      dispatch(setLocationsError(error?.message || 'Failed to sync locations'));
    }
  );

  return () => {
    if (unsubscribeLocations) {
      unsubscribeLocations();
      unsubscribeLocations = null;
    }
  };
};

export const stopLocationsListener = () => () => {
  if (unsubscribeLocations) {
    unsubscribeLocations();
    unsubscribeLocations = null;
  }
};

export const addLocation = createAsyncThunk(
  'locations/addLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const payload = {
        ...locationData,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'locations'), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, ...locationData }, { rejectWithValue }) => {
    try {
      const payload = {
        ...locationData,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'locations', id), payload);
      return { id, ...payload };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'locations/deleteLocation',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'locations', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  locations: [],
  loading: false,
  error: null,
};

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setLocations(state, action) {
      state.locations = action.payload;
    },
    setLocationsError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addLocation.fulfilled, (state, action) => {
        state.locations.unshift(action.payload);
      })
      .addCase(addLocation.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add location';
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.locations.findIndex((l) => l.id === action.payload.id);
        if (index >= 0) {
          state.locations[index] = action.payload;
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update location';
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations = state.locations.filter((l) => l.id !== action.payload);
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete location';
      });
  },
});

export const { setLocations, setLocationsError } = locationsSlice.actions;
export default locationsSlice.reducer;
