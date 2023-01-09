import { useState } from "react";
import Header from "../component/Header";
import Content from "../component/Content";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // console.log(searchQuery);

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Content searchQuery={searchQuery} />
    </>
  );
};

export default Home;
