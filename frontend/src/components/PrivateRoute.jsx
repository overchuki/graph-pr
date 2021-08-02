import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const PrivateRoute = ({ component: Component, ...rest }) => {
    let user = useUser();
    return (
        <Route
            {...rest}
            render={(props) =>
                user ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {
                                from: props.location,
                                title: "Log in to view this page.",
                            },
                        }}
                    />
                )
            }
        />
    );
};

export default PrivateRoute;
