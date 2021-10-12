import ReactDOM from "react-dom";
import "./index.css";
import AppTS from "./App";
import { Provider } from "react-redux";
import store from "./global/store";

ReactDOM.render(
    <Provider store={store}>
        <AppTS />
    </Provider>,
    document.getElementById("root")
);
