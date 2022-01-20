import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { forIn, merge } from 'lodash';
import { useEffect, useDebugValue, useContext } from 'react';
import SliceRegistry from './SliceRegistry';
import { produce } from 'immer';
import { ReduxStateContext } from './ReduxStateFence';
import { useRef } from 'react';

const simpleReducer = (s, {payload}) => {
  return payload;
}

const initialOptions = {
  persist: true, // Keeps data and reducers when component unmounts
  dependent: false, // Wait for another component to load slice
};

const noop = () => {
  console.log(`useReduxState: This component is dependent and is awaiting slice initialization before update can occur.`);
};

const createReduxBlueprint = ({
  initialState: initialBluePrintState,
  reducers = {},
  selectors = {},
  options: initialBlueprintOptions,
}) => {
  const useReduxState = (name, initialPropState, initialPropOptions) => {
    // Setup
    const immerStateRef = useRef();
    const store = useStore();
    const dispatch = useDispatch();
    const {options: initialFenceOptions, initialState: initialFenceState} = useContext(ReduxStateContext);

    // Merge Defaults
    const initialState = produce(initialBluePrintState, (draft) => { merge(draft, initialFenceState, initialPropState) });
    const options = produce(initialOptions, (draft) => { merge(draft, initialBlueprintOptions, initialFenceOptions, initialPropOptions) });
    
    let state = useSelector((state) => state[name] || initialState);

    let slice = SliceRegistry.slices[name];
    useDebugValue(state);
    immerStateRef.current = state;

    // Only after the component has initially rendered
    useEffect(() => {
      return () => {
        if (!options.persist) {      
          // Remove slice from store if we don't want persistent info 
          dispatch({
            type: '@@REMOVE_REDUCER',
            name,
          });
        }
      };
    }, [dispatch, name, options.persist]);

    // If the slice doesn't already exist, and this component is dependent, return undefined and noop updater
    if (!slice && options.dependent) { return [undefined, noop]; }

    // Create Slice if it doesn't alreay exist
    if (!slice) {
      reducers['@@update'] = simpleReducer;
      slice = createSlice({
        name,
        initialState,
        reducers,
      });

      // Bind selectors to slice for debugging
      slice.selectors = selectors;

      // Create root dispatcher with actions attached
      const rootDispatcher = (payload) => {
        const value =  typeof payload === 'function' ? produce(immerStateRef.current, payload) : payload;
        dispatch(slice.actions['@@update'](value));
      };
      forIn(slice.actions, (action, index) => rootDispatcher[index] = payload => dispatch(action(payload)));
      slice.rootDispatcher = rootDispatcher;

      // Storing Slice and updating
      SliceRegistry.slices[name] = slice;
      store.replaceReducer(SliceRegistry.reducer);
    }

    // Create a Proxy for state object that with handle selectors as well
    const proxyHandler = {
      get: function (target, prop) {
        if (prop in slice.selectors) {
          return slice.selectors[prop](state);
        }
        return target[prop];
      },
    };
    // const isPrimative = state instanceof Object;
    const stateWithSelectors = new Proxy(state, proxyHandler);

    return [stateWithSelectors, slice?.rootDispatcher];
    
  };

  return useReduxState;
}

export default createReduxBlueprint;