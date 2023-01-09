import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../store/Store";

const UserPrivateRoute = () => {
  const { loginState } = useContext(MyContext);

  // console.log(user);
  // console.log("render user private route");

  return (
    <>
      {!localStorage.getItem("token") ? (
        <Navigate to="/" />
      ) : (
        loginState?.isLogin && loginState.userInfo?.role === "user" && <Outlet />
      )}
    </>
  );
};

export default UserPrivateRoute;
