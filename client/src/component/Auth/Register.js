import { useState } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useMutation } from "react-query";
import { API } from "../../config/api";
import Swal from "sweetalert2";

const Register = ({ registerForm, setRegisterForm, setLoginForm }) => {
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
    address: "",
  });

  // fungsi untuk menghandle saat terjadi perubahan pada input form
  const handleInputChange = (e) => {
    setInput((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  const validation = (inputItem) => {
    const newError = {
      fullName: "",
      email: "",
      password: "",
      gender: "",
      phone: "",
      address: "",
    };

    // Validasi fullName
    let fullName = inputItem.fullName.trim();
    if (fullName === "") {
      newError.fullName = "Fullname must be fill !";
    } else {
      newError.fullName = "";
    }

    // Validasi Email
    let email = inputItem.email.trim();
    if (email === "") {
      newError.email = "Email must be fill !";
    } else {
      newError.email = "";
    }

    // Validasi Password
    let password = inputItem.password.trim();
    if (password === "") {
      newError.password = "Password must be fill !";
    } else if (/[A-Z]/.test(password) === false) {
      newError.password =
        "The password must be a combination of uppercase, lowercase, and numbers!!";
    } else if (/[a-z]/.test(password) === false) {
      newError.password =
        "The password must be a combination of uppercase, lowercase, and numbers!!";
    } else if (/[0-9]/.test(password) === false) {
      newError.password =
        "The password must be a combination of uppercase, lowercase, and numbers!!";
    } else {
      newError.password = "";
    }

    // Validasi Gender
    let gender = inputItem.gender;
    if (gender === "") {
      newError.gender = "Gender must be choosed !";
    } else {
      newError.gender = "";
    }

    // Validasi Phone
    let phone = inputItem.phone.trim();
    if (phone === "") {
      newError.phone = "Phone must be fill !";
    } else if (parseInt(phone) < 0) {
      newError.phone = "can't be less than 0";
    } else if (phone.length < 10) {
      newError.phone = "Please insert at least 10 digit number phone";
    } else if (phone.length > 13) {
      newError.phone = "Please insert max 13 digit number phone";
    } else {
      newError.phone = "";
    }

    // Validasi Address
    let address = inputItem.address.trim();
    if (address === "") {
      newError.address = "Address must be fill !";
    } else {
      newError.address = "";
    }

    if (
      newError.fullName === "" &&
      newError.email === "" &&
      newError.password === "" &&
      newError.phone === "" &&
      newError.address === ""
    ) {
      // reset error
      setError({
        fullName: "",
        email: "",
        password: "",
        gender: "",
        phone: "",
        address: "",
      });
      return true;
    } else {
      setError(newError);
      return false;
    }
  };

  // fungsi untuk menghandle saat form di-submit
  const handleSubmitForm = useMutation(async (e) => {
    e.preventDefault();

    if (validation(input)) {
      // kirim data user baru
      try {
        // Configuration Content-type
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Data body
        const body = JSON.stringify(input);

        // Insert data user to database
        const response = await API.post("/register", body, config);

        // console.log(response.data);

        // Notification
        if (response.data.code === 200) {
          // reset input
          setInput({
            fullName: "",
            email: "",
            password: "",
            gender: "",
            phone: "",
            address: "",
          });

          // tutup form register dan buka form login
          setRegisterForm(false);
          Swal.fire({
            title: "Register Success",
            text: "Now, check and verify your email",
            icon: "info",
          });
          setLoginForm(true);
        }
      } catch (e) {
        Swal.fire({
          title: "Register Failed",
          text: e.response.data.message,
          icon: "error",
        });
      }
    }
  });

  return (
    <Modal
      show={registerForm}
      centered
      id="register-modal"
      onHide={() => {
        setRegisterForm(false);
      }}
      style={{
        display: "block",
        position: "fixed",
        top: "0",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
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
      <Modal.Title className="display-5 fw-bold mx-auto p-4">
        Register
      </Modal.Title>

      <Form className="p-4" onSubmit={handleSubmitForm.mutate}>
        <Form.Group className="mb-3" controlId="formFullname">
          <Form.Label className="h3 fw-bolder">Full Name</Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            placeholder="Enter Full Name"
            value={input.fullName}
            onChange={handleInputChange}
          />
          {error.fullName && (
            <Form.Text className="text-danger">{error.fullName}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label className="h3 fw-bolder">Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={input.email}
            onChange={handleInputChange}
          />
          {error.email && (
            <Form.Text className="text-danger">{error.email}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label className="h3 fw-bolder">Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={input.password}
            onChange={handleInputChange}
          />
          {error.password && (
            <Form.Text className="text-danger">{error.password}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGender">
          <Form.Label className="h3 fw-bolder">Gender</Form.Label>
          <Form.Select
            value={input.gender}
            name="gender"
            onChange={handleInputChange}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Form.Select>
          {error.gender && (
            <Form.Text className="text-danger">{error.gender}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPhone">
          <Form.Label className="h3 fw-bolder">Phone</Form.Label>
          <Form.Control
            type="number"
            name="phone"
            placeholder="Enter Your Phone Number"
            value={input.phone}
            onChange={handleInputChange}
          />
          {error.phone && (
            <Form.Text className="text-danger">{error.phone}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formAddress">
          <Form.Label className="h3 fw-bolder">Address</Form.Label>
          <Form.Control
            as="textarea"
            name="address"
            placeholder="Enter Your Address"
            style={{ height: "100px" }}
            onChange={handleInputChange}
            value={input.address}
          />
          {error.address && (
            <Form.Text className="text-danger">{error.address}</Form.Text>
          )}
        </Form.Group>

        {handleSubmitForm.isLoading ? (
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
            Register
          </Button>
        )}
      </Form>
    </Modal>
  );
};

export default Register;
