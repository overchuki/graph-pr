import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Link, useHistory } from "react-router-dom";
import Config from "../Config";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import DropdownField from "../components/DropdownField";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles/";
import InputField from "../components/InputField";
import InputFieldCheck from "../components/InputFieldCheck";
import { useAppDispatch } from "../global/hooks";
import { defaultThemeIdx } from "../global/reducer";
import { setDefaultTheme, setTheme } from "../global/actions";
import { ErrorType, HTTPBasicResponse, onChangeFuncNum } from "../global/globalTypes";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        inputField: {
            width: "100%",
        },
        textMain: {
            color: theme.palette.text.primary,
        },
        textSuccess: {
            color: theme.palette.success.main,
        },
        textError: {
            color: theme.palette.error.main,
        },
        wrapper: {
            minHeight: "650px",
            overflow: "auto",
        },
        btn: {
            margin: "0 10px",
        },
        btnWarning: {
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,

            "&:hover": {
                backgroundColor: theme.palette.warning.light,
            },
        },
    })
);

type ChangeFuncCustom = (
    confirmVal: string,
    passVal?: string,
    err?: boolean
) => { returnError: boolean; error: ErrorType; overwrite: boolean };

interface userDataSend {
    name: string;
    username: string;
    email: string | null;
    description: string | null;
    dob: string;
    height: number;
    height_unit_fk: number;
    gender_fk: number;
    bodyweight: number;
    bw_unit_fk: number;
    activity_level_fk: number;
    weight_goal_fk: number;
    password: string;
    icon_fk: number;
    theme: number;
    tz: string;
}

