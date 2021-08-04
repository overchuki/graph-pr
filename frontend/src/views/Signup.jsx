import Grid from "@material-ui/core/Grid";
import Config from "../Config";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputField from "../components/InputField";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import DropdownField from "../components/DropdownField";
import { useUpdateTheme, useDefaultTheme } from "../contexts/ThemeContext";
import axios from "axios";
import validator from "validator";

const useStyles = makeStyles((theme) => ({
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
        height: "90%",
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
}));

const Signup = () => {
    // Availability Codes -->  -1: invalid, 0: blank, 1: loading, 2: available, 3: taken
    // Form Codes -->  0: default, 1: in progress
    const classes = useStyles();

    const defaultTheme = useDefaultTheme();
    const updateTheme = useUpdateTheme();
    const [generalError, setGeneralError] = useState(false);
    const [formSubmission, setFormSubmission] = useState(0);

    const [nameField, setNameField] = useState("");
    const [nameFieldError, setNameFieldError] = useState(false);

    const [usernameField, setUsernameField] = useState("");
    const [usernameFieldError, setUsernameFieldError] = useState(false);
    const [checkedUsernames, setCheckedUsernames] = useState([[], []]);
    const [usernameFieldAvailability, setUsernameFieldAvailability] = useState(-1);

    const [emailField, setEmailField] = useState("");
    const [emailFieldError, setEmailFieldError] = useState(false);
    const [checkedEmails, setCheckedEmails] = useState([[], []]);
    const [emailFieldAvailability, setEmailFieldAvailability] = useState(-1);

    const [dobField, setDobField] = useState("");
    const [dobFieldError, setDobFieldError] = useState(false);

    const [genderField, setGenderField] = useState(0);

    const [heightField, setHeightField] = useState("");
    const [heightFieldError, setHeightFieldError] = useState(false);
    const [heightUnitField, setHeightUnitField] = useState(0);

    const [bodyweightField, setBodyweightField] = useState("");
    const [bodyweightFieldError, setBodyweightFieldError] = useState(false);
    const [bodyweightUnitField, setBodyweightUnitField] = useState(0);

    const [activityLevelField, setActivityLevelField] = useState(0);

    const [weightGoalField, setWeightGoalField] = useState(0);

    const [iconField, setIconField] = useState(1);

    const [themeField, setThemeField] = useState(defaultTheme);

    const [descriptionField, setDescriptionField] = useState("");
    const [descriptionFieldError, setDescriptionFieldError] = useState(false);

    const [passwordField, setPasswordField] = useState("");
    const [passwordFieldError, setPasswordFieldError] = useState(false);
    const [confirmPasswordField, setConfirmPasswordField] = useState("");
    const [confirmPasswordFieldError, setConfirmPasswordFieldError] = useState(false);

    useEffect(() => {
        return () => {
            updateTheme(defaultTheme);
        };
    }, []);

    const handleThemeChange = (value) => {
        setThemeField(value);
        updateTheme(value);
    };

    const handleUsernameChange = (value) => {
        setUsernameField(value);
        let err = basicVerify("a username", false, value, true, [4, 20], false, true, setUsernameFieldError);
        if (err) {
            setUsernameFieldAvailability(-1);
            return;
        }

        if (checkedUsernames[0].includes(value)) setUsernameFieldAvailability(2);
        else if (checkedUsernames[1].includes(value)) setUsernameFieldAvailability(3);
        else setUsernameFieldAvailability(0);
    };

    const handleUsernameCheck = async () => {
        setUsernameFieldAvailability(1);
        let available = await checkAvailable(usernameField, "username");

        if (available.error) {
            setUsernameFieldAvailability(0);
            return;
        }

        if (available) {
            setCheckedUsernames([[...checkedUsernames[0], usernameField], checkedUsernames[1]]);
            setUsernameFieldAvailability(2);
        } else {
            setCheckedUsernames([checkedUsernames[0], [...checkedUsernames[1], usernameField]]);
            setUsernameFieldAvailability(3);
        }
    };

    const handleEmailChange = (value) => {
        setEmailField(value);
        let err = basicVerify("an email", false, value, false, [1, 256], true, true, setEmailFieldError);
        if (err) {
            setEmailFieldAvailability(-1);
            return;
        }

        if (checkedEmails[0].includes(value)) {
            setEmailFieldAvailability(2);
            setEmailFieldError(false);
        } else if (checkedEmails[1].includes(value)) {
            setEmailFieldAvailability(3);
            setEmailFieldError("Username unavailable.");
        } else {
            setEmailFieldAvailability(0);
            setEmailFieldError(false);
        }
    };

    const handleEmailCheck = async () => {
        setEmailFieldAvailability(1);
        let available = await checkAvailable(emailField, "email");

        if (available.error) {
            setEmailFieldAvailability(0);
            return;
        }

        if (available) {
            setCheckedEmails([[...checkedEmails[0], emailField], checkedEmails[1]]);
            setEmailFieldAvailability(2);
        } else {
            setCheckedEmails([checkedEmails[0], [...checkedEmails[1], emailField]]);
            setEmailFieldAvailability(3);
        }
    };

    const checkAvailable = async (value, type) => {
        let response = await axios.get(Config.apiURL + `/auth/exists/?type=${type}&str=${value}`);
        setGeneralError(false);
        if (response.data.error) {
            setGeneralError("Server error: " + response.data.error);
            return response.data;
        }
        return response.data.available;
    };

    const handleConfirmPasswordFieldChange = (value) => {
        // validate passwords are same
    };

    const handleDobFieldChange = (value) => {
        // validate birthdate and reformat
    };

    const basicVerify = (name, int, value, required, range, email, ascii, setError) => {
        let error = false;

        if (!value) {
            if (required) error = `Please enter ${name}.`;
            else error = "skip";
        }

        name = name.split(" ")[1];
        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (!error && email && !validator.isEmail(value)) error = `${name} is invalid.`;
        if (!error && ascii && !validator.isAscii(value)) error = `${name} is invalid.`;

        if (!error && ((!int && value.length < range[0]) || (int && value < range[0])))
            error = `${name} is too ${int ? "small" : "short"}.`;
        if (!error && ((!int && value.length > range[1]) || (int && value > range[1])))
            error = `${name} is too ${int ? "large" : "long"}.`;

        if (error === "skip") return false;

        setError(error);

        return error;
    };

    const checkErrors = () => {
        if (
            generalError ||
            nameFieldError ||
            dobFieldError ||
            usernameFieldError ||
            emailFieldError ||
            heightFieldError ||
            bodyweightFieldError ||
            descriptionFieldError ||
            passwordFieldError ||
            confirmPasswordFieldError
        ) {
            return true;
        }
        return false;
    };

    const signup = async () => {
        // TODO: verify everything on click, finish handler functions
        let errors = checkErrors();
        console.log(errors);
        if (errors || usernameFieldAvailability !== 2 || (emailFieldAvailability !== 2 && emailField)) {
            console.log("err");
            return;
        }

        let userData = {};

        // send singup request
        //   sucess: redirect to login, title: "Log in with your new credentials."
        //   error: find it with includes and set appropriate field
        //          fallback to general error
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
                        {generalError ? generalError : "Account Information (Spaces will be deleted)"}
                    </Typography>
                </Grid>

                {/* First row: Name, Birthday, Gender */}
                <Grid item container justifyContent="center" alignItems="center" className={classes.inputField}>
                    <InputField
                        label={nameFieldError ? nameFieldError : "Name (2-20)"}
                        type={"text"}
                        value={nameField}
                        onChange={(val) => {
                            setNameField(val);
                            basicVerify("your name", false, val, true, [2, 20], false, true, setNameFieldError);
                        }}
                        error={nameFieldError ? true : false}
                        autoComplete={"name"}
                        size={6}
                        position={1}
                        disabled={false}
                    />
                    <InputField
                        label={dobFieldError ? dobFieldError : "Birthday (MM/DD/YYYY)"}
                        type={"text"}
                        value={dobField}
                        onChange={handleDobFieldChange}
                        error={dobFieldError ? true : false}
                        autoComplete={"bdate"}
                        size={4}
                        position={0}
                        disabled={false}
                    />
                    <DropdownField
                        label={"Gender"}
                        value={genderField}
                        onChange={setGenderField}
                        valuesArr={[
                            [0, "-Select-"],
                            [1, "Male"],
                            [2, "Female"],
                        ]}
                        size={2}
                        position={2}
                    />
                </Grid>

                {/* Second row: Username, Email */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <Grid
                        item
                        container
                        xs={6}
                        justifyContent="center"
                        alignItems="center"
                        className={classes.inputField}
                        style={{
                            padding: "0 10px 0 0",
                        }}
                    >
                        <InputField
                            label={usernameFieldError ? usernameFieldError : "Username (4-20)"}
                            type={"text"}
                            value={usernameField}
                            onChange={handleUsernameChange}
                            error={usernameFieldError ? true : false}
                            autoComplete={"username"}
                            size={9}
                            position={1}
                            disabled={usernameFieldAvailability === 1}
                        />
                        <Grid
                            item
                            container
                            xs={3}
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            className={classes.inputField}
                            style={{ padding: "0 20px 0 0" }}
                        >
                            {usernameFieldAvailability === 0 || usernameFieldAvailability === -1 ? (
                                <Button
                                    onClick={handleUsernameCheck}
                                    variant="contained"
                                    className={classes.btnWarning}
                                    disabled={usernameFieldAvailability === -1}
                                >
                                    Check
                                </Button>
                            ) : (
                                ""
                            )}
                            {usernameFieldAvailability === 1 ? <CircularProgress color="secondary" /> : ""}
                            {usernameFieldAvailability === 2 ? <CheckIcon className={classes.textSuccess} /> : ""}
                            {usernameFieldAvailability === 3 ? <ClearIcon className={classes.textError} /> : ""}
                            <Typography
                                display="inline"
                                variant="body1"
                                className={usernameFieldAvailability === 3 ? classes.textError : classes.textSuccess}
                            >
                                {usernameFieldAvailability === 2 ? "Available" : ""}
                                {usernameFieldAvailability === 3 ? "Taken" : ""}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid
                        item
                        container
                        xs={6}
                        justifyContent="center"
                        alignItems="center"
                        className={classes.inputField}
                        style={{
                            padding: "0 0 0 10px",
                        }}
                    >
                        <InputField
                            label={emailFieldError ? emailFieldError : "Email (optional)"}
                            type={"text"}
                            value={emailField}
                            onChange={handleEmailChange}
                            error={emailFieldError ? true : false}
                            autoComplete={"email"}
                            size={9}
                            position={1}
                            disabled={emailFieldAvailability === 1}
                        />
                        <Grid
                            item
                            container
                            xs={3}
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            className={classes.inputField}
                            style={{ padding: "0 20px 0 0" }}
                        >
                            {emailFieldAvailability === 0 || emailFieldAvailability === -1 ? (
                                <Button
                                    onClick={handleEmailCheck}
                                    variant="contained"
                                    className={classes.btnWarning}
                                    disabled={emailFieldAvailability === -1}
                                >
                                    Check
                                </Button>
                            ) : (
                                ""
                            )}
                            {emailFieldAvailability === 1 ? <CircularProgress color="secondary" /> : ""}
                            {emailFieldAvailability === 2 ? <CheckIcon className={classes.textSuccess} /> : ""}
                            {emailFieldAvailability === 3 ? <ClearIcon className={classes.textError} /> : ""}
                            <Typography
                                display="inline"
                                variant="body1"
                                className={emailFieldAvailability === 3 ? classes.textError : classes.textSuccess}
                            >
                                {emailFieldAvailability === 2 ? "Available" : ""}
                                {emailFieldAvailability === 3 ? "Taken" : ""}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Third Row: Height, Weight */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <InputField
                        label={heightFieldError ? heightFieldError : "Height"}
                        type={"number"}
                        value={heightField}
                        onChange={(val) => {
                            setHeightField(val);
                            basicVerify("your height", true, val, true, [1, 300], false, true, setHeightFieldError);
                        }}
                        error={heightFieldError ? true : false}
                        autoComplete={""}
                        size={4}
                        position={1}
                        disabled={false}
                    />
                    <DropdownField
                        label={"Height Unit"}
                        value={heightUnitField}
                        onChange={setHeightUnitField}
                        valuesArr={[
                            [0, "-Select-"],
                            [5, "Cm"],
                            [6, "In"],
                        ]}
                        size={2}
                        position={0}
                    />
                    <InputField
                        label={bodyweightFieldError ? bodyweightFieldError : "Bodyweight"}
                        type={"number"}
                        value={bodyweightField}
                        onChange={(val) => {
                            setBodyweightField(val);
                            basicVerify("your bodyweight", true, val, true, [1, 2000], false, true, setBodyweightFieldError);
                        }}
                        error={bodyweightFieldError ? true : false}
                        autoComplete={""}
                        size={4}
                        position={0}
                        disabled={false}
                    />
                    <DropdownField
                        label={"Weight Unit"}
                        value={bodyweightUnitField}
                        onChange={setBodyweightUnitField}
                        valuesArr={[
                            [0, "-Select-"],
                            [1, "Kg"],
                            [2, "Lb"],
                        ]}
                        size={2}
                        position={2}
                    />
                </Grid>

                {/* Fourth Row: Activity Level */}
                <DropdownField
                    label={"Activity Level"}
                    value={activityLevelField}
                    onChange={setActivityLevelField}
                    valuesArr={[
                        [0, "-Select-"],
                        [1, "Sedetary: Little to no exercise."],
                        [2, "Lightly Active: Light exercise / sports 1-3 days a week."],
                        [3, "Moderately Active: Moderate exercise / 3-5 days a week."],
                        [4, "Very Active: Hard exercise / sports 6-7 days a week."],
                        [5, "Extra Active: Very hard exercise / sports and physical job or 2x training."],
                    ]}
                    size={false}
                    position={-1}
                />

                {/* Fourth Row: Weight Goal Level, Theme, Icon */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <DropdownField
                        label={"Weight Goal"}
                        value={weightGoalField}
                        onChange={setWeightGoalField}
                        valuesArr={[
                            [0, "-Select-"],
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
                    />
                    <DropdownField
                        label={"Theme"}
                        value={themeField}
                        onChange={handleThemeChange}
                        valuesArr={[
                            [0, "Light"],
                            [1, "Dark"],
                            [2, "Red"],
                        ]}
                        size={3}
                        position={0}
                    />
                    <DropdownField
                        label={"Icon"}
                        value={iconField}
                        onChange={setIconField}
                        valuesArr={[[1, "Default"]]}
                        size={3}
                        position={2}
                    />
                </Grid>

                {/* Fifth Row: Description */}
                <InputField
                    label={descriptionFieldError ? descriptionFieldError : "Description (1-100) (optional)"}
                    type={"text"}
                    value={descriptionField}
                    onChange={(val) => {
                        setDescriptionField(val);
                        basicVerify("your description", false, val, false, [1, 100], false, true, setDescriptionFieldError);
                    }}
                    error={descriptionFieldError ? true : false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
                />

                {/* Sixth Row: Password */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <InputField
                        label={passwordFieldError ? passwordFieldError : "Password (8-256)"}
                        type={"password"}
                        value={passwordField}
                        onChange={(val) => {
                            setPasswordField(val);
                            basicVerify("your password", false, val, true, [8, 256], false, true, setPasswordFieldError);
                        }}
                        error={passwordFieldError ? true : false}
                        autoComplete={""}
                        size={6}
                        position={1}
                        disabled={false}
                    />
                    <InputField
                        label={confirmPasswordFieldError ? confirmPasswordFieldError : "Confirm Password"}
                        type={"password"}
                        value={confirmPasswordField}
                        onChange={handleConfirmPasswordFieldChange}
                        error={confirmPasswordFieldError ? true : false}
                        autoComplete={""}
                        size={6}
                        position={2}
                        disabled={false}
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
