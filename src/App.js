import logo from './logo.svg';
import './App.css';
import MyComponent from './MyComponent';
import React, { useState } from 'react';
import {produce} from 'immer';
import ReduxStateFence from './useReduxState/ReduxStateFence';

function App() {
  const [list, update] = useState([]);
  const updateState = (modified) => { update(produce(list, modified))};
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ReduxStateFence options={{dependent: true}}>
          <MyComponent key={`component0`} id={`component0`} starting={0} />
        </ReduxStateFence>
        <ReduxStateFence options={{persist: false}} initialState={{value: 10}}>
        {
          list.map((d, i) => <MyComponent key={`component${i}`} id={`component${i}`} starting={i} /> )
        }
        </ReduxStateFence>
        <div>
          <button onClick={() => { updateState((draft) => { draft.push('n'); }) }}>ADD</button>
          <button onClick={() => { updateState((draft) => { draft.pop(); }) }}>REMOVE</button>
        </div>
      </header>
    </div>
  );
}

export default App;
