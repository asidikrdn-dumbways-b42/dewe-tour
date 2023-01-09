import {
  Button,
  Card,
  Col,
  Container,
  Image,
  Row,
  Alert,
  Form,
  Spinner,
} from "react-bootstrap";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { QRCodeSVG } from "qrcode.react";
import { useMutation } from "react-query";
import { API } from "../config/api";
import { useQuery } from "react-query";
import Swal from "sweetalert2";

const Profile = () => {
  const {
    data: userProfile,
    refetch: refetchUserProfile,
    isLoading: userProfileIsLoading,
  } = useQuery("userProfileCache", async () => {
    const response = await API.get("/user");
    return response.data.data;
  });

  const updateProfilPict = useMutation(async (e) => {
    let formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const response = await API.patch("/user", formData);
      if (response.data.code === 200) {
        Swal.fire({
          icon: "success",
          title: "Image Updated Successfully",
        });
        refetchUserProfile();
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error Updating Image",
        text: e.response.data.message,
      });
    }
  });

  const { data: transactionSuccess, isLoading: transactionSuccessIsLoading } =
    useQuery("transactionSuccessCache", async () => {
      try {
        const response = await API.get("/transaction");

        return response.data.data;
      } catch (e) {
        console.log(e);
      }
    });

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginTop: 100, marginBottom: 54 }}
      className="py-5 position-relative"
    >
      <Container>
        {userProfileIsLoading ? (
          <Row>
            <Col>
              <div
                className="d-flex justify-content-center align-items-center w-100"
                style={{
                  minHeight: "25vh",
                }}
              >
                <Spinner animation="border" variant="warning" size="lg" />{" "}
                &nbsp; Loading...
              </div>
            </Col>
          </Row>
        ) : (
          <Card className="w-75 mx-auto px-4 py-3">
            <Row>
              <Col lg={7}>
                <h1>Personal Info</h1>
                <div className="d-flex flex-column mt-4">
                  <div className="d-flex flex-row align-items-center my-1">
                    <IoPersonCircleSharp className="display-2 text-secondary me-3" />
                    <div>
                      <h5 className="m-0">{userProfile?.fullName}</h5>
                      <p className="text-secondary m-0">Fullname</p>
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center my-1">
                    <MdEmail className="display-2 text-secondary me-3" />
                    <div>
                      <h5 className="m-0">{userProfile?.email}</h5>
                      <p className="text-secondary m-0">Email</p>
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center my-1">
                    <MdPhone className="display-2 text-secondary me-3" />
                    <div>
                      <h5 className="m-0">{`${userProfile?.phone.slice(
                        0,
                        4
                      )}-${userProfile?.phone.slice(
                        4,
                        8
                      )}-${userProfile?.phone.slice(8)}`}</h5>
                      <p className="text-secondary m-0">Mobile phone</p>
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center my-1">
                    <MdLocationOn className="display-2 text-secondary me-3" />
                    <div>
                      <h5 className="m-0">{userProfile?.address}</h5>
                      <p className="text-secondary m-0">Address</p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={5} className="pt-3">
                <Form.Control
                  id="uploadImage"
                  type="file"
                  size="xs"
                  className="mt-5 d-none"
                  onChange={updateProfilPict.mutate}
                />
                {userProfile?.image ? (
                  <Image
                    src={userProfile?.image}
                    alt="profile"
                    className="w-100"
                  />
                ) : (
                  <Image
                    src="/img/profile-undefined.png"
                    alt="profile"
                    className="w-100"
                  />
                )}
                {updateProfilPict.isLoading ? (
                  <Button
                    variant="warning"
                    className="text-white w-100 my-2 fs-4"
                    disabled
                  >
                    <Spinner animation="border" variant="light" />
                  </Button>
                ) : (
                  <Button
                    variant="warning"
                    className="text-white w-100 my-2 fs-4"
                    onClick={() => {
                      document.getElementById("uploadImage").click();
                    }}
                  >
                    Change Photo Profile
                  </Button>
                )}
              </Col>
            </Row>
          </Card>
        )}

        <h1 className="mt-5">History</h1>
        {transactionSuccessIsLoading ? (
          <Container>
            <Row>
              <Col>
                <div
                  className="d-flex justify-content-center align-items-center w-100"
                  style={{
                    minHeight: "25vh",
                  }}
                >
                  <Spinner animation="border" variant="warning" size="lg" />{" "}
                  &nbsp; Loading...
                </div>
              </Col>
            </Row>
          </Container>
        ) : (
          transactionSuccess?.map((trx) => {
            return (
              trx.status === "approve" && (
                <Container className="mb-5" key={trx.id}>
                  <Card
                    className="bg-white py-3"
                    style={{ border: "2px solid rgba(108,117,125,0.7)" }}
                  >
                    <Row className="px-3 pb-3">
                      <Col lg={4}>
                        <Image src="/img/payment-icon.png" alt="dewe-tour" />
                      </Col>
                      <Col
                        lg={{ span: 4, offset: 4 }}
                        className="d-flex justify-content-center ps-lg-4"
                      >
                        <div
                          className="d-flex flex-column align-items-end w-75"
                          // style={{ width: "64%" }}
                        >
                          <h1>Booking</h1>
                          <h5 className="text-secondary">{trx.bookingDate}</h5>
                        </div>
                      </Col>
                    </Row>
                    <Row className="px-4">
                      <Col
                        lg={5}
                        className="d-flex flex-column justify-content-between"
                      >
                        <div>
                          <h2>{trx.trip.title}</h2>
                          <h5 className="text-secondary">
                            {trx.country?.name}
                          </h5>
                        </div>
                        <div className="pb-5">
                          {trx.status === "approve" && (
                            <Alert
                              variant="success"
                              className="d-inline-block p-1 px-3"
                            >
                              Approved by Admin
                            </Alert>
                          )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <Row g={0}>
                          <Col lg={6} className="pb-5">
                            <h4>Date Trip</h4>
                            <h5 className="text-secondary">
                              {trx.trip.dateTrip}
                            </h5>
                          </Col>
                          <Col lg={6} className="pb-5">
                            <h4>Duration</h4>
                            <h5 className="text-secondary">{`${trx.trip?.day} Day ${trx.trip?.night} Night`}</h5>
                          </Col>
                          <Col lg={6} className="pb-5">
                            <h4>Accomodation</h4>
                            <h5 className="text-secondary">
                              {trx.trip.accomodation}
                            </h5>
                          </Col>
                          <Col lg={6} className="pb-5">
                            <h4>Transportation</h4>
                            <h5 className="text-secondary">
                              {trx.trip.transportation}
                            </h5>
                          </Col>
                        </Row>
                      </Col>
                      <Col
                        lg={3}
                        className="d-flex flex-column align-items-center justify-content-center"
                      >
                        <QRCodeSVG value={trx.id} />,
                        <p className="mt-2">{trx.id.toUpperCase()}</p>
                      </Col>
                    </Row>
                    <Row className="fw-bold">
                      <Col lg={1} className="text-center">
                        <p className="my-0">No</p>
                      </Col>
                      <Col lg={2}>
                        <p className="my-0">FullName</p>
                      </Col>
                      <Col lg={2}>
                        <p className="my-0">Gender</p>
                      </Col>
                      <Col lg={2}>
                        <p className="my-0">Phone</p>
                      </Col>
                    </Row>
                    <hr
                      style={{
                        height: 3,
                        backgroundColor: "gray",
                        border: "none",
                        opacity: "25%",
                      }}
                    />
                    <Row>
                      <Col lg={1} className="text-center">
                        <p className="my-0 text-muted">1</p>
                      </Col>
                      <Col lg={2}>
                        <p className="my-0 text-muted">{trx.user?.fullName}</p>
                      </Col>
                      <Col lg={2}>
                        <p className="my-0 text-muted">{trx.user?.gender}</p>
                      </Col>
                      <Col lg={2}>
                        <p className="my-0 text-muted">{trx.user?.phone}</p>
                      </Col>
                      <Col lg={2} className="text-center fw-bold">
                        <p className="my-0">Qty</p>
                      </Col>
                      <Col className="text-start ps-5 fw-bold">
                        <p className="my-0">
                          <span className="px-3 me-3">:</span>
                          {trx.counterQty}
                        </p>
                      </Col>
                    </Row>
                    <hr
                      style={{
                        height: 3,
                        backgroundColor: "gray",
                        border: "none",
                        opacity: "25%",
                      }}
                    />
                    <Row>
                      <Col
                        lg={{ span: 2, offset: 7 }}
                        className="text-center fw-bold"
                      >
                        <p className="my-0">Total</p>
                      </Col>
                      <Col className="text-start ps-5 fw-bold">
                        <p className="my-0 text-danger">
                          <span className="px-3 me-3 text-black">:</span>IDR.
                          &nbsp;
                          {trx.total.toLocaleString()}
                        </p>
                      </Col>
                    </Row>
                  </Card>
                </Container>
              )
            );
          })
        )}
      </Container>
    </main>
  );
};

export default Profile;
