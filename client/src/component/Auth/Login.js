import { useContext, useState } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useMutation } from "react-query";
import { API, setAuthToken } from "../../config/api";
import { loginSuccess } from "../../store/actions/loginAction";
import { MyContext } from "../../store/Store";
import Swal from "sweetalert2";

const Login = ({ loginForm, setLoginForm, setRegisterForm, userData }) => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const { dispatchLogin } = useContext(MyContext);

  const handleInputChange = (e) => {
    setInput((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const handleLogin = useMutation(async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/login", input);
      if (response.data.code === 200) {
        setAuthToken(response.data.data.token);
        dispatchLogin(loginSuccess(response.data.data));

        setInput({
          email: "",
          password: "",
        });
        setLoginForm(false);
        Swal.fire({
          title: "Login Success",
          icon: "success",
        });
      }
    } catch (e) {
      // console.log(e);
      Swal.fire({
        title: "Login Failed",
        text: e.response.data.message,
        icon: "error",
      });
    }
  });

  return (
    <Modal
      show={loginForm}
      centered
      onHide={() => {
        setLoginForm(false);
      }}
      style={{
        display: "block",
        position: "fixed",
        top: "0",
        width: "100%",
        height: "100vh",
        // backgroundColor: "rgba(255,255,255,0.5)",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      className="rounded-0"
    >
      <img
        src="/img/hibiscus-modals.png"
        alt="Bunga"
        className="position-absolute top-0 end-0 rounded-top"
      />
      <img
        src="/img/palm-modals.png"
        alt="Rumput"
        className="position-absolute top-0 start-0 rounded-top"
      />
      <Modal.Title className="display-5 fw-bold mx-auto p-4">Login</Modal.Title>

      <Form className="p-4" onSubmit={handleLogin.mutate}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label className="h3 fw-bolder">Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={handleInputChange}
            value={input.email}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label className="h3 fw-bolder">Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleInputChange}
            value={input.password}
          />
        </Form.Group>

        {handleLogin.isLoading ? (
          <Button
            variant="warning"
            type="submit"
            className="w-100 text-white fs-4 fw-bolder"
            disabled
          >
            <Spinner animation="border" variant="light" />
          </Button>
        ) : (
          <Button
            variant="warning"
            type="submit"
            className="w-100 text-white fs-4 fw-bolder"
          >
            Login
          </Button>
        )}
        <p className="text-muted fs-6 my-3 mx-auto text-center pt-3">
          Don't have an account? ? Klik{" "}
          <b
            style={{ cursor: "pointer" }}
            onClick={() => {
              setLoginForm(false);
              setRegisterForm(true);
            }}
          >
            Here
          </b>
        </p>
      </Form>
    </Modal>
  );
};

export default Login;
