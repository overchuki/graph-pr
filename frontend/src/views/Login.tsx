import Grid from "@material-ui/core/Grid";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Dispatch, SetStateAction, useState } from "react";
import { useUpdateUser } from "../contexts/UserContext";
import { useUpdateTheme } from "../contexts/ThemeContext";
import Config from "../Config";
import axios from "axios";
import InputField from "../components/InputField";
import CircularProgress from "@material-ui/core/CircularProgress";

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

type ErrorType = string | boolean;

interface Props {
    title: string | null;
}

interface LocationState {
    from: {
        pathname: string;
    };
    title?: string;
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

        error?: string;
    };
}

const Login: React.FC<Props> = ({ title }) => {
    let classes = useStyles();
    let history = useHistory();
    let location = useLocation<LocationState>();

    const updateTheme = useUpdateTheme();
    const updateUser = useUpdateUser();

    // Form Codes --> 0: initial, 1: loading
    const [formState, setFormState] = useState<number>(0);
    const [userField, setUserField] = useState<ErrorType>("");
    const [passField, setPassField] = useState<ErrorType>("");

    const checkField = (field: ErrorType, setField: Dispatch<SetStateAction<ErrorType>>): boolean => {
        if (!field) {
            setField(false);
            return true;
        }
        return false;
    };

    const login = async (): Promise<void> => {
        setFormState(1);
        let err = checkField(userField, setUserField);
        err = checkField(passField, setPassField);

        if (err) {
            setFormState(0);
            return;
        }

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
                    setUserField(false);
                } else if (err.toLowerCase().includes("pass")) {
                    setPassField(false);
                } else {
                    console.log("Unknown Server Error: " + err);
                }
                setFormState(0);
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
            style={{
                marginTop: "20px",
            }}
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
                    label={"Username or Email"}
                    type={"text"}
                    defaultValue={""}
                    setValue={setUserField}
                    errorOverwrite={userField === false ? "Invalid username" : false}
                    autoComplete={"username email"}
                    size={false}
                    position={-1}
                    disabled={false}
                    verify={true}
                    verifyObj={{
                        name: "your username",
                        required: true,
                        range: [0, 256],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: true,
                    }}
                />
                <InputField
                    label={"Password"}
                    type={"password"}
                    defaultValue={""}
                    setValue={setPassField}
                    errorOverwrite={passField === false ? "Invalid password" : false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
                    verify={true}
                    verifyObj={{
                        name: "your password",
                        required: true,
                        range: [0, 256],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: true,
                    }}
                />
                <Grid item container alignItems="center" justifyContent="center">
                    {formState === 0 ? (
                        <>
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
                        </>
                    ) : (
                        <CircularProgress color="secondary" />
                    )}
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
