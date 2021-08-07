import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
    })
);

interface Props {
    title: string | null;
}

interface Response {
    data: {
        success: string;
        error: string;
    };
}

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

        error: string;
    };
}

const Login: React.FC<Props> = ({ title }) => {
    const updateTheme = useUpdateTheme();
    const updateUser = useUpdateUser();

    const [userError, setUserError] = useState<string | boolean>(false);
    const [passError, setPassError] = useState<string | boolean>(false);

    const [userField, setUserField] = useState<string>("");
    const [passField, setPassField] = useState<string>("");

    let classes = useStyles();
    let history = useHistory();
    let location: any = useLocation();

    const login = async (): Promise<void> => {
        setUserError(false);
        setPassError(false);

        let validUser: boolean = isAscii(userField);
        let validPass: boolean = isAscii(passField);

        if (!validUser) setUserError("Invalid username");
        if (!validPass) setPassError("Invalid password");

        let curTZ: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let { from }: { from: { pathname: string } } = location.state ? location.state : { from: { pathname: "/" } };
        try {
            let response: Response = await axios.post(
                Config.apiUrl + "/auth/login/",
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

            if (response.data.error) {
                let err: string = response.data.error;
                if (err.toLowerCase().includes("user")) {
                    setUserError(err);
                } else if (err.toLowerCase().includes("pass")) {
                    setPassError(err);
                } else {
                    console.log("Unknown Server Error: " + err);
                }
            } else {
                let user: UserData = await axios.get(Config.apiUrl + "/auth/", {
                    withCredentials: true,
                });
                if (user.data.error) console.log(user.data.error);
                else {
                    updateUser(user.data);
                    updateTheme(user.data.theme);
                    history.replace(from);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
            className={classes.wrapper}
            onKeyPress={(e) => {
                if (e.key === "Enter") {
                    login();
                }
            }}
        >
            <Grid
                container
                item
                xs={3}
                alignItems="center"
                direction="column"
                justifyContent="center"
                spacing={3}
                style={{ height: "100%" }}
            >
                <Grid item>
                    <Typography display="inline" variant="body1" color="textPrimary">
                        {location.state ? location.state.title : title}
                    </Typography>
                </Grid>
                <InputField
                    label={userError ? userError + "" : "Username or Email"}
                    type={"text"}
                    value={userField}
                    onChange={setUserField}
                    error={userError ? true : false}
                    autoComplete={"username email"}
                    size={false}
                    position={-1}
                    disabled={false}
                />
                <InputField
                    label={passError ? passError + "" : "Password"}
                    type={"password"}
                    value={passField}
                    onChange={setPassField}
                    error={passError ? true : false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
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
};

export default Login;
