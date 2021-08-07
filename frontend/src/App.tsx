import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
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
import PublicRoute from "./components/PublicRoute";

interface UserData {
    data: {
        name: string;
        username: string;
        email: string;
        description: string;
        dob: string;
        height: number;
        height_unit: string;
        height_unit_fk: number;
        theme: number;
        gender: string;
        gender_fk: number;
        weight_unit: string;
        weight_unit_fk: number;
        activity_level: string;
        activity_level_description: string;
        activity_level_fk: number;
        weight_goal: string;
        weight_goal_fk: number;
        icon_location: string;
        created_at: string;
    };
}

const App: React.FC = () => {
    const theme = useTheme();

    const updateUser = useUpdateUser();
    const updateTheme = useUpdateTheme();

    const login = async (): Promise<void> => {
        try {
            let user: UserData = await axios.get(Config.apiUrl + "/auth/", {
                withCredentials: true,
            });

            updateUser(user.data);
            updateTheme(user.data.theme);
        } catch (err) {
            updateUser(false);
            updateTheme(0);
            document.cookie = "";
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
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Navbar />
                        <Switch>
                            <Route path="/" exact>
                                <Home />
                            </Route>
                            <PrivateRoute path="/nutrition">
                                <Nutrition />
                            </PrivateRoute>
                            <PrivateRoute path="/lifting">
                                <Lifting />
                            </PrivateRoute>
                            <PrivateRoute path="/bodyweight">
                                <Bodyweight />
                            </PrivateRoute>
                            <PrivateRoute path="/profile">
                                <Profile />
                            </PrivateRoute>
                            <PublicRoute path="/signup">
                                <Signup />
                            </PublicRoute>
                            <PublicRoute path="/login">
                                <Login title={"Log in here."} />
                            </PublicRoute>
                        </Switch>
                    </div>
                </Router>
            </div>
        </ThemeProvider>
    );
};

export default App;
