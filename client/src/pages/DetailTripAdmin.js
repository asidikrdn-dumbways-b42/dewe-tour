import {
  Row,
  Col,
  Container,
  Modal,
  Carousel,
  Image,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "react-query";
import { API } from "../config/api";

const DetailTripAdmin = () => {
  // mengambil id trip dari url
  const idTrip = useParams().idTrip;

  // carousel modals
  const [indexCarousel, setIndexCarousel] = useState(0);
  const handleSelect = (selectedIndex) => {
    setIndexCarousel(selectedIndex);
  };
  const [showImage, setShowImage] = useState(false);

  const { data: tripDetailData, isLoading: tripDetailDataIsLoading } =
    useQuery("tripDetailCache", async () => {
      try {
        const response = await API.get(`/trip/${idTrip}`);
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
          width: "100%",
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
        </Container>
      )}
    </main>
  );
};

export default DetailTripAdmin;
