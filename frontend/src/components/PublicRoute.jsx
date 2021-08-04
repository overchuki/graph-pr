import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const PublicRoute = ({ component: Component, componentProps, ...rest }) => {
    let user = useUser();
    return <Route {...rest} render={(props) => (user ? <Redirect to="/" /> : <Component {...componentProps} {...props} />)} />;
};

export default PublicRoute;
