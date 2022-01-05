import { Dispatch, SetStateAction, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Config from "../Config";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import InputField from "../components/inputs/InputField";
import { useAppDispatch } from "../global/hooks";
import { loginUser, setTheme } from "../global/actions";
import { ErrorType, HTTPBasicResponse, getUserDataResponse } from "../global/globalTypes";

const PREFIX = "Login";
const classes = {
    inputField: `${PREFIX}-inputField`,
    wrapper: `${PREFIX}-wrapper`,
    btn: `${PREFIX}-btn`,
    linkStyle: `${PREFIX}-linkStyle`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.inputField}`]: {
        width: "100%",
    },
    [`& .${classes.wrapper}`]: {
        height: "80%",
    },
    [`& .${classes.btn}`]: {
        margin: "0 10px",
    },
    [`& .${classes.linkStyle}`]: {
        textDecoration: "none",
        color: theme.palette.secondary.main,
    },
}));

type Props = {
    title: string | null;
};

type LocationState = {
    from: {
        pathname: string;
    };
    title?: string;
};

const Login: React.FC<Props> = ({ title }) => {
    let history = useHistory();
    let location = useLocation<LocationState>();

    const dispatch = useAppDispatch();

    // Form Codes --> 0: initial, 1: loading
    const [formState, setFormState] = useState<number>(0);
    const [userField, setUserField] = useState<ErrorType>("");
    const [passField, setPassField] = useState<ErrorType>("");
    const [remember, setRemember] = useState<boolean>(false);

    const checkField = (field: ErrorType, setField: Dispatch<SetStateAction<ErrorType>>): boolean => {
        if (!field) {
            setField(false);
            return true;
        }
        return false;
    };

    const checkBoxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setRemember(event.target.checked);
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
            let response: { data: HTTPBasicResponse } = await axios.post(
                Config.apiUrl + "/auth/login/",
                {
                    user: userField,
                    pass: passField,
                    remember: remember,
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
                let user: getUserDataResponse = await axios.get(Config.apiUrl + "/auth/", {
                    withCredentials: true,
                });

                if (user.data.error) {
                    throw Error(user.data.error);
                } else if (user.data.user) {
                    dispatch(loginUser(user.data.user));
                    dispatch(setTheme(user.data.user.theme));

                    history.replace(from);
                } else {
                    throw Error("Error retrieving user");
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Root>
            <Grid
                container
                direction="row"
                alignItems="center"
                justifyContent="center"
                className={classes.wrapper}
                style={{
                    marginTop: "20px",
                }}
                onKeyPress={(e: any) => {
                    if (e.key === "Enter") {
                        login();
                    }
                }}
            >
                <Grid container item xs={3} alignItems="center" direction="column" justifyContent="center" spacing={2} style={{ height: "100%" }}>
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
                    <Grid item container direction="column" alignItems="flex-start" justifyContent="flex-start" spacing={0}>
                        <FormControlLabel
                            control={<Checkbox onChange={checkBoxChange} />}
                            label={
                                <Typography display="inline" variant="subtitle1" color="textSecondary">
                                    Remember Me
                                </Typography>
                            }
                        />
                        <Grid item container spacing={1}>
                            <Grid item>
                                <Typography display="inline" variant="subtitle1" color="textSecondary">
                                    Forgot Password?
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Link to="/reset" className={classes.linkStyle}>
                                    <Typography display="inline" variant="subtitle1" color="secondary">
                                        Click Here.
                                    </Typography>
                                </Link>
                            </Grid>
                        </Grid>
                    </Grid>
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
        </Root>
    );
};

export default Login;
