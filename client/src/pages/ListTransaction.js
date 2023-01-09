import { Container, Table } from "react-bootstrap";
import { HiMagnifyingGlassCircle } from "react-icons/hi2";
import { useState } from "react";
import Approvement from "../component/Approvement";
import { useQuery } from "react-query";
import { API } from "../config/api";

const ListTransaction = () => {
  const [showApprovement, setShowApprovement] = useState(false);
  // const [showImg, setShowImg] = useState(false);
  // const [currentImgUrl, setCurrentImgUrl] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);

  const { data: allTransaction, refetch: refetchTransaction } = useQuery(
    "allTransactionCache",
    async () => {
      try {
        const response = await API.get("/orders");

        return response.data.data;
      } catch (e) {
        console.log(e);
      }
    }
  );

  return (
    <main
      style={{ backgroundColor: "#E5E5E5", marginTop: 100, marginBottom: 54 }}
      className="py-5 position-relative"
    >
      {currentOrder && (
        <Approvement
          showApprovement={showApprovement}
          setShowApprovement={setShowApprovement}
          currentOrder={currentOrder}
          refetchTransaction={refetchTransaction}
        />
      )}

      <Container>
        <h1>Incoming Transaction</h1>
        <Table striped className="bg-light mt-4">
          <thead>
            <tr>
              <th className="py-3 text-start">
                {" "}
                <p className="ms-5 ps-5 p-0 m-0">Id Trx</p>
              </th>
              <th className="py-3 text-center">Users</th>
              <th className="py-3 text-center">Trip</th>
              {/* <th className="py-3 text-center">Bukti Transfer</th> */}
              <th className="py-3 text-center">Status Payment</th>
              <th className="py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {allTransaction?.map((trx) => {
              return (
                <tr key={trx.id}>
                  <td>{trx.id.toUpperCase()}</td>
                  <td className="text-center">{trx.user.fullName}</td>
                  <td className="text-center">{trx.trip.title}</td>
                  {/* <td className="text-center">-</td> */}
                  <td
                    className={`text-center fw-bold 
                    ${trx.status === "new" && "text-secondary"}
                    ${trx.status === "pending" && "text-warning"}
                    ${trx.status === "success" && "text-success"}
                    ${trx.status === "approve" && "text-success"}
                    ${trx.status === "cancel" && "text-danger"}
                    `}
                  >
                    {trx.status.toUpperCase()}
                  </td>
                  <td className="text-center">
                    <HiMagnifyingGlassCircle
                      className="fs-2 text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setCurrentOrder(trx);
                        setShowApprovement(true);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
    </main>
  );
};

export default ListTransaction;