const Signup: React.FC = () => {
    // Form Codes -->  0: default, 1: in progress
    const classes = useStyles();
    const history = useHistory();

    const dispatch = useAppDispatch();

    const [generalError, setGeneralError] = useState<ErrorType>(false);
    const [formSubmission, setFormSubmission] = useState<number>(0);

    const [nameField, setNameField] = useState<ErrorType>("");

    const [usernameField, setUsernameField] = useState<ErrorType>("");

    const [emailField, setEmailField] = useState<ErrorType>("");

    const [dobField, setDobField] = useState<ErrorType>("");

    const [genderField, setGenderField] = useState<number>(0);

    const [heightField, setHeightField] = useState<ErrorType>("");
    const [heightUnitField, setHeightUnitField] = useState<number>(6);

    const [bodyweightField, setBodyweightField] = useState<ErrorType>("");
    const [bodyweightUnitField, setBodyweightUnitField] = useState<number>(2);

    const [activityLevelField, setActivityLevelField] = useState<number>(3);

    const [weightGoalField, setWeightGoalField] = useState<number>(4);

    const [iconField, setIconField] = useState<number>(1);

    const [themeField, setThemeField] = useState<number>(defaultThemeIdx);

    const [descriptionField, setDescriptionField] = useState<ErrorType>("");

    const [passwordField, setPasswordField] = useState<ErrorType>("");
    const [confirmPasswordField, setConfirmPasswordField] = useState<ErrorType>("");
    const [passwordMatchError, setPasswordMatchError] = useState<ErrorType>(false);

    useEffect(() => {
        return () => {
            dispatch(setDefaultTheme());
        };
    }, []);

    const handleConfirmPasswordFieldChange: ChangeFuncCustom = (confirmVal, passVal, err) => {
        let returnErr = err ? true : false;
        const compare = passVal || passwordField;

        if (confirmVal === compare) {
            setPasswordMatchError(false);
            return { returnError: returnErr, error: false, overwrite: returnErr };
        } else {
            setPasswordMatchError("Passwords do not match.");
            return { returnError: returnErr, error: "Passwords do not match.", overwrite: returnErr };
        }
    };

    const handleThemeChange: onChangeFuncNum = (value) => {
        dispatch(setTheme(value));
        return { returnError: false, error: false, overwrite: false };
    };

    const isFieldError = (field: ErrorType, setField: Dispatch<SetStateAction<ErrorType>>, required: boolean): boolean => {
        if (!field && required) {
            setField(false);
            return true;
        }
        return false;
    };

    const isFieldErrorNum = (field: number, setField: Dispatch<SetStateAction<number>>, required: boolean): boolean => {
        if (field === 0 && required) {
            setField(-1);
            return true;
        }
        return false;
    };

    const runFullCheck = (): boolean => {
        let errors: Array<ErrorType> = [];
        errors.push(isFieldError(nameField, setNameField, true));
        errors.push(isFieldError(dobField, setDobField, true));
        errors.push(isFieldErrorNum(genderField, setGenderField, true));
        errors.push(isFieldError(usernameField, setUsernameField, true));
        errors.push(isFieldError(emailField, setEmailField, false));
        errors.push(isFieldError(heightField, setHeightField, true));
        errors.push(isFieldError(bodyweightField, setBodyweightField, true));
        errors.push(isFieldError(descriptionField, setDescriptionField, false));
        errors.push(isFieldError(passwordField, setPasswordField, true));
        errors.push(isFieldError(confirmPasswordField, setConfirmPasswordField, true));
        for (let err of errors) if (err) return true;
        return false;
    };

    const signup = async (): Promise<void> => {
        setFormSubmission(1);
        setGeneralError(false);
        let errors: boolean = runFullCheck();
        if (errors) {
            setGeneralError("Please address all errors on screen.");
            setFormSubmission(0);
            return;
        }

        let userData: userDataSend = {
            name: (nameField + "").trim(),
            username: (usernameField + "").trim(),
            email: (emailField + "").trim() || null,
            description: (descriptionField + "").trim() || null,
            dob: (dobField + "").trim(),
            height: parseInt(heightField + ""),
            height_unit_fk: heightUnitField,
            gender_fk: genderField,
            bodyweight: parseInt(bodyweightField + ""),
            bw_unit_fk: bodyweightUnitField,
            activity_level_fk: activityLevelField,
            weight_goal_fk: weightGoalField,
            password: (passwordField + "").trim(),
            icon_fk: iconField,
            theme: themeField,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        try {
            let response: { data: HTTPBasicResponse } = await axios.post(Config.apiUrl + "/auth/signup/", userData, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (response.data.success) {
                history.replace("/login", { title: "Log in with your new credentials." });
            } else if (response.data.error) {
                setGeneralError("Server Error: " + response.data.error);
            } else {
                setGeneralError("Server Error: " + response);
            }
        } catch (err) {
            setFormSubmission(0);
            console.log(err);
        }
    };

    return (
        <Grid container direction="row" alignItems="center" justifyContent="center" className={classes.wrapper}>
            <Grid
                container
                item
                xs={12}
                sm={10}
                md={8}
                lg={6}
                alignItems="center"
                direction="column"
                justifyContent="center"
                spacing={2}
                style={{ height: "100%" }}
            >
                {/* Title */}
                <Grid item>
                    <Typography display="inline" variant="body1" className={generalError ? classes.textError : classes.textMain}>
                        {generalError ? generalError : "Account Information"}
                    </Typography>
                </Grid>

                {/* First row: Name, Birthday, Gender */}
                <Grid item container justifyContent="center" alignItems="center" className={classes.inputField}>
                    <InputField
                        label={"Name (2-20)"}
                        type={"text"}
                        defaultValue={""}
                        setValue={setNameField}
                        errorOverwrite={nameField === false ? "Please enter your name." : false}
                        autoComplete={"name"}
                        size={6}
                        position={1}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your name",
                            required: true,
                            range: [2, 20],
                            int: false,
                            email: false,
                            ascii: true,
                            dob: false,
                            alphaNum: false,
                        }}
                    />
                    <InputField
                        label={"Birthday (MM/DD/YYYY)"}
                        type={"text"}
                        defaultValue={""}
                        setValue={setDobField}
                        errorOverwrite={dobField === false ? "Invalid (MM/DD/YYYY)" : false}
                        autoComplete={"bdate"}
                        size={4}
                        position={0}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your dob",
                            required: true,
                            range: [10, 10],
                            int: false,
                            email: false,
                            ascii: true,
                            dob: true,
                            alphaNum: false,
                        }}
                    />
                    <DropdownField
                        label={"Gender"}
                        defaultValue={0}
                        setValue={setGenderField}
                        valuesArr={[
                            [0, "-Select-"],
                            [1, "Male"],
                            [2, "Female"],
                        ]}
                        size={2}
                        position={2}
                        errorOverwrite={genderField === -1 ? true : false}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your gender",
                            required: true,
                            range: [1, 2],
                            int: true,
                            email: false,
                            ascii: false,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                </Grid>

                {/* Second row: Username, Email */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <InputFieldCheck
                        label={"Username (1-20)"}
                        autoComplete={"username"}
                        type={"text"}
                        defaultValue={""}
                        setValue={setUsernameField}
                        size={6}
                        position={1}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your username",
                            required: true,
                            range: [4, 20],
                            int: false,
                            email: false,
                            ascii: true,
                            dob: false,
                            alphaNum: true,
                        }}
                        checkType={"username"}
                    />
                    <InputFieldCheck
                        label={"Email (optional)"}
                        autoComplete={"email"}
                        type={"text"}
                        defaultValue={""}
                        setValue={setEmailField}
                        size={6}
                        position={2}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your email",
                            required: false,
                            range: [1, 256],
                            int: false,
                            email: true,
                            ascii: true,
                            dob: false,
                            alphaNum: false,
                        }}
                        checkType={"email"}
                    />
                </Grid>

                {/* Third Row: Height, Weight */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <InputField
                        label={"Height"}
                        type={"number"}
                        defaultValue={""}
                        setValue={setHeightField}
                        errorOverwrite={heightField === false ? "Please enter your height." : false}
                        autoComplete={""}
                        size={4}
                        position={1}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your height",
                            required: true,
                            range: [1, 300],
                            int: true,
                            email: false,
                            ascii: true,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                    <DropdownField
                        label={"Height Unit"}
                        defaultValue={6}
                        setValue={setHeightUnitField}
                        valuesArr={[
                            [6, "In"],
                            [5, "Cm"],
                        ]}
                        size={2}
                        position={0}
                        errorOverwrite={false}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your height unit",
                            required: true,
                            range: [5, 6],
                            int: true,
                            email: false,
                            ascii: false,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                    <InputField
                        label={"Bodyweight"}
                        type={"number"}
                        defaultValue={""}
                        setValue={setBodyweightField}
                        errorOverwrite={bodyweightField === false ? "Please enter your weight." : false}
                        autoComplete={""}
                        size={4}
                        position={0}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your bodyweight",
                            required: true,
                            range: [1, 2000],
                            int: true,
                            email: false,
                            ascii: true,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                    <DropdownField
                        label={"Weight Unit"}
                        defaultValue={2}
                        setValue={setBodyweightUnitField}
                        valuesArr={[
                            [2, "Lb"],
                            [1, "Kg"],
                        ]}
                        size={2}
                        position={2}
                        errorOverwrite={false}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your weight unit",
                            required: true,
                            range: [1, 2],
                            int: true,
                            email: false,
                            ascii: false,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                </Grid>

                {/* Fourth Row: Activity Level */}
                <DropdownField
                    label={"Activity Level"}
                    defaultValue={3}
                    setValue={setActivityLevelField}
                    valuesArr={[
                        [1, "Sedetary: Little to no exercise."],
                        [2, "Lightly Active: Light exercise / sports 1-3 days a week."],
                        [3, "Moderately Active: Moderate exercise / 3-5 days a week."],
                        [4, "Very Active: Hard exercise / sports 6-7 days a week."],
                        [5, "Extra Active: Very hard exercise / sports and physical job or 2x training."],
                    ]}
                    size={false}
                    position={-1}
                    errorOverwrite={false}
                    disabled={false}
                    verify={false}
                    verifyObj={{
                        name: "your activity level",
                        required: true,
                        range: [1, 5],
                        int: true,
                        email: false,
                        ascii: false,
                        dob: false,
                        alphaNum: true,
                    }}
                />

                {/* Fourth Row: Weight Goal Level, Theme, Icon */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <DropdownField
                        label={"Weight Goal"}
                        defaultValue={4}
                        setValue={setWeightGoalField}
                        valuesArr={[
                            [1, "Extreme Loss (2lb / .9kg a week)"],
                            [2, "Regular Loss (1lb / .45kg a week)"],
                            [3, "Mild Loss (0.5lb / .225kg a week)"],
                            [4, "Maintenance (No change)"],
                            [5, "Mild Gain (0.5lb / .225kg a week)"],
                            [6, "Regular Gain (1lb / .45kg a week)"],
                            [7, "Extreme Gain (2lb / .9kg a week)"],
                        ]}
                        size={6}
                        position={1}
                        errorOverwrite={false}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your weight goal",
                            required: true,
                            range: [1, 7],
                            int: true,
                            email: false,
                            ascii: false,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                    <DropdownField
                        label={"Theme"}
                        defaultValue={1}
                        setValue={setThemeField}
                        onChange={handleThemeChange}
                        valuesArr={[
                            [1, "Dark"],
                            [0, "Light"],
                            [2, "Red"],
                        ]}
                        size={3}
                        position={0}
                        errorOverwrite={false}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your theme",
                            required: true,
                            range: [0, 2],
                            int: true,
                            email: false,
                            ascii: false,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                    <DropdownField
                        label={"Icon"}
                        defaultValue={1}
                        setValue={setIconField}
                        valuesArr={[[1, "Default"]]}
                        size={3}
                        position={2}
                        errorOverwrite={false}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your icon",
                            required: true,
                            range: [1, 1],
                            int: true,
                            email: false,
                            ascii: false,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                </Grid>

                {/* Fifth Row: Description */}
                <InputField
                    label={"Description (1-100) (optional)"}
                    type={"text"}
                    defaultValue={""}
                    setValue={setDescriptionField}
                    errorOverwrite={false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
                    verify={true}
                    verifyObj={{
                        name: "your description",
                        required: false,
                        range: [1, 100],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: false,
                    }}
                />

                {/* Sixth Row: Password */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <InputField
                        label={"Password (8-256)"}
                        type={"password"}
                        defaultValue={""}
                        setValue={setPasswordField}
                        onChange={(val) => {
                            return handleConfirmPasswordFieldChange(confirmPasswordField + "", val, false);
                        }}
                        errorOverwrite={passwordField === false ? "Please enter your password." : false}
                        autoComplete={""}
                        size={6}
                        position={1}
                        disabled={false}
                        verify={true}
                        verifyObj={{
                            name: "your password",
                            required: true,
                            range: [8, 256],
                            int: false,
                            email: false,
                            ascii: true,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                    <InputField
                        label={"Confirm Password"}
                        type={"password"}
                        defaultValue={""}
                        setValue={setConfirmPasswordField}
                        keyChange={(keyString) => {
                            if (keyString === "Enter") signup();
                        }}
                        onChange={(val) => {
                            return handleConfirmPasswordFieldChange(val, undefined, true);
                        }}
                        errorOverwrite={passwordMatchError ? passwordMatchError : false}
                        autoComplete={""}
                        size={6}
                        position={2}
                        disabled={false}
                        verify={false}
                        verifyObj={{
                            name: "your confirmation password",
                            required: true,
                            range: [8, 256],
                            int: false,
                            email: false,
                            ascii: true,
                            dob: false,
                            alphaNum: true,
                        }}
                    />
                </Grid>

                {/* Seventh Row: Buttons */}
                <Grid item container alignItems="center" justifyContent="center">
                    {formSubmission === 0 ? (
                        <>
                            <Grid item className={classes.btn}>
                                <Link to="/" style={{ textDecoration: "none" }}>
                                    <Button variant="outlined" color="secondary">
                                        Go Back
                                    </Button>
                                </Link>
                            </Grid>
                            <Grid item className={classes.btn}>
                                <Button onClick={signup} variant="contained" color="primary">
                                    Create Account
                                </Button>
                            </Grid>
                        </>
                    ) : (
                        <CircularProgress color="primary" />
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Signup;
