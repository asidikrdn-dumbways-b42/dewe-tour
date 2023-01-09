import { useContext, useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";

import AdminPrivateRoute from "./component/PrivateRoute/AdminPrivateRoute";
import UserPrivateRoute from "./component/PrivateRoute/UserPrivateRoute";
import PublicRoute from "./component/PrivateRoute/PublicRoute";

import NavBar from "./component/NavBar";
import Footer from "./component/Footer";
import DetailTrip from "./pages/DetailTrip";
import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import ListTransaction from "./pages/ListTransaction";
import IncomeTrip from "./pages/IncomeTrip";
import AddTrip from "./pages/AddTrip";
import DetailTripAdmin from "./pages/DetailTripAdmin";
import { API, setAuthToken } from "./config/api";
import { MyContext } from "./store/Store";
import { authSuccess, authError } from "./store/actions/loginAction";
import Home from "./pages/Home";
import ListUsers from "./pages/ListUsers";

function App() {
  const [loginForm, setLoginForm] = useState(false);
  const [registerForm, setRegisterForm] = useState(false);

  const { dispatchLogin } = useContext(MyContext);

  const checkAuth = async () => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const response = await API.get("/check-auth");
      if (response.data.code === 200) {
        dispatchLogin(authSuccess(response.data.data));
      }
    } catch (err) {
      localStorage.removeItem("token");
      dispatchLogin(authError());
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NavBar setLoginForm={setLoginForm} setRegisterForm={setRegisterForm} />
      <Login
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        setRegisterForm={setRegisterForm}
      />
      <Register
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        setLoginForm={setLoginForm}
      />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route
            path="/"
            element={
              <>
                <Home />
              </>
            }
          />
          <Route
            path="/detail/:idTrip"
            element={
              <>
                <DetailTrip setRegisterForm={setRegisterForm} />
              </>
            }
          />
        </Route>
        <Route element={<UserPrivateRoute />}>
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path="/transactions" element={<ListTransaction />} />
          <Route path="/users" element={<ListUsers />} />
          <Route path="/trip" element={<IncomeTrip />} />
          <Route path="/addtrip" element={<AddTrip />} />
          <Route
            path="/detail-for-admin/:idTrip"
            element={
              <>
                <DetailTripAdmin />
              </>
            }
          />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
