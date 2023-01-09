import { createContext, useReducer } from "react";
import { reducer as loginReducer } from "./reducers/loginReducer";
import { initialState as initialLoginState } from "./reducers/loginReducer";

// membuat context baru
export const MyContext = createContext();

// membuat component store untuk diimport di index
const Store = ({ children }) => {
  const [loginState, dispatchLogin] = useReducer(
    loginReducer,
    initialLoginState
  );
  return (
    <MyContext.Provider value={{ loginState, dispatchLogin }}>
      {children}
    </MyContext.Provider>
  );
};

export default Store;
