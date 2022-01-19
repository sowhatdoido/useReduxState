import React from 'react';

export const ReduxStateContext = React.createContext({});

const ReduxStateFence = ({children, ...props}) => {
  return (
    <ReduxStateContext.Provider value={props}>
      {children}
    </ReduxStateContext.Provider>
  );
};

export default ReduxStateFence;