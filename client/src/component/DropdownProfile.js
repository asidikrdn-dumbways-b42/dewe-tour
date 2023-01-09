import { Col, Dropdown, Image, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { GoListOrdered } from "react-icons/go";
import { FaRoute } from "react-icons/fa";
import { TbFileDollar, TbLogout } from "react-icons/tb";
import { BsPersonCircle } from "react-icons/bs";
import { ImUsers } from "react-icons/im";
import { API, setAuthToken } from "../config/api";
import { MyContext } from "../store/Store";
import { logout } from "../store/actions/loginAction";
import { useQuery } from "react-query";

const DropdownProfile = (props) => {
  const { dispatchLogin } = useContext(MyContext);
  const navigate = useNavigate();

  const { data: userProfile } = useQuery("userProfileCache", async () => {
    const response = await API.get("/user");
    return response.data.data;
  });

  return (
    <Dropdown className="position-relative" autoClose>
      <Dropdown.Toggle
        style={{ backgroundColor: "transparent", border: "none" }}
        id="dropdown-profile"
      >
        {props.children}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{ marginLeft: -85, marginTop: 10, width: 150, zIndex: 999 }}
      >
        <Image
          src="/img/dropdown-polygon.png"
          className="position-absolute"
          style={{ top: -12, right: 15, width: 20 }}
        />
        {userProfile?.role === "admin" ? (
          <Row>
            <Col lg={12}>
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/transactions");
                  let drtoggle = document.getElementById("dropdown-profile");
                  drtoggle.click();
                }}
              >
                <GoListOrdered className="me-3 fs-3 text-warning" />
                <h5 className="m-0">Trx</h5>
              </div>
            </Col>
            <Col lg={12}>
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/trip");
                  let drtoggle = document.getElementById("dropdown-profile");
                  drtoggle.click();
                }}
              >
                <FaRoute className="me-3 fs-3 text-success" />
                <h5 className="m-0">Trip</h5>
              </div>
            </Col>
            <Col lg={12}>
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/users");
                  let drtoggle = document.getElementById("dropdown-profile");
                  drtoggle.click();
                }}
              >
                <ImUsers className="me-3 fs-3 text-info" />
                {/* <FaRoute className="me-3 fs-3 text-success" /> */}
                <h5 className="m-0">Users</h5>
              </div>
            </Col>
            <Col lg={12}>
              <hr
                style={{
                  height: 2,
                  backgroundColor: "gray",
                  border: "none",
                  opacity: "25%",
                }}
              />
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAuthToken();
                  dispatchLogin(logout());
                  // navigate("/");
                }}
              >
                <TbLogout className="me-3 fs-3 text-danger" />
                <h5 className="m-0">Logout</h5>
              </div>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col lg={12}>
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/profile");
                  let drtoggle = document.getElementById("dropdown-profile");
                  drtoggle.click();
                }}
              >
                <BsPersonCircle className="me-3 fs-3 text-warning" />
                <h5 className="m-0">Profile</h5>
              </div>
            </Col>
            <Col lg={12}>
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/payment");
                  let drtoggle = document.getElementById("dropdown-profile");
                  drtoggle.click();
                }}
              >
                <TbFileDollar className="me-3 fs-3 text-success" />
                <h5 className="m-0">Pay</h5>
              </div>
            </Col>
            <Col lg={12}>
              <hr
                style={{
                  height: 2,
                  backgroundColor: "gray",
                  border: "none",
                  opacity: "25%",
                }}
              />
              <div
                className="px-3 py-2 d-flex flex-row justify-content-start align-items-center dropdown-profile-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setAuthToken();
                  dispatchLogin(logout());
                  // navigate("/");
                }}
              >
                <TbLogout className="me-3 fs-3 text-danger" />
                <h5 className="m-0">Logout</h5>
              </div>
            </Col>
          </Row>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownProfile;
