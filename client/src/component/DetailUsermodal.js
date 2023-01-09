import { Modal, Card, Row, Col, Image } from "react-bootstrap";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
// import { useMutation } from "react-query";
// import Swal from "sweetalert2";
// import { API } from "../config/api";

const DetailUserModal = ({
  showDetailUser,
  setShowDetailUser,
  currentUser,
  refetchUsers,
}) => {
  /*
  const handleCancleOrder = useMutation(async () => {
    try {
      let payload = {
        status: "reject",
      };
      const response = await API.patch(
        `/transaction/${currentOrder.id}`,
        payload
      );
      console.log(response.data);
      if (response.data.code === 200) {
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
        `/transaction/${currentOrder.id}`,
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
  */

  return (
    <Modal
      show={showDetailUser}
      centered
      onHide={() => {
        setShowDetailUser(false);
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
      dialogClassName="detailUser-modals"
    >
      <Card className="w-100 mx-auto px-4 py-3">
        <Row>
          <Col lg={7}>
            <h1>Personal Info</h1>
            <div className="d-flex flex-column mt-4">
              <div className="d-flex flex-row align-items-center my-1">
                <IoPersonCircleSharp className="display-2 text-secondary me-3" />
                <div>
                  <h5 className="m-0">{currentUser?.fullName}</h5>
                  <p className="text-secondary m-0">Fullname</p>
                </div>
              </div>
              <div className="d-flex flex-row align-items-center my-1">
                <MdEmail className="display-2 text-secondary me-3" />
                <div>
                  <h5 className="m-0">{currentUser?.email}</h5>
                  <p className="text-secondary m-0">Email</p>
                </div>
              </div>
              <div className="d-flex flex-row align-items-center my-1">
                <MdPhone className="display-2 text-secondary me-3" />
                <div>
                  <h5 className="m-0">{`${currentUser?.phone.slice(
                    0,
                    4
                  )}-${currentUser?.phone.slice(
                    4,
                    8
                  )}-${currentUser?.phone.slice(8)}`}</h5>
                  <p className="text-secondary m-0">Mobile phone</p>
                </div>
              </div>
              <div className="d-flex flex-row align-items-center my-1">
                <MdLocationOn className="display-2 text-secondary me-3" />
                <div>
                  <h5 className="m-0">{currentUser?.address}</h5>
                  <p className="text-secondary m-0">Address</p>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={5} className="pt-3">
            {currentUser?.image ? (
              <Image src={currentUser?.image} alt="profile" className="w-100" />
            ) : (
              <Image
                src="/img/profile-undefined.png"
                alt="profile"
                className="w-100"
              />
            )}
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

export default DetailUserModal;
