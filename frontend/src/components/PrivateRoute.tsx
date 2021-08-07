import { Route, Redirect } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface Props {
    path: string;
}

const PrivateRoute: React.FC<Props> = ({ children, path, ...rest }) => {
    let user = useUser();
    return (
        <Route
            path={path}
            {...rest}
            render={(props) =>
                user ? (
                    children
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
