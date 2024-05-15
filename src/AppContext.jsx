import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [updateItemPositions, setUpdateItemPositions] = useState(null);

  const registerUpdateFunction = useCallback(fn => {
    setUpdateItemPositions(() => fn);
  }, []);

  return (
    <AppContext.Provider value={{ updateItemPositions, registerUpdateFunction }}>
      {children}
    </AppContext.Provider>
  );
};
