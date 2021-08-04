import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ThemeCtxProvider } from "./contexts/ThemeContext";
import { UserCtxProvider } from "./contexts/UserContext";

ReactDOM.render(
    <ThemeCtxProvider>
        <UserCtxProvider>
            <App />
        </UserCtxProvider>
    </ThemeCtxProvider>,
    document.getElementById("root")
);
