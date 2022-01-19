import { combineReducers } from 'redux';
import { mapValues, reduce } from 'lodash';
import { produce } from 'immer';

const initialReducers = {};

const rootReducers = {
  '@@REMOVE_REDUCER': (state = {}, {type, name}) => {
    if (type !== '@@REMOVE_REDUCER') return state;
    return produce(state, draft => { delete draft[name]; });
  }
};

const SliceRegistry = {
  initialReducers,
  rootReducers,
  slices: {},
  get reducer() {
    return (state = {}, action) => {
      const newState = produce(state, draft => reduce(SliceRegistry.rootReducers, (acc, reduce) => reduce(acc, action), draft));
      const reducers = {
        ...SliceRegistry.initialReducers,
        ...mapValues(SliceRegistry.slices, i => i.reducer),
      };

      if (Object.keys(reducers).length > 0) {
        const combined = combineReducers(reducers);
        return combined(newState, action);
      }
      
      return newState;
    };
  },
};

export default SliceRegistry;