import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import Store from "./store/Store";
import { QueryClient, QueryClientProvider } from "react-query";
import ScrollToTop from "./component/ScrollToTop";

const client = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Store>
      <QueryClientProvider client={client}>
        <Router>
          <ScrollToTop />
          <App />
        </Router>
      </QueryClientProvider>
    </Store>
  </React.StrictMode>
);
