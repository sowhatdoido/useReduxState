import { useState } from 'react';
import styled from 'styled-components';
import {Provider} from 'react-redux';
import configureStore from './configureStore';
import createReduxBlueprint from '.';
import {produce} from 'immer';
import ReduxStateFence from './ReduxStateFence';

const store = configureStore();

const StyledStory = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
`;

const Story = ({children}) => {
  return (
    <Provider store={store}>
      <StyledStory>{children}</StyledStory>
    </Provider>
  )
}

export default {
  title: 'packages/useReduxState',
  parameters: {
    componentSubtitle: 'Package to simplify state managment when using redux, built on top of RTK. `createReduxBlueprint` returns a hook, typically named `useReduxState`, that gives you several options methods of updating and grabbing the state.',
  },
}

// =================================================

const useDefaultReduxState = createReduxBlueprint({
  initialState: {
    value: 0,
  },
});

const DefaultComponent = ({id = 'Default', ...props}) => {
  const [state, updater] = useDefaultReduxState(id, props);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{margin: '0 0 5px'}}>Simple: {JSON.stringify(state, ' ', 2)}</div>
      <button onClick={() => updater({ value: state.value - 1})}>subtract</button>
      <button onClick={() => updater(draft => { draft.value++ })}>add</button>
    </div>
  );
};
export const Default = ((args) => <Story><DefaultComponent {...args} /></Story>).bind();
Default.parameters = {
  docs: {
    description: {
      story: '`useReduxState` supports simple getters and setters, modeled after the intuitive implementation of useState. The updater additionally supports `immer` functions, allowing you to update a draft state rather than recreating the full object structure.'
    }
  }
};
Default.args = {};

// ===================================================

const useComplexReduxState = createReduxBlueprint({
  initialState: {
    value: 0,
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
});

const ComplexComponent = () => {
  const [{counterValue}, {incrementByAmount, decrement}] = useComplexReduxState('Complex');
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{margin: '0 0 5px'}}>This will increase by 2, decrease by 1. <br />Value: {JSON.stringify(counterValue, ' ', 2)}</div>
      <button onClick={() => decrement()}>subtract</button>
      <button onClick={() => incrementByAmount(2)}>add</button>
    </div>
  );
};
export const Complex = ((args) => <Story><ComplexComponent {...args} /></Story>).bind();
Complex.parameters = {
  docs: {
    description: {
      story: '`useReduxState` will also attach selectors and dispatchers to the simple getter and setter functions based on whether they were configured in the blueprint. Selectors and Dispatchers act as an interface for complex logic, mapping them to easy to use values and updaters.' 
    }
  }
};
Complex.args = {};

// =================================================

const useInitialPropsReduxState = createReduxBlueprint({
  initialState: {
    value: 0,
  },
});

const InitialPropsComponent = () => {
  const [state, updater] = useInitialPropsReduxState('InitialProps', { value: 42 });
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{margin: '0 0 5px'}}>This value can be initially set via props. <br /> {JSON.stringify(state, ' ', 2)}</div>
      <button onClick={() => updater({ value: state.value - 1})}>subtract</button>
      <button onClick={() => updater(draft => { draft.value++ })}>add</button>
    </div>
  );
};
export const InitialProps = ((args) => <Story><InitialPropsComponent {...args} /></Story>).bind();
InitialProps.parameters = {
  docs: {
    description: {
      story: 'Initial props can be set when using the hook, which can be useful for CMS driven components.'
    }
  }
};
InitialProps.args = {};

// =================================================

const useDependentReduxState = createReduxBlueprint({
  initialState: {
    value: 0,
  },
});

const MyComponent = ({id, dependent = false, ...props}) => {
  const [state, updater] = useDependentReduxState(id, props, {dependent});
  return (
    <div>
      <div>{(state === undefined) ? <div>Awaiting Peer Initialization...</div> : JSON.stringify(state)}</div>
      <button onClick={() => updater(draft => { draft.value-- })}>-</button>
      <button onClick={() => updater(draft => { draft.value++ })}>+</button>
    </div>
  );
};
const DependentComponent = () => {
  const [list, update] = useState([]);
  const updateState = (modified) => { update(produce(list, modified))};

  return (
    <div style={{ textAlign: 'center' }}>
      {
        list.map((d, i) => <MyComponent key={`component${i}`} id={`component${i}`} /> )
      }
      <MyComponent key={`component0`} id={`component0`} dependent={true} />
      { 
        list.length === 0 && 
        <div>
          <button onClick={() => { updateState((draft) => { draft.push('n'); }) }}>Load</button>
        </div>
      }
    </div>
  );
};
export const Dependent = ((args) => <Story><DependentComponent {...args} /></Story>).bind();
Dependent.parameters = {
  docs: {
    description: {
      story: 'If you have two components with the same Id, their stores will automatically be shared. In the case where one component is in charge of fetching the data, you can set the other one to `dependent`, which makes it return nothing for the state and updater while it awaits for a slice to be created.'
    }
  }
};
Dependent.args = {};

// =======================================================

const useFencingReduxState = createReduxBlueprint({
  initialState: {
    value: 0,
  },
});

const FencingComponent = ({id = 'Fencing', ...props}) => {
  const [list, update] = useState([]);
  const updateState = (modified) => { update(produce(list, modified))};
  const show = list.length > 0;
  return (
    <>
    {
      show && 
      <>
        <DefaultComponent id="c1" />
        <ReduxStateFence options={{persist: false}}>
          <DefaultComponent id="c2" />
        </ReduxStateFence>
      </>
    }

      <div>
        { !show && <button onClick={() => { updateState((draft) => { draft.push('n'); }) }}>Load</button> }
        { show && <button onClick={() => { updateState((draft) => { draft.pop(); }) }}>unload</button> }
      </div>
    </>
  );
};
export const Fencing = ((args) => <Story><FencingComponent {...args} /></Story>).bind();
Fencing.parameters = {
  docs: {
    description: {
      story: 'In some scenarios, you might want to change the behavior of all components within a scope. For example, you may want slices to persist after a component unmounts (default behavior) but overlays components should reset their state when the overlay closes. You can use a `ReduxStateFence` to pass both options and props as a context for `useReduxHook` to use. In our example, you would pass `persist: false` via the `options` parameter.'
    }
  }
};
Fencing.args = {};