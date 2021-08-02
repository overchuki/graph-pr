import { BrowserRouter as Router, Link, Switch, Route, Redirect } from "react-router-dom";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import Navbar from "./components/Navbar";
import Home from "./views/Home";
import Signup from "./views/Signup";
import Login from "./views/Login";
import PrivateRoute from "./components/PrivateRoute";
import Nutrition from "./views/Nutrition";
import Lifting from "./views/Lifting";
import Bodyweight from "./views/Bodyweight";
import Profile from "./views/Profile";
import { useTheme } from "./contexts/ThemeContext";
import axios from "axios";
import Config from "./Config";
import { useUpdateUser } from "./contexts/UserContext";
import { useUpdateTheme } from "./contexts/ThemeContext";
import { useEffect } from "react";

function App() {
    const theme = useTheme();

    const updateUser = useUpdateUser();
    const updateTheme = useUpdateTheme();

    const login = async () => {
        let user = await axios.get(Config.apiURL + "/auth/", {
            withCredentials: true,
        });
        user = user.data;

        if (user.error) {
            updateUser(false);
            updateTheme(0);
            document.cookie = "";
        } else {
            updateUser(user);
            updateTheme(user.theme);
        }
    };

    useEffect(() => {
        if (document.cookie.includes("user=jwtexists")) {
            login();
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Router>
                    <div
                        style={{
                            flexGrow: 1,
                            height: "100%",
                        }}
                    >
                        <Navbar />
                        <Switch>
                            <Route path="/" exact render={(props) => <Home {...props} />} />
                            <PrivateRoute path="/nutrition" component={Nutrition} />
                            <PrivateRoute path="/lifting" component={Lifting} />
                            <PrivateRoute path="/bodyweight" component={Bodyweight} />
                            <PrivateRoute path="/profile" component={Profile} />
                            <Route path="/signup" render={(props) => <Signup {...props} title={"Create a new Account."} />} />
                            <Route path="/login" render={(props) => <Login {...props} title={"Log in here."} />} />
                        </Switch>
                    </div>
                </Router>
            </div>
        </ThemeProvider>
    );
}

export default App;
