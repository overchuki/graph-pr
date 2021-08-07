import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface Props {
    path: string;
}

const PublicRoute: React.FC<Props> = ({ path, children, ...rest }) => {
    let user = useUser();
    return <Route path={path} {...rest} render={(props) => (user ? <Redirect to="/" /> : children)} />;
};

export default PublicRoute;
