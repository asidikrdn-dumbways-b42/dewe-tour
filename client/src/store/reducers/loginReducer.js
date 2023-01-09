export const initialState = {
  isLogin: false,
  userInfo: {},
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  // console.log(payload);

  switch (type) {
    case "AUTH_SUCCESS":
    case "LOGIN_SUCCESS":
      localStorage.setItem("token", payload.token);
      return {
        isLogin: true,
        userInfo: payload,
      };
    case "AUTH_ERROR":
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        isLogin: false,
        userInfo: {},
      };
    default:
      throw new Error();
  }
};
