import {
  Container,
  Card,
  Row,
  Col,
  Button,
  InputGroup,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { API } from "../config/api";
import { useState } from "react";
import Swal from "sweetalert2";
import CountryCard from "../component/CountryCard";

const IncomeTrip = () => {
  const navigate = useNavigate();

  const { data: tripData, refetch: refetchTrip } = useQuery(
    "tripDataCache",
    async () => {
      try {
        const response = await API.get("/trip");
        return response.data.data;
      } catch (err) {
        console.log(err.response.data.message);
      }
    }
  );

  const { data: countryData, refetch: refetchCountry } = useQuery(
    "countryDataCache",
    async (e) => {
      try {
        const response = await API.get("/country");
        return response.data.data;
      } catch (err) {
        console.log(err.response.data.message);
      }
    }
  );
  const [newCountry, setNewCountry] = useState("");
  const handleAddCountry = useMutation(async () => {
    let body = {
      name: newCountry,
    };

    const response = await API.post("/country", body);
    if (response.data.code === 200) {
      refetchCountry();
      setNewCountry("");
      Swal.fire({
        icon: "success",
        title: "New country added successfully",
      });
    }
  });

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginTop: 100, marginBottom: 54 }}
      className="py-5 position-relative"
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

      <Container>
        <Row>
          <Col lg={8}>
            <div className="mt-3 d-flex justify-content-between">
              <h1>Income Trip</h1>
              <Button
                variant="warning"
                className="text-light fw-bold py-0 px-5 fs-5"
                onClick={() => {
                  navigate("/addtrip");
                }}
              >
                Add Trip
              </Button>
            </div>
            <Row g={0}>
              {tripData?.map((el, i) => {
                return (
                  <Col lg={6} className="p-3" key={i}>
                    <Card
                      className="d-flex flex-column justify-content-center p-3"
                      onClick={() => {
                        navigate(`/detail-for-admin/${el.id}`);
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
          </Col>
          <Col
            lg={{
              span: 3,
              offset: 1,
            }}
          >
            <div className="my-4 d-flex justify-content-end">
              <h2>List of Countries</h2>
            </div>
            {countryData?.map((c) => {
              return (
                <CountryCard
                  country={c}
                  refetchCountry={refetchCountry}
                  refetchTrip={refetchTrip}
                />
              );
            })}
            <InputGroup className="my-3" size="lg">
              <Form.Control
                placeholder="Insert New Country"
                aria-label="Insert New Country"
                aria-describedby="basic-addon2"
                value={newCountry}
                onChange={(e) => {
                  setNewCountry(e.target.value);
                }}
              />
              {handleAddCountry.isLoading ? (
                <Button
                  variant="warning"
                  className="text-white"
                  id="button-addon2"
                  disabled
                  style={{ zIndex: 1 }}
                >
                  <Spinner animation="border" variant="light" />
                </Button>
              ) : (
                <Button
                  variant="warning"
                  className="text-white"
                  id="button-addon2"
                  onClick={() => {
                    if (newCountry !== "") {
                      handleAddCountry.mutate();
                    } else {
                      Swal.fire({
                        icon: "warning",
                        text: "Please insert a new country",
                      });
                    }
                  }}
                  style={{ zIndex: 1 }}
                >
                  Add
                </Button>
              )}
            </InputGroup>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default IncomeTrip;
