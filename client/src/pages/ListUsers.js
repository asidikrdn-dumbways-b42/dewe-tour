import { Container, Table } from "react-bootstrap";
import { HiMagnifyingGlassCircle } from "react-icons/hi2";
import { useState } from "react";
import { useQuery } from "react-query";
import { API } from "../config/api";
import DetailUserModal from "../component/DetailUsermodal";

const ListUsers = () => {
  const [showDetailUser, setShowDetailUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { data: allUsers, refetch: refetchUsers } = useQuery(
    "allUsersCache",
    async () => {
      try {
        const response = await API.get("/users");

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
      {currentUser && (
        <DetailUserModal
          showDetailUser={showDetailUser}
          setShowDetailUser={setShowDetailUser}
          currentUser={currentUser}
          refetchUsers={refetchUsers}
        />
      )}

      <Container>
        <h1>List of Users</h1>
        <Table striped className="bg-light mt-4">
          <thead>
            <tr>
              <th className="py-3 text-start">
                <p className="ps-5 p-0 m-0">Nama User</p>
              </th>
              <th className="py-3 text-center">Email</th>
              <th className="py-3 text-center">Phone</th>
              {/* <th className="py-3 text-center">Bukti Transfer</th> */}
              <th className="py-3 text-center">Gender</th>
              <th className="py-3 text-center">Show Detail</th>
            </tr>
          </thead>
          <tbody>
            {allUsers?.map((user) => {
              return (
                <tr key={user.id}>
                  <td className="ps-5">{user.fullName}</td>
                  <td className="text-center">{user.email}</td>
                  {/* <td className="text-center">-</td> */}
                  <td className={`text-center `}>{user.phone}</td>
                  <td className={`text-center `}>{user.gender}</td>
                  <td className="text-center">
                    <HiMagnifyingGlassCircle
                      className="fs-2 text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowDetailUser(true);
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

export default ListUsers;
