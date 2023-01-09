import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../store/Store";

const AdminPrivateRoute = () => {
  const { loginState } = useContext(MyContext);

  // console.log(user);
  // console.log("render admin private route");
  return (
    <>
      {!localStorage.getItem("token") ? (
        <Navigate to="/" />
      ) : (
        loginState?.isLogin && loginState.userInfo?.role === "admin" && <Outlet />
      )}
    </>
  );
};
export default AdminPrivateRoute;
