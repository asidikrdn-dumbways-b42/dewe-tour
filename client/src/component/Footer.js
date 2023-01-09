const Footer = () => {
  return (
    <>
      {/* footer dekstop */}
      <footer
        className="w-100 position-absolute bottom-0  d-lg-block d-none"
        style={{ height: 54 }}
      >
        <div
          xs={11}
          style={{ width: "95%" }}
          className="bg-warning h-100 d-flex flex-column justify-content-center"
        >
          <p
            className="text-center text-white p-0 m-0"
            style={{ fontSize: 18, fontWeight: "400" }}
          >
            Copyright &copy; 2022 Dewe Tour - Ahmad Sidik Rudini - B42. All
            Rights reserved
          </p>
        </div>
        <div
          className="position-absolute end-0 bottom-0"
          style={{
            width: "7%",
          }}
        >
          <img src="/img/leaf-footer.png" alt="leaf footer" className="w-100" />
        </div>
      </footer>
      
      {/* footer mobile */}
      <footer
        className="w-100 position-absolute bottom-0 d-lg-none d-block"
        style={{ height: 54 }}
      >
        <div
          xs={11}
          style={{ width: "100%" }}
          className="bg-warning h-100 d-flex flex-column justify-content-center"
        >
          <p
            className="text-center text-white p-0 m-0"
            style={{ fontSize: 18, fontWeight: "400" }}
          >
            Copyright &copy; 2022 Dewe Tour - Ahmad Sidik Rudini - B42. All
            Rights reserved
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
