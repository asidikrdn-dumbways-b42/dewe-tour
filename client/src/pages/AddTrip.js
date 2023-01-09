import { useState } from "react";
import { Container, Form, Button, Row, Col, Image } from "react-bootstrap";
import { MdAttachFile, MdAddCircleOutline } from "react-icons/md";
import moment from "moment";
import { useMutation, useQuery } from "react-query";
import { API } from "../config/api";
import Swal from "sweetalert2";

const AddTrip = () => {
  const [input, setInput] = useState({
    title: "",
    id_country: "",
    accomodation: "",
    transportation: "",
    eat: "",
    day: "",
    night: "",
    dateTrip: "",
    price: "",
    quota: "",
    description: "",
    images: [],
  });
  const [error, setError] = useState({
    title: "",
    id_country: "",
    accomodation: "",
    transportation: "",
    eat: "",
    day: "",
    night: "",
    dateTrip: "",
    price: "",
    quota: "",
    description: "",
    images: "",
  });

  const handleInputChange = (e) => {
    // console.log(e.target.value);
    if (e.target.name === "images") {
      // mengambil file yang diupload pada input file
      let filesImg = e.target.files;
      // console.log(filesImg);
      // console.log(filesImg.length);
      // console.log(typeof filesImg); // tipenya object

      // Cek file upload apakah ada ? apakah formatnya sesuai (jpeg/png) ?
      if (filesImg.length > 0) {
        let arrImg = [];

        for (const indexImg in filesImg) {
          if (
            filesImg[indexImg].type === "image/png" ||
            filesImg[indexImg].type === "image/jpeg" ||
            filesImg[indexImg].type === "image/jpg"
          ) {
            // jika semua syarat terpenuhi, buatlah urlnya lalu simpan di object dengan key filesImg[indexImg]
            arrImg.push(filesImg[indexImg]);
          }
        }

        setInput((prevState) => {
          return {
            ...prevState,
            [e.target.name]: [...prevState.images, ...arrImg],
          };
        });
      }
    } else if (e.target.name === "price" || e.target.name === "quota") {
      setInput((prevState) => {
        return { ...prevState, [e.target.name]: parseInt(e.target.value) };
      });
    } else {
      setInput((prevState) => {
        return { ...prevState, [e.target.name]: e.target.value };
      });
    }
  };

  const validation = (input) => {
    const newError = {
      title: "",
      id_country: "",
      accomodation: "",
      transportation: "",
      eat: "",
      day: "",
      night: "",
      dateTrip: "",
      price: "",
      quota: "",
      description: "",
      images: "",
    };

    let newTrip = {
      title: "",
      id_country: "",
      accomodation: "",
      transportation: "",
      eat: "",
      day: "",
      night: "",
      dateTrip: "",
      price: "",
      quota: "",
      description: "",
      images: [],
    };

    // title
    newTrip.title = input.title.trim();
    if (newTrip.title === "") {
      newError.title = "Please fill out this field";
    } else {
      newError.title = "";
    }

    // price
    newTrip.price = input.price;
    if (newTrip.price === "" || isNaN(newTrip.price)) {
      newError.price = "Please fill out this field";
    } else if (newTrip.price < 0) {
      newError.price = "can't be less than 0";
    } else {
      newError.price = "";
    }

    // country
    newTrip.id_country = input.id_country.trim();
    if (newTrip.id_country === "") {
      newError.id_country = "Please fill out this field";
    } else {
      newError.id_country = "";
    }

    // quota
    newTrip.quota = input.quota;
    if (newTrip.quota === "" || isNaN(newTrip.quota)) {
      newError.quota = "Please fill out this field";
    } else if (newTrip.quota < 0) {
      newError.quota = "can't be less than 0";
    } else {
      newError.quota = "";
    }

    // img
    newTrip.images = input.images;
    if (newTrip.images.length < 4) {
      newError.images = "Please upload at least 4 image";
    } else {
      newError.images = "";
    }

    // accomodation
    newTrip.accomodation = input.accomodation.trim();
    if (newTrip.accomodation === "") {
      newError.accomodation = "Please fill out this field";
    } else {
      newError.accomodation = "";
    }

    // transportation
    newTrip.transportation = input.transportation.trim();
    if (newTrip.transportation === "") {
      newError.transportation = "Please fill out this field";
    } else {
      newError.transportation = "";
    }

    // eat
    newTrip.eat = input.eat.trim();
    if (newTrip.eat === "") {
      newError.eat = "Please fill out this field";
    } else {
      newError.eat = "";
    }

    // duration
    newTrip.day = input.day;
    if (input.day === "") {
      newError.day = "Please fill out this field";
    } else if (parseInt(input.day) < 0) {
      newError.day = "can't be less than 0";
    } else {
      newError.day = "";
    }
    newTrip.night = input.night;
    if (input.night === "") {
      newError.night = "Please fill out this field";
    } else if (parseInt(input.night) < 0) {
      newError.night = "can't be less than 0";
    } else {
      newError.night = "";
    }

    // date
    newTrip.dateTrip = input.dateTrip.trim();
    if (newTrip.dateTrip === "") {
      newError.dateTrip = "Please fill out this field";
    } else {
      newError.dateTrip = "";
      newTrip.dateTrip = moment(input.dateTrip.trim()).format("DD MMMM YYYY");
    }

    // desc
    newTrip.description = input.description.trim();
    if (newTrip.description === "") {
      newError.description = "Please fill out this field";
    } else {
      newError.description = "";
    }

    // console.log(newTrip);

    // jika semua newErrornya kosong, maka kirim data trip baru tersebut
    if (
      newError.title === "" &&
      newError.id_country === "" &&
      newError.accomodation === "" &&
      newError.transportation === "" &&
      newError.eat === "" &&
      newError.day === "" &&
      newError.night === "" &&
      newError.dateTrip === "" &&
      newError.price === "" &&
      newError.quota === "" &&
      newError.description === "" &&
      newError.images === ""
    ) {
      // reset error
      setError({
        title: "",
        id_country: "",
        accomodation: "",
        transportation: "",
        eat: "",
        day: "",
        night: "",
        dateTrip: "",
        price: "",
        quota: "",
        description: "",
        images: "",
      });
      return newTrip;
    } else {
      setError(newError);
      return "";
    }
  };

  const handleAddTrip = useMutation(async (e) => {
    e.preventDefault();

    const newTrip = validation(input);

    if (newTrip !== "") {
      let formBody = new FormData();

      formBody.append("title", newTrip.title);
      formBody.append("id_country", newTrip.id_country);
      formBody.append("accomodation", newTrip.accomodation);
      formBody.append("transportation", newTrip.transportation);
      formBody.append("eat", newTrip.eat);
      formBody.append("day", newTrip.day);
      formBody.append("night", newTrip.night);
      formBody.append("dateTrip", newTrip.dateTrip);
      formBody.append("price", newTrip.price);
      formBody.append("quota", newTrip.quota);
      formBody.append("description", newTrip.description);
      newTrip.images.forEach((img) => {
        formBody.append("images", img);
      });

      // tambahkan trip data baru
      const response = await API.post("/trip", formBody);
      // console.log(response.data);

      if (response.data.code === 200) {
        // reset input
        setInput({
          title: "",
          id_country: "",
          accomodation: "",
          transportation: "",
          eat: "",
          day: "",
          night: "",
          dateTrip: "",
          price: "",
          quota: "",
          description: "",
          images: [],
        });
        Swal.fire({
          icon: "success",
          title: "Trip Added Successfully ",
        });
      }
    }
  });

  const { data: countryData } = useQuery("countryDataCache", async (e) => {
    try {
      const response = await API.get("/country");
      return response.data.data;
    } catch (err) {
      console.log(err.response.data.message);
    }
  });

  // console.log(input);
  // console.log(error);

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginTop: 100, marginBottom: 54 }}
      className="py-5 position-relative"
    >
      <Container>
        <h1>Add Trip</h1>
        <Form className="p-4" onSubmit={handleAddTrip.mutate}>
          {/* title trip */}
          <Form.Group className="mb-4" controlId="formTitle">
            <Form.Label className="h3 fw-bolder">Title Trip</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Enter Title Trip"
              value={input.title}
              onChange={handleInputChange}
            />
            {error.title && (
              <Form.Text className="text-danger">{error.title}</Form.Text>
            )}
          </Form.Group>

          {/* country */}
          <Form.Group className="mb-4" controlId="formCountry">
            <Form.Label className="h3 fw-bolder">Country</Form.Label>
            <Form.Select
              name="id_country"
              value={input.id_country}
              onChange={handleInputChange}
            >
              <option value="">Country</option>
              {countryData?.map((c) => {
                return <option value={c.id}>{c.name}</option>;
              })}
            </Form.Select>
            {error.id_country && (
              <Form.Text className="text-danger">{error.id_country}</Form.Text>
            )}
          </Form.Group>

          {/* accomodation */}
          <Form.Group className="mb-4" controlId="formAccomodation">
            <Form.Label className="h3 fw-bolder">Accomodation</Form.Label>
            <Form.Control
              type="text"
              name="accomodation"
              placeholder="Enter Accomodation"
              value={input.accomodation}
              onChange={handleInputChange}
            />
            {error.accomodation && (
              <Form.Text className="text-danger">
                {error.accomodation}
              </Form.Text>
            )}
          </Form.Group>

          {/* transportation */}
          <Form.Group className="mb-4" controlId="formTransportation">
            <Form.Label className="h3 fw-bolder">Transportation</Form.Label>
            <Form.Control
              type="text"
              name="transportation"
              placeholder="Enter Transportation"
              value={input.transportation}
              onChange={handleInputChange}
            />
            {error.transportation && (
              <Form.Text className="text-danger">
                {error.transportation}
              </Form.Text>
            )}
          </Form.Group>

          {/* eat */}
          <Form.Group className="mb-4" controlId="formEat">
            <Form.Label className="h3 fw-bolder">Eat</Form.Label>
            <Form.Control
              type="text"
              name="eat"
              placeholder="Enter Eat"
              value={input.eat}
              onChange={handleInputChange}
            />
            {error.eat && (
              <Form.Text className="text-danger">{error.eat}</Form.Text>
            )}
          </Form.Group>

          <Form.Label className="h3 fw-bolder">Duration</Form.Label>
          <Row className="mb-4">
            <Col lg={4}>
              <Form.Group className="d-flex flex-row" controlId="formDay">
                <Form.Control
                  type="number"
                  name="day"
                  placeholder="Enter Day"
                  className="w-50 me-3"
                  value={input.day}
                  onChange={handleInputChange}
                />
                <Form.Label className="h3 fw-bolder">Day</Form.Label>
              </Form.Group>
              {error.day && (
                <Form.Text className="text-danger">{error.day}</Form.Text>
              )}
            </Col>
            <Col lg={4}>
              <Form.Group className="d-flex flex-row" controlId="formNight">
                <Form.Control
                  type="number"
                  name="night"
                  placeholder="Enter Night"
                  className="w-50 me-3"
                  value={input.night}
                  onChange={handleInputChange}
                />
                <Form.Label className="h3 fw-bolder">Night</Form.Label>
              </Form.Group>
              {error.night && (
                <Form.Text className="text-danger">{error.night}</Form.Text>
              )}
            </Col>
          </Row>

          {/* date */}
          <Form.Group className="mb-4" controlId="formDate">
            <Form.Label className="h3 fw-bolder">Date</Form.Label>
            <Form.Control
              type="date"
              name="dateTrip"
              placeholder="Enter Date"
              value={input.dateTrip}
              onChange={handleInputChange}
            />
            {error.dateTrip && (
              <Form.Text className="text-danger">{error.dateTrip}</Form.Text>
            )}
          </Form.Group>

          {/* price */}
          <Form.Group className="mb-4" controlId="formPrice">
            <Form.Label className="h3 fw-bolder">Price</Form.Label>
            <Form.Control
              type="number"
              name="price"
              placeholder="Enter Price"
              value={input.price}
              onChange={handleInputChange}
            />
            {error.price && (
              <Form.Text className="text-danger">{error.price}</Form.Text>
            )}
          </Form.Group>

          {/* quota */}
          <Form.Group className="mb-4" controlId="formQuota">
            <Form.Label className="h3 fw-bolder">Quota</Form.Label>
            <Form.Control
              type="number"
              name="quota"
              placeholder="Enter Quota"
              value={input.quota}
              onChange={handleInputChange}
            />
            {error.quota && (
              <Form.Text className="text-danger">{error.quota}</Form.Text>
            )}
          </Form.Group>

          {/* desc */}
          <Form.Group className="mb-4" controlId="formDescription">
            <Form.Label className="h3 fw-bolder">Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              placeholder="Enter Trip Description"
              style={{ height: "100px" }}
              value={input.description}
              onChange={handleInputChange}
            />
            {error.description && (
              <Form.Text className="text-danger">{error.description}</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="h3 fw-bolder">Image</Form.Label>
            {error.images && (
              <Form.Text className="text-danger d-block">
                {error.images}
              </Form.Text>
            )}
            <Form.Control
              type="file"
              name="images"
              id="img-addtrip"
              size="lg"
              className="d-none"
              multiple
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* <div
            className="py-2 px-2 text-warning fs-5 fw-bold border border-2 rounded-3 d-flex justify-content-between align-items-center d-inline-block"
            style={{
              backgroundColor: "whitesmoke",
              cursor: "pointer",
              width: "25%",
            }}
            onClick={() => {
              document.getElementById("img-addtrip").click();
            }}
          >
            <p className="p-0 m-0">Add Attachment Here</p>
            <MdAttachFile className="" />
          </div> */}

          {input.images.length > 0 ? (
            <div className="d-flex justify-content-start flex-wrap">
              {input.images.map((img, i) => {
                return (
                  <Image
                    src={URL.createObjectURL(img)}
                    style={{ width: 250, height: 250, marginRight: 10 }}
                    className="my-2"
                    key={i}
                  />
                );
              })}
              <div
                className="my-2 text-warning fs-3 fw-bold border border-2 rounded-3 d-flex flex-column justify-content-center align-items-center"
                style={{
                  backgroundColor: "whitesmoke",
                  cursor: "pointer",
                  width: 250,
                  height: 250,
                }}
                onClick={() => {
                  document.getElementById("img-addtrip").click();
                }}
              >
                <MdAddCircleOutline className="fs-1" />
                <p className="p-0 m-0">Add More Image</p>
              </div>
            </div>
          ) : (
            <div
              className="py-2 px-2 text-warning fs-5 fw-bold border border-2 rounded-3 d-flex justify-content-between align-items-center d-inline-block"
              style={{
                backgroundColor: "whitesmoke",
                cursor: "pointer",
                width: "25%",
              }}
              onClick={() => {
                document.getElementById("img-addtrip").click();
              }}
            >
              <p className="p-0 m-0">Add Attachment Here</p>
              <MdAttachFile className="" />
            </div>
          )}

          <div className="d-flex justify-content-center mt-3">
            {handleAddTrip.isLoading ? (
              <Button
                variant="warning"
                type="submit"
                className="px-5 text-white fs-5 fw-bolder"
                disabled
              >
                Adding Trip...
              </Button>
            ) : (
              <Button
                variant="warning"
                type="submit"
                className="px-5 text-white fs-5 fw-bolder"
              >
                Add Trip
              </Button>
            )}
          </div>
        </Form>
      </Container>
    </main>
  );
};

export default AddTrip;
