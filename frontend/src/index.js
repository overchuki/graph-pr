import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ThemeCtxProvider } from "./contexts/ThemeContext";
import { UserCtxProvider } from "./contexts/UserContext";

ReactDOM.render(
  <React.StrictMode>
    <ThemeCtxProvider>
      <UserCtxProvider>
        <App />
      </UserCtxProvider>
    </ThemeCtxProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
