import createReduxBlueprint from "../useReduxState";

export default createReduxBlueprint({
  initialState: {
    value: 1,
  },
  selectors: {
    counterValue: (state) => state.value,
  },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
  options: {
    persist: true,
    // dependent: true,
  }
});