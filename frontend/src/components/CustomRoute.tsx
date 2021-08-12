import React from "react";
import { Route, Redirect } from "react-router-dom";
import { RootState } from "../global/store";
import { useAppSelector } from "../global/hooks";

interface Props {
    path: string;
    privateRoute: boolean;
}

const CustomRoute: React.FC<Props> = ({ path, privateRoute, children, ...rest }) => {
    const user = useAppSelector((state: RootState) => state.user);

    return (
        <Route
            path={path}
            {...rest}
            render={(props) =>
                user ? (
                    privateRoute ? (
                        children
                    ) : (
                        <Redirect to="/" />
                    )
                ) : privateRoute ? (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {
                                from: props.location,
                                title: "Log in to view this page.",
                            },
                        }}
                    />
                ) : (
                    children
                )
            }
        />
    );
};

export default CustomRoute;
