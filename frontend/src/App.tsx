import { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { themes } from "./global/themes";
import axios from "axios";
import Config from "./Config";
import Home from "./views/Home";
import Signup from "./views/Signup";
import Login from "./views/Login";
import Nutrition from "./views/Nutrition";
import Lifting from "./views/Lifting";
import Bodyweight from "./views/Bodyweight";
import Meals from "./views/Meals";
import Profile from "./views/Profile";
import Reset from "./views/Reset";
import Navbar from "./components/Navbar";
import CustomRoute from "./components/CustomRoute";
import store, { RootState } from "./global/store";
import { useAppDispatch, useAppSelector } from "./global/hooks";
import { getUserDataResponse } from "./global/globalTypes";
import { loginUser, logoutUser, setTheme, setDefaultTheme } from "./global/actions";

const App: React.FC = () => {
    const themeIdx = useAppSelector((state: RootState) => state.theme);
    const dispatch = useAppDispatch();

    const login = async (): Promise<void> => {
        try {
            if (store.getState().user) return;

            let user: getUserDataResponse = await axios.get(Config.apiUrl + "/auth/", {
                withCredentials: true,
            });

            if (user.data.error) {
                throw Error(user.data.error);
            } else if (user.data.user) {
                dispatch(loginUser(user.data.user));
                dispatch(setTheme(user.data.user.theme));
            } else {
                throw Error("Unknown Error");
            }
        } catch (err) {
            dispatch(logoutUser());
            dispatch(setDefaultTheme());
            document.cookie = "";
        }
    };

    useEffect(() => {
        if (document.cookie.includes("user=jwtexists")) login();
    }, []);

    document.body.style.background = themes[themeIdx].palette.background.default;

    return (
        <ThemeProvider theme={themes[themeIdx]}>
            <Router>
                <Navbar />
                <Switch>
                    <Route path="/" exact>
                        <Home />
                    </Route>
                    <CustomRoute path="/nutrition" privateRoute={true}>
                        <Nutrition />
                    </CustomRoute>
                    <CustomRoute path="/meals" privateRoute={true}>
                        <Meals />
                    </CustomRoute>
                    <CustomRoute path="/lifting" privateRoute={true}>
                        <Lifting />
                    </CustomRoute>
                    <CustomRoute path="/bodyweight" privateRoute={true}>
                        <Bodyweight />
                    </CustomRoute>
                    <CustomRoute path="/profile" privateRoute={true}>
                        <Profile />
                    </CustomRoute>
                    <CustomRoute path="/signup" privateRoute={false}>
                        <Signup />
                    </CustomRoute>
                    <CustomRoute path="/login" privateRoute={false}>
                        <Login title={"Log in here."} />
                    </CustomRoute>
                    <CustomRoute path="/reset" privateRoute={false}>
                        <Reset />
                    </CustomRoute>
                </Switch>
            </Router>
        </ThemeProvider>
    );
};

export default App;
