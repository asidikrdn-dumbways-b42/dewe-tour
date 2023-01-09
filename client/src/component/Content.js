import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

const Content = ({ searchQuery }) => {
  const navigate = useNavigate();

  const { data: tripData, isisLoading: tripDataIsisLoading } = useQuery(
    "tripDataCache",
    async (e) => {
      try {
        const response = await API.get("/trip");
        return response.data.data;
      } catch (err) {
        console.log(err);
      }
    }
  );

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginBottom: 54 }}
      className="py-3 position-relative"
    >
      <img
        src="./img/hibiscus.png"
        alt="Bunga"
        style={{ top: -75 }}
        className="position-absolute end-0"
      />
      <img
        src="./img/palm.png"
        alt="Rumput"
        style={{ top: "30%" }}
        className="position-absolute start-0"
      />
      <Container
        className="d-flex flex-row justify-content-lg-center"
        id="card-guarantee"
      >
        <Row>
          <Col xs={12} lg={3} className="d-flex justify-content-center">
            <Card
              // style={{ marginTop: -75, height: 350, width: 250, zIndex: 2 }}
              className="d-flex flex-column justify-content-center p-3 card-guarantee"
            >
              <img
                src="./img/guarantee.png"
                alt="Guarantee"
                width={"75"}
                className="mx-auto my-2"
              />
              <h3 className="text-center">Best Price Guarantee</h3>
              <p className="text-center">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt,
                praesentium?
              </p>
            </Card>
          </Col>
          <Col xs={12} lg={3} className="d-flex justify-content-center">
            <Card
              // style={{ marginTop: -75, height: 350, width: 250, zIndex: 2 }}
              className="d-flex flex-column justify-content-center p-3 card-guarantee"
            >
              <img
                src="./img/heart.png"
                alt="Travelers"
                width={"75"}
                className="mx-auto my-2"
              />
              <h3 className="text-center">Travelers Love Us</h3>
              <p className="text-center">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt,
                praesentium?
              </p>
            </Card>
          </Col>
          <Col xs={12} lg={3} className="d-flex justify-content-center">
            <Card
              // style={{ marginTop: -75, height: 350, width: 250, zIndex: 2 }}
              className="d-flex flex-column justify-content-center p-3 card-guarantee"
            >
              <img
                src="./img/agent.png"
                alt="Agent"
                width={"75"}
                className="mx-auto my-2"
              />{" "}
              <h3 className="text-center">Best Travel Agent</h3>
              <p className="text-center">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt,
                praesentium?
              </p>
            </Card>
          </Col>
          <Col xs={12} lg={3} className="d-flex justify-content-center">
            <Card
              // style={{ marginTop: -75, height: 350, width: 250, zIndex: 2 }}
              className="d-flex flex-column justify-content-center p-3 card-guarantee"
            >
              <img
                src="./img/support.png"
                alt="Support"
                width={"75"}
                className="mx-auto my-2"
              />
              <h3 className="text-center">Our Dedicated Support</h3>
              <p className="text-center">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt,
                praesentium?
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
      <Container>
        <h1 className="text-center mt-3 py-5">Group Tour</h1>
        {tripDataIsisLoading ? (
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
          <Row>
            {searchQuery !== ""
              ? // eslint-disable-next-line array-callback-return
                tripData?.map((el, i) => {
                  const regex = new RegExp(searchQuery, "im"); // im digunakan untuk ignore case dan
                  // console.log(regex);
                  // console.log(regex.test(el.title));

                  // pencarian pola regex pada title, country, dan deskripsi. Apabila salah satunya menemukan kecocokan, maka tampilkan halaman tersebut
                  if (
                    regex.test(el.title) ||
                    regex.test(el.country.name) ||
                    regex.test(el.description)
                  ) {
                    return (
                      <Col lg={4} className="p-3" key={i}>
                        <Card
                          className="d-flex flex-column justify-content-center p-3"
                          onClick={() => {
                            navigate(`/detail/${el.id}`);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div id="img-group" className="position-relative">
                            <Card.Img
                              variant="top"
                              src={el.images[0]}
                              className="img-fluid"
                            />
                            <div
                              style={{ width: 50, height: 30, top: 15 }}
                              className="bg-light position-absolute end-0 text-center d-flex flex-column justify-content-center rounded-start"
                            >
                              <p className="m-0 fw-bolder">{`${
                                el.totalQuota - el.quotaAvailable
                              }/${el.totalQuota}`}</p>
                            </div>
                          </div>
                          <Card.Body className="p-0">
                            <Card.Title>
                              {el.title.length > 27
                                ? `${el.title.slice(0, 26)} . . .`
                                : el.title}
                            </Card.Title>
                            {/* </Link> */}
                            <div className="d-flex justify-content-between">
                              <p className="text-warning mb-0 fw-bolder">
                                Rp {el.price.toLocaleString()},-
                              </p>
                              <p className="text-secondary mb-0">
                                {el.country.name}
                              </p>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  }
                })
              : tripData?.map((el, i) => {
                  return (
                    <Col lg={4} className="p-3" key={i}>
                      <Card
                        className="d-flex flex-column justify-content-center p-3"
                        onClick={() => {
                          navigate(`/detail/${el.id}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div id="img-group" className="position-relative">
                          <Card.Img
                            variant="top"
                            src={el.images[0]}
                            className="img-fluid"
                          />
                          <div
                            style={{ width: 50, height: 30, top: 15 }}
                            className="bg-light position-absolute end-0 text-center d-flex flex-column justify-content-center rounded-start"
                          >
                            <p className="m-0 fw-bolder">{`${
                              el.totalQuota - el.quotaAvailable
                            }/${el.totalQuota}`}</p>
                          </div>
                        </div>
                        <Card.Body className="p-0">
                          <Card.Title>
                            {el.title.length > 27
                              ? `${el.title.slice(0, 26)} . . .`
                              : el.title}
                          </Card.Title>
                          {/* </Link> */}
                          <div className="d-flex justify-content-between">
                            <p className="text-warning mb-0 fw-bolder">
                              Rp {el.price.toLocaleString()},-
                            </p>
                            <p className="text-secondary mb-0">
                              {el.country.name}
                            </p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
          </Row>
        )}
      </Container>
    </main>
  );
};

export default Content;
