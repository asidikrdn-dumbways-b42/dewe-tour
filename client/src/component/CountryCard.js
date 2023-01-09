import { Card, Button, InputGroup, Form, Spinner } from "react-bootstrap";
import { MdCancel, MdDeleteForever, MdModeEdit, MdSave } from "react-icons/md";
import { useMutation } from "react-query";
import { API } from "../config/api";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const CountryCard = ({ country, refetchCountry, refetchTrip }) => {
  const [editMode, setEditMode] = useState(false);

  const [editCountry, setEditCountry] = useState();

  useEffect(() => {
    setEditCountry(country.name);
  }, [country]);

  const DeleteCountryButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-2",
      cancelButton: "btn btn-danger mx-2",
    },
    buttonsStyling: false,
  });
  const handleDeleteCountry = useMutation(async (id) => {
    try {
      const response = await API.delete(`/country/${id}`);
      if (response.data.code === 200) {
        refetchCountry();
      }
    } catch (e) {
      // console.log(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Can't delete this country, because it's already used by some trip data",
      });
    }
  });

  const handleUpdateCountry = useMutation(async () => {
    try {
      const body = {
        name: editCountry,
      };
      const response = await API.patch(`/country/${country.id}`, body);
      if (response.data.code === 200) {
        refetchCountry();
        refetchTrip();
        setEditMode(false);
        setEditCountry(country.name);
        Swal.fire({
          icon: "success",
          title: "Country updated successfully",
        });
      }
    } catch (e) {
      console.log(e.response.data.message);
    }
  });

  return (
    <Card>
      {editMode ? (
        <Card.Body className="position-relative country-list py-2">
          <InputGroup className="my-0" size="xs">
            <Form.Control
              aria-describedby="basic-addon2"
              value={editCountry}
              onChange={(e) => {
                setEditCountry(e.target.value);
              }}
            />
            {handleUpdateCountry.isLoading ? (
              <Button
                variant="warning"
                className="text-white"
                id="button-addon2"
                disabled
              >
                <Spinner animation="border" variant="light" />
              </Button>
            ) : (
              <>
                <Button
                  variant="warning"
                  className="text-white"
                  id="button-addon2"
                  onClick={() => {
                    handleUpdateCountry.mutate();
                  }}
                >
                  <MdSave />
                </Button>
                <Button
                  variant="danger"
                  className="text-white"
                  id="button-addon2"
                  onClick={() => {
                    setEditMode(false);
                    setEditCountry(country.name);
                  }}
                >
                  <MdCancel />
                </Button>
              </>
            )}
          </InputGroup>
        </Card.Body>
      ) : (
        <Card.Body className="position-relative country-list">
          <Card.Title>{country.name}</Card.Title>

          {handleDeleteCountry.isLoading ? (
            <div
              className="text-danger fs-4 fw-bold position-absolute"
              style={{ top: "15%", right: 15 }}
            >
              <Spinner animation="border" variant="danger" />
            </div>
          ) : (
            <>
              {/* edit button */}
              <div
                className="text-warning fs-4 fw-bold position-absolute edit-country-button"
                onClick={() => {
                  setEditMode(true);
                }}
              >
                <MdModeEdit />
              </div>
              {/* delete button */}
              <div
                className="text-danger fs-4 fw-bold position-absolute delete-country-button"
                onClick={() => {
                  DeleteCountryButtons.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete this country!",
                    cancelButtonText: "No, cancel!",
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleDeleteCountry.mutate(country.id);
                      if (handleDeleteCountry.isSuccess) {
                        DeleteCountryButtons.fire(
                          "Deleted!",
                          "Country has been deleted.",
                          "success"
                        );
                      }
                    } else if (
                      /* Read more about handling dismissals below */
                      result.dismiss === Swal.DismissReason.cancel
                    ) {
                      DeleteCountryButtons.fire(
                        "Cancelled",
                        "Country data is safe",
                        "error"
                      );
                    }
                  });
                }}
              >
                <MdDeleteForever />
              </div>
            </>
          )}
        </Card.Body>
      )}
    </Card>
  );
};

export default CountryCard;
