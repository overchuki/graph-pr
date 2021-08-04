import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useState } from "react";
import { useUpdateUser } from "../contexts/UserContext";
import { useUpdateTheme } from "../contexts/ThemeContext";
import isAscii from "validator/lib/isAscii";
import Config from "../Config";
import axios from "axios";
import InputField from "../components/InputField";

const useStyles = makeStyles((theme) => ({
    inputField: {
        width: "100%",
    },
    wrapper: {
        height: "80%",
    },
    btn: {
        margin: "0 10px",
    },
    linkStyle: {
        textDecoration: "none",
        color: theme.palette.secondary.main,
    },
}));

function Login({ title }) {
    const updateTheme = useUpdateTheme();
    const updateUser = useUpdateUser();

    const [userError, setUserError] = useState(false);
    const [passError, setPassError] = useState(false);

    const [userField, setUserField] = useState("");
    const [passField, setPassField] = useState("");

    let classes = useStyles();
    let history = useHistory();
    let location = useLocation();

    const { from } = location.state || { from: { pathname: "/" } };
    const login = async () => {
        setUserError(false);
        setPassError(false);

        let validUser = isAscii(userField);
        let validPass = isAscii(passField);

        if (!validUser) setUserError("Invalid username");
        if (!validPass) setPassError("Invalid password");

        let curTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let response = await axios.post(
            Config.apiURL + "/auth/login/",
            {
                user: userField,
                pass: passField,
                tz: curTZ,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );
        response = response.data;

        if (response.success) {
            let user = await axios.get(Config.apiURL + "/auth/", {
                withCredentials: true,
            });
            user = user.data;

            updateUser(user);
            updateTheme(user.theme);
            history.replace(from);
        } else {
            let err = response.error;
            if (err.toLowerCase().includes("user")) {
                setUserError(err);
            } else if (err.toLowerCase().includes("pass")) {
                setPassError(err);
            } else {
                console.log("Unknown Server Error: " + err);
            }
        }
    };

    return (
        <Grid container direction="row" alignItems="center" justifyContent="center" className={classes.wrapper}>
            <Grid container item xs={3} alignItems="center" direction="column" justifyContent="center" spacing={3} style={{ height: "100%" }}>
                <Grid item>
                    <Typography display="inline" variant="body1" color="textPrimary">
                        {location.state ? location.state.title : title}
                    </Typography>
                </Grid>
                <InputField
                    label={userError ? userError : "Username or Email"}
                    type={"text"}
                    value={userField}
                    onChange={setUserField}
                    error={userError ? true : false}
                    autoComplete={"username email"}
                    size={false}
                    position={-1}
                />
                <InputField
                    label={passError ? passError : "Password"}
                    type={"password"}
                    value={passField}
                    onChange={setPassField}
                    error={passError ? true : false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                />
                <Grid item container alignItems="center" justifyContent="center">
                    <Grid item className={classes.btn}>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <Button variant="outlined" color="secondary">
                                Cancel
                            </Button>
                        </Link>
                    </Grid>
                    <Grid item className={classes.btn}>
                        <Button onClick={login} variant="contained" color="primary">
                            Log In
                        </Button>
                    </Grid>
                </Grid>

                <Grid item container alignItems="center" justifyContent="center" spacing={1}>
                    <Grid item>
                        <Typography display="inline" variant="subtitle1" color="textSecondary">
                            Don't have an account?
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Link to="/signup" className={classes.linkStyle}>
                            <Typography display="inline" variant="subtitle1" color="secondary">
                                Create one
                            </Typography>
                        </Link>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default Login;
