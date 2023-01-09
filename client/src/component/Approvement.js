import {
  Modal,
  Card,
  Row,
  Col,
  Alert,
  Image,
  Button,
  Spinner,
} from "react-bootstrap";
import { useMutation } from "react-query";
import Swal from "sweetalert2";
import { API } from "../config/api";

const Approvement = ({
  showApprovement,
  setShowApprovement,
  currentOrder,
  refetchTransaction,
}) => {
  const handleCancleOrder = useMutation(async () => {
    try {
      let payload = {
        status: "reject",
      };
      const response = await API.patch(
        `/transaction-admin/${currentOrder.id}`,
        payload
      );
      console.log(response.data);
      if (response.data.code === 200) {
        Swal.fire("Rejected!", "Transaction has been rejected.", "success");
        refetchTransaction();
        setShowApprovement(false);
      }
    } catch (e) {
      console.log(e);
    }
  });

  const RejectTransactionButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mx-2",
      cancelButton: "btn btn-danger mx-2",
    },
    buttonsStyling: false,
  });

  const handleApproveOrder = useMutation(async () => {
    let payload = {
      status: "approve",
    };
    try {
      const response = await API.patch(
        `/transaction-admin/${currentOrder.id}`,
        payload
      );
      console.log(response.data);
      if (response.data.code === 200) {
        Swal.fire({
          title: "Transaction approved",
          icon: "success",
        });
        refetchTransaction();
        setShowApprovement(false);
      }
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <Modal
      show={showApprovement}
      centered
      onHide={() => {
        setShowApprovement(false);
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
      dialogClassName="approvement-modals"
    >
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
            <div className="d-flex flex-column align-items-end w-75">
              <h1>Booking</h1>
              <h5 className="text-secondary">{currentOrder.bookingDate}</h5>
            </div>
          </Col>
        </Row>
        <Row className="px-4">
          <Col lg={5} className="d-flex flex-column justify-content-between">
            <div>
              <h2>{currentOrder.trip?.title}</h2>
              <h5 className="text-secondary">
                {currentOrder.trip?.country.name}
              </h5>
            </div>
            <div className="pb-5">
              {currentOrder.status === "new" && (
                <Alert variant="danger" className="d-inline-block p-1 px-3">
                  Waiting Payment
                </Alert>
              )}
              {currentOrder.status === "pending" && (
                <Alert variant="danger" className="d-inline-block p-1 px-3">
                  Waiting Payment
                </Alert>
              )}
              {currentOrder.status === "success" && (
                <Alert variant="warning" className="d-inline-block p-1 px-3">
                  Waiting Approve
                </Alert>
              )}
              {currentOrder.status === "approve" && (
                <Alert variant="success" className="d-inline-block p-1 px-3">
                  Approve
                </Alert>
              )}
              {currentOrder.status === "reject" && (
                <Alert variant="danger" className="d-inline-block p-1 px-3">
                  Transaction rejected
                </Alert>
              )}
              {currentOrder.status === "failed" && (
                <Alert variant="danger" className="d-inline-block p-1 px-3">
                  Payment failed
                </Alert>
              )}
            </div>
          </Col>
          <Col lg={{ span: 5, offset: 2 }}>
            <Row g={0}>
              <Col lg={6} className="pb-5">
                <h4>Date Trip</h4>
                <h5 className="text-secondary">
                  {currentOrder.trip?.dateTrip}
                </h5>
              </Col>
              <Col lg={6} className="pb-5">
                <h4>Duration</h4>
                <h5 className="text-secondary">{`${currentOrder.trip?.day} Day ${currentOrder.trip?.night} Night`}</h5>
              </Col>
              <Col lg={6} className="pb-5">
                <h4>Accomodation</h4>
                <h5 className="text-secondary">
                  {currentOrder.trip?.accomodation}
                </h5>
              </Col>
              <Col lg={6} className="pb-5">
                <h4>Transportation</h4>
                <h5 className="text-secondary">
                  {currentOrder.trip?.transportation}
                </h5>
              </Col>
            </Row>
          </Col>
          {/* <Col
            lg={3}
            className="d-flex flex-column align-items-center justify-content-center"
          >
            <h5>{currentOrder.id}</h5>
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
            <p className="my-0 text-muted">{currentOrder.user?.fullName}</p>
          </Col>
          <Col lg={2}>
            <p className="my-0 text-muted">{currentOrder.user?.gender}</p>
          </Col>
          <Col lg={2}>
            <p className="my-0 text-muted">{currentOrder.user?.phone}</p>
          </Col>
          <Col lg={2} className="text-center fw-bold">
            <p className="my-0">Qty</p>
          </Col>
          <Col className="text-start ps-5 fw-bold">
            <p className="my-0">
              <span className="px-3 me-3">:</span>
              {currentOrder.counterQty}
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
          <Col lg={{ span: 2, offset: 7 }} className="text-center fw-bold">
            <p className="my-0">Total</p>
          </Col>
          <Col className="text-start ps-5 fw-bold">
            <p className="my-0 text-danger">
              <span className="px-3 me-3 text-black">:</span>IDR. &nbsp;
              {currentOrder.total.toLocaleString()}
            </p>
          </Col>
        </Row>
        {currentOrder.status === "success" && (
          <div className={`d-flex justify-content-end mt-4`}>
            {handleCancleOrder.isLoading ? (
              <Button
                variant="danger"
                className="text-white m-3 fs-5 fw-bold"
                style={{ width: 200 }}
                disabled
              >
                <Spinner animation="border" variant="light" />
              </Button>
            ) : (
              <Button
                variant="danger"
                className="text-white m-3 fs-5 fw-bold"
                style={{ width: 200 }}
                onClick={() => {
                  RejectTransactionButtons.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, reject this transaction!",
                    cancelButtonText: "No, cancel!",
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleCancleOrder.mutate();
                    } else if (
                      /* Read more about handling dismissals below */
                      result.dismiss === Swal.DismissReason.cancel
                    ) {
                      RejectTransactionButtons.fire(
                        "Cancelled",
                        "Transaction still waiting for your approval",
                        "error"
                      );
                    }
                  });
                }}
                disabled={
                  handleApproveOrder.isLoading || handleCancleOrder.isLoading
                }
              >
                Reject
              </Button>
            )}

            {handleApproveOrder.isLoading ? (
              <Button
                variant="success"
                className="text-white m-3 fs-5 fw-bold"
                style={{ width: 200 }}
                disabled
              >
                <Spinner animation="border" variant="light" />
              </Button>
            ) : (
              <Button
                variant="success"
                className="text-white m-3 fs-5 fw-bold"
                style={{ width: 200 }}
                onClick={handleApproveOrder.mutate}
                disabled={
                  handleApproveOrder.isLoading || handleCancleOrder.isLoading
                }
              >
                Approve
              </Button>
            )}
          </div>
        )}
      </Card>
    </Modal>
  );
};

export default Approvement;
