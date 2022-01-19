import { configureStore as configureReduxStore } from '@reduxjs/toolkit';
import SliceRegistry from './SliceRegistry';

export const configureStore = (config) => {
  return configureReduxStore({
    ...config,
    reducer: SliceRegistry.reducer,
  });
};

export default configureStore;