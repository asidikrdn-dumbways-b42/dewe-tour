import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Image,
  Row,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useMutation, useQuery } from "react-query";
import { API } from "../config/api";
import Swal from "sweetalert2";

const Payment = () => {
  const [popup, setPopup] = useState(false);

  const navigate = useNavigate();

  const {
    data: transactionPending,
    refetch: refetchTransactionPending,
    isLoading: transactionPendingIsLoading,
  } = useQuery("transactionPendingCache", async () => {
    try {
      const response = await API.get("/transaction");

      return response.data.data;
    } catch (e) {
      console.log(e);
    }
  });

  useEffect(() => {
    //change this to the script source you want to load, for example this is snap.js sandbox env
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    //change this according to your client-key
    const myMidtransClientKey = process.env.REACT_APP_MIDTRANS_CLIENT_KEY;

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    // optional if you want to set script attribute
    // for example snap.js have data-client-key attribute
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    // menambahkan scriptTag ke akhir body
    document.body.appendChild(scriptTag);

    // menghapus scriptTag saat element akan di unmount
    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  const handlePayTransaction = useMutation(async (trx) => {
    let trxData = new FormData();
    trxData.append("counterQty", trx.counterQty);
    trxData.append("total", trx.total);
    trxData.append("tripId", trx.id);

    try {
      const response = await API.patch(`/transaction/${trx.id}`);
      // console.log(response.data);

      if (response.data.code === 200) {
        // console.log(response.data);

        const token = response.data.data.token;

        window.snap.pay(token, {
          onSuccess: function (result) {
            /* You may add your own implementation here */
          },
          onPending: function (result) {
            /* You may add your own implementation here */
            localStorage.setItem(trx.id, token); // simpan token dengan trx id sebagai key nya untuk dapat membuka snap di lain waktu
          },
          onError: function (result) {
            /* You may add your own implementation here */
          },
          onClose: function () {
            /* You may add your own implementation here */
            Swal.fire({
              icon: "warning",
              text: "you closed the popup without finishing the payment",
            });
          },
        });
      }
    } catch (e) {
      console.log(e.response.data.message);
    }
  });

  const handleContinuePendingTransaction = useMutation(async (trx) => {
    let trxData = new FormData();
    trxData.append("counterQty", trx.counterQty);
    trxData.append("total", trx.total);
    trxData.append("tripId", trx.id);

    const response = await API.get(`/transaction/${trx.id}`);
    if (response.data.code === 200) {
      const token = response.data.data.token;

      window.snap.pay(token, {
        onSuccess: function (result) {
          /* You may add your own implementation here */
        },
        onPending: function (result) {
          /* You may add your own implementation here */
        },
        onError: function (result) {
          /* You may add your own implementation here */
        },
        onClose: function () {
          /* You may add your own implementation here */
        },
      });
    }
  });

  useEffect(() => {
    refetchTransactionPending();
  });

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginTop: 100, marginBottom: 54 }}
      className="py-5 position-relative"
    >
      <Modal
        show={popup}
        centered
        backdrop="static"
        onHide={() => {
          setPopup(false);
        }}
        style={{
          display: "block",
          position: "fixed",
          top: "0",
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        className="rounded-0"
      >
        <Modal.Body>
          <p className="text-center">
            Your payment will be confirmed within 2 x 24 hours
          </p>
          <p className="text-center">
            To see orders click{" "}
            <u
              className="fw-bold text-underline"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/payment");
                setPopup(false);
              }}
            >
              Here
            </u>{" "}
            thank you
          </p>
        </Modal.Body>
      </Modal>

      {transactionPendingIsLoading ? (
        <Container>
          <Row>
            <Col>
              <div
                className="d-flex justify-content-center align-items-center w-100"
                style={{
                  minHeight: "75vh",
                }}
              >
                <Spinner animation="border" variant="warning" size="lg" />{" "}
                &nbsp; Loading...
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        transactionPending?.map((trx) => {
          return (
            trx.status !== "approve" && (
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
                          {trx.trip.country.name}
                        </h5>
                      </div>
                      <div className="pb-5">
                        {trx.status === "new" && (
                          <Alert
                            variant="danger"
                            className="d-inline-block p-1 px-3"
                          >
                            Waiting Payment
                          </Alert>
                        )}
                        {trx.status === "pending" && (
                          <Alert
                            variant="danger"
                            className="d-inline-block p-1 px-3"
                          >
                            Waiting Payment
                          </Alert>
                        )}
                        {trx.status === "failed" && (
                          <Alert
                            variant="danger"
                            className="d-inline-block p-1 px-3"
                          >
                            Payment failed
                          </Alert>
                        )}
                        {trx.status === "reject" && (
                          <Alert
                            variant="danger"
                            className="d-inline-block p-1 px-3"
                          >
                            Transaction rejected by Admin, please contact Admin
                            for a refund
                          </Alert>
                        )}
                        {trx.status === "success" && (
                          <Alert
                            variant="success"
                            className="d-inline-block p-1 px-3"
                          >
                            Payment success, waiting approve from admin
                          </Alert>
                        )}
                      </div>
                    </Col>
                    <Col lg={{ span: 5, offset: 2 }}>
                      <Row g={0}>
                        <Col lg={6} className="pb-5">
                          <h4>Date Trip</h4>
                          <h5 className="text-secondary">
                            {trx.trip.dateTrip}
                          </h5>
                        </Col>
                        <Col lg={6} className="pb-5">
                          <h4>Duration</h4>
                          <h5 className="text-secondary">{`${trx.trip.day} Day ${trx.trip.night} Night`}</h5>
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
                    {/* <Col
                    lg={3}
                    className="d-flex flex-column align-items-center justify-content-center"
                  >
                    <BiImageAdd
                      style={{ cursor: "pointer" }}
                      className="display-1"
                    />
                    <small className="text-secondary mt-2">
                      Upload payment proof
                    </small>
                  </Col> */}
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
                      <p className="my-0 text-muted">{trx.user.fullName}</p>
                    </Col>
                    <Col lg={2}>
                      <p className="my-0 text-muted">{trx.user.gender}</p>
                    </Col>
                    <Col lg={2}>
                      <p className="my-0 text-muted">{trx.user.phone}</p>
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
                {trx.status !== "success" &&
                  trx.status !== "failed" &&
                  trx.status !== "reject" && (
                    <div className={`d-flex justify-content-end`}>
                      {handlePayTransaction.isLoading ||
                      handleContinuePendingTransaction.isLoading ? (
                        <Button
                          variant="warning"
                          className="text-white fs-3 fw-bolder rounded-3 px-5"
                          disabled
                        >
                          <Spinner animation="border" variant="light" />
                        </Button>
                      ) : trx.status === "pending" ? (
                        <Button
                          variant="warning"
                          className="text-white m-3 fs-5 fw-bold"
                          style={{ minWidth: 200 }}
                          onClick={() => {
                            handleContinuePendingTransaction.mutate(trx);
                          }}
                        >
                          CONTINUE PENDING PAYMENT
                        </Button>
                      ) : (
                        <Button
                          variant="warning"
                          className="text-white m-3 fs-5 fw-bold"
                          style={{ minWidth: 200 }}
                          onClick={() => {
                            handlePayTransaction.mutate(trx);
                          }}
                        >
                          PAY
                        </Button>
                      )}
                    </div>
                  )}
              </Container>
            )
          );
        })
      )}
    </main>
  );
};

export default Payment;
