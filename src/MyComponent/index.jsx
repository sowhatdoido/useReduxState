import useReduxState from "./index.ducks";

const MyComponent = ({id, starting}) => {
  /*
  const [state, updater] = useReduxState(id, {value: 0});
  const [{selectedVal1, selectedVal2}, {action1, action2}] = useReduxState(id, {value: 0});

  Uses:
    selectedVal are used for computed values, great for deep state access or values that correspond to something not in state
    action are used for triggering specifically designed reducers
    
    state returns the root node of state, especially useful for simple values
    updater updates the entire root node of the state **

  */
  const [state, updater] = useReduxState(id);
  // const [state, update] = useReduxState(id, {value: 0});
  return state === undefined ? (<div>Awaiting Parent Initialization...</div>):(
    <div>
      <div>{JSON.stringify(state)}</div>
      <button onClick={() => updater(draft => { draft.value-- })}>-</button>
      <button onClick={() => updater(draft => { draft.value++ })}>+</button>
    </div>
  );
};

export default MyComponent;