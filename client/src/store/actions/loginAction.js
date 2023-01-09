export const loginSuccess = (payload) => {
  return {
    type: "LOGIN_SUCCESS",
    payload: payload,
  };
};

export const authSuccess = (payload) => {
  return {
    type: "AUTH_SUCCESS",
    payload: payload,
  };
};

export const authError = () => {
  return {
    type: "AUTH_ERROR",
  };
};

export const logout = () => {
  return {
    type: "LOGOUT",
  };
};
