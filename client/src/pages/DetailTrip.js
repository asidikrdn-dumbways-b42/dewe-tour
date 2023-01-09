import {
  Row,
  Col,
  Container,
  Button,
  Modal,
  Carousel,
  Image,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { BsPlusLg, BsDashLg } from "react-icons/bs";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { API } from "../config/api";
import { MyContext } from "../store/Store";
import Swal from "sweetalert2";

const DetailTrip = ({ setRegisterForm }) => {
  const { loginState } = useContext(MyContext);

  // mengambil id trip dari url
  const idTrip = useParams().idTrip;
  const navigate = useNavigate();

  // mengatur qty, harga, dan total harga
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);

  // carousel modals
  const [indexCarousel, setIndexCarousel] = useState(0);
  const handleSelect = (selectedIndex) => {
    setIndexCarousel(selectedIndex);
  };
  const [showImage, setShowImage] = useState(false);

  const { data: tripDetailData, isLoading: tripDetailDataIsLoading } = useQuery(
    "tripDetailCache",
    async () => {
      try {
        const response = await API.get(`/trip/${idTrip}`);
        setPrice(response.data.data.price);
        return response.data.data;
      } catch (e) {
        console.log(e);
      }
    }
  );

  useEffect(() => {
    setTotalPrice(price * qty);
  }, [price, qty]);

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

  const handlePayNewTransaction = useMutation(async () => {
    let trxData = {
      counterQty: qty,
      total: totalPrice,
      status: "new",
      tripId: tripDetailData.id,
    };

    try {
      const response = await API.post("/transaction", trxData);

      if (response.data.code === 200) {
        console.log(response.data.data);

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
            Swal.fire({
              icon: "warning",
              text: "you closed the popup without finishing the payment",
            });
            navigate("/payment");
          },
        });
      }
    } catch (e) {
      console.log(e);
      Swal.fire({
        icon: "error",
        title: "Error while booking transaction",
        text: e.response.data.message,
      });
    }
  });

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginTop: 100, marginBottom: 54 }}
      className="py-5 position-relative"
    >
      <img
        src="/img/hibiscus.png"
        alt="Bunga"
        style={{ top: -75 }}
        className="position-absolute end-0"
      />
      <img
        src="/img/palm.png"
        alt="Rumput"
        style={{ top: "30%" }}
        className="position-absolute start-0"
      />
      {/* carousel modals */}
      <Modal
        show={showImage}
        centered
        onHide={() => {
          setShowImage(false);
        }}
        style={{
          display: "block",
          position: "fixed",
          top: "0",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        className="rounded-0"
        dialogClassName="carousel-modals"
      >
        <Carousel activeIndex={indexCarousel} onSelect={handleSelect}>
          {tripDetailData?.images.length > 0 &&
            tripDetailData?.images.map((el, i) => {
              return (
                <Carousel.Item key={i}>
                  <Image className="d-block w-100" src={el} alt="Trip Image" />
                  <Carousel.Caption>
                    {/* <h3>Trip Title</h3> */}
                  </Carousel.Caption>
                </Carousel.Item>
              );
            })}
        </Carousel>
      </Modal>
      {tripDetailDataIsLoading ? (
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
        <Container>
          <h1 className="display-4 fw-bold">{tripDetailData?.title}</h1>
          <h3 className="text-secondary">{tripDetailData?.country.name}</h3>
          <Row>
            <Col xs={12} className="py-2">
              <img
                src={tripDetailData?.images[0]}
                alt="Card 1"
                className="img-fluid w-100 rounded"
                style={{
                  height: 500,
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowImage(true);
                  setIndexCarousel(0);
                }}
              />
            </Col>
            <Col lg={4} className="py-2 d-none d-lg-block">
              <img
                src={tripDetailData?.images[1]}
                alt="Card 2"
                className="img-fluid w-100 rounded"
                style={{
                  height: 250,
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowImage(true);
                  setIndexCarousel(1);
                }}
              />
            </Col>
            <Col lg={4} className="py-2 d-none d-lg-block">
              <img
                src={tripDetailData?.images[2]}
                alt="Card 3"
                className="img-fluid w-100 rounded"
                style={{
                  height: 250,
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowImage(true);
                  setIndexCarousel(2);
                }}
              />
            </Col>
            <Col lg={4} className="py-2 d-none d-lg-block">
              <div
                style={{ cursor: "pointer" }}
                className="position-relative"
                onClick={() => {
                  setShowImage(true);
                  setIndexCarousel(3);
                }}
              >
                <img
                  src={tripDetailData?.images[3]}
                  alt="Card 4"
                  className="img-fluid w-100 rounded"
                  style={{ height: 250, objectFit: "cover" }}
                />
                <div
                  className={`position-absolute top-0 w-100 h-100 text-white d-flex justify-content-center align-items-center ${
                    tripDetailData?.images.length <= 4 && "d-none"
                  }`}
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                >
                  <h1>+{tripDetailData?.images.length - 4}</h1>
                </div>
              </div>
            </Col>
          </Row>

          <h4 className="mt-5">Information Trip</h4>
          <div className="d-flex flex-row flex-wrap justify-content-between">
            <div className="info-card">
              <small className="text-secondary">Accomodation</small>
              <h4 className="d-flex align-items-end">
                <img src="/img/hotel.png" alt="" className="img-fluid me-2" />
                {tripDetailData?.accomodation}
              </h4>
            </div>
            <div className="info-card">
              <small className="text-secondary">Transportation</small>
              <h4 className="d-flex align-items-end">
                <img src="/img/plane.png" alt="" className="img-fluid me-2" />
                {tripDetailData?.transportation}
              </h4>
            </div>
            <div className="info-card">
              <small className="text-secondary">Eat</small>
              <h4 className="d-flex align-items-end">
                <img src="/img/meal.png" alt="" className="img-fluid me-2" />
                {tripDetailData?.eat}
              </h4>
            </div>
            <div className="info-card">
              <small className="text-secondary">Duration</small>
              <h4 className="d-flex align-items-end">
                <img src="/img/time.png" alt="" className="img-fluid me-2" />
                {`${tripDetailData?.day} Day ${tripDetailData?.night} Night`}
              </h4>
            </div>
            <div className="info-card">
              <small className="text-secondary">Date Trip</small>
              <h4 className="d-flex align-items-end">
                <img
                  src="/img/calendar.png"
                  alt=""
                  className="img-fluid me-2"
                />
                {tripDetailData?.dateTrip}
              </h4>
            </div>
          </div>

          <h4 className="mt-5">Description</h4>
          <p style={{ textAlign: "justify" }}>{tripDetailData?.description}</p>

          <div className="d-flex flex-wrap justify-content-center justify-content-lg-between mt-5">
            <div>
              <h1 className="d-inline-block text-warning">
                IDR. {tripDetailData?.price.toLocaleString()}
              </h1>
              <h1 className="d-inline-block text-black">&nbsp;/ Person</h1>
            </div>
            <div
              id="qty"
              className="d-flex justify-content-center align-items-center"
            >
              <Button
                variant="warning"
                className="text-white rounded-4 fs-3 d-flex flex-column p-2"
                onClick={() => {
                  setQty((prevState) => {
                    return prevState > 1 ? prevState - 1 : 1;
                  });
                }}
              >
                <BsDashLg />
              </Button>
              <h1 className="d-inline-block text-center" style={{ width: 150 }}>
                {qty}
              </h1>
              <Button
                variant="warning"
                className="text-white rounded-4 fs-3 d-flex flex-column p-2"
                onClick={() => {
                  setQty((prevState) => {
                    return prevState < tripDetailData?.quotaAvailable
                      ? prevState + 1
                      : tripDetailData?.quotaAvailable;
                  });
                }}
              >
                <BsPlusLg />
              </Button>
            </div>
          </div>

          <hr className="text-secondary" />
          <div className="d-flex justify-content-between">
            <div>
              <h1 className="d-inline-block text-black fw-bold">Total :</h1>
            </div>
            <div>
              <h1 className="d-inline-block text-warning fw-bold">
                IDR. {totalPrice?.toLocaleString()}
              </h1>
            </div>
          </div>
          <hr className="text-secondary" />
          <div className="d-flex justify-content-end">
            {handlePayNewTransaction.isLoading ? (
              <Button
                variant="warning"
                className="text-white fs-3 fw-bolder rounded-3 px-5"
                disabled
              >
                <Spinner animation="border" variant="light" />
              </Button>
            ) : (
              <Button
                variant="warning"
                className="text-white fs-3 fw-bolder rounded-3 px-5"
                onClick={() => {
                  loginState.isLogin
                    ? handlePayNewTransaction.mutate()
                    : setRegisterForm(true);
                }}
              >
                BOOK NOW
              </Button>
            )}
          </div>
        </Container>
      )}
      );
    </main>
  );
};

export default DetailTrip;
