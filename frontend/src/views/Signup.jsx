import Grid from "@material-ui/core/Grid";
import Config from "../Config";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputField from "../components/InputField";
import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
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
    const history = useHistory();

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
    const [dobFieldFormatted, setDobFieldFormatted] = useState("");
    const [dobFieldError, setDobFieldError] = useState(false);

    const [genderField, setGenderField] = useState(0);
    const [genderFieldError, setGenderFieldError] = useState(false);

    const [heightField, setHeightField] = useState("");
    const [heightFieldError, setHeightFieldError] = useState(false);
    const [heightUnitField, setHeightUnitField] = useState(6);

    const [bodyweightField, setBodyweightField] = useState("");
    const [bodyweightFieldError, setBodyweightFieldError] = useState(false);
    const [bodyweightUnitField, setBodyweightUnitField] = useState(2);

    const [activityLevelField, setActivityLevelField] = useState(3);

    const [weightGoalField, setWeightGoalField] = useState(4);

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

    const setFieldError = (error, setError) => {
        setError(error);
        return;
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

    const handleThemeChange = (value) => {
        setThemeField(value);
        updateTheme(value);
    };

    const handleUsernameFieldChange = (value) => {
        setUsernameField(value);
        let err = basicVerify("a username", false, value, true, [4, 20], false, true, setUsernameFieldError);
        if (err) {
            setUsernameFieldAvailability(-1);
            return true;
        }

        if (checkedUsernames[0].includes(value)) {
            setUsernameFieldAvailability(2);
            setUsernameFieldError(false);
            return false;
        } else if (checkedUsernames[1].includes(value)) {
            setUsernameFieldAvailability(3);
            setUsernameFieldError("Username in use.");
            return true;
        } else {
            setUsernameFieldAvailability(0);
            setUsernameFieldError("Please check availability.");
            return true;
        }
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
            setUsernameFieldError(false);
        } else {
            setCheckedUsernames([checkedUsernames[0], [...checkedUsernames[1], usernameField]]);
            setUsernameFieldAvailability(3);
            setUsernameFieldError("Username in use.");
        }
    };

    const handleEmailFieldChange = (value) => {
        setEmailField(value);
        let err = basicVerify("an email", false, value, false, [1, 256], true, true, setEmailFieldError);
        if (err) {
            setEmailFieldAvailability(-1);
            return true;
        }
        if (!value) {
            setEmailFieldAvailability(-1);
            setEmailFieldError(false);
            return false;
        }

        if (checkedEmails[0].includes(value)) {
            setEmailFieldAvailability(2);
            setEmailFieldError(false);
            return false;
        } else if (checkedEmails[1].includes(value)) {
            setEmailFieldAvailability(3);
            setEmailFieldError("Email in use.");
            return true;
        } else {
            setEmailFieldAvailability(0);
            setEmailFieldError("Please check availability.");
            return true;
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
            setEmailFieldError(false);
        } else {
            setCheckedEmails([checkedEmails[0], [...checkedEmails[1], emailField]]);
            setEmailFieldAvailability(3);
            setEmailFieldError("Email in use.");
        }
    };

    const handleConfirmPasswordFieldChange = (value, regular) => {
        setConfirmPasswordField(value);
        const compare = regular || passwordField;
        if (value === compare) {
            setConfirmPasswordFieldError(false);
            return false;
        } else {
            setConfirmPasswordFieldError("Passwords do not match.");
            return true;
        }
    };

    const handleDobFieldChange = (value) => {
        setDobField(value);
        const ageRange = [13, 150];
        let curDate = new Date();
        let dateMax = curDate.setFullYear(curDate.getFullYear() - ageRange[0]);
        let dateMin = curDate.setFullYear(curDate.getFullYear() - ageRange[1] + ageRange[0]);

        let valArr = value.split("/");
        if (value.length !== 10 || valArr.length !== 3) return setAndReturnDobError("Invalid Format (MM/DD/YYYY)");

        let month = parseInt(valArr[0]);
        if (!month || month < 1 || month > 12) return setAndReturnDobError("Invalid Month (1-12)");
        month--;
        let day = parseInt(valArr[1]);
        if (!day || day < 1 || day > 31) return setAndReturnDobError("Invalid Day (1-31)");
        let year = parseInt(valArr[2]);
        if (!year) return setAndReturnDobError("Invalid Year (YYYY)");

        let dob = new Date();
        dob.setFullYear(year, month, day);
        dob.setHours(0, 0, 0);
        if (dob > dateMax) return setAndReturnDobError("Must be at least 13.");
        if (dob < dateMin) return setAndReturnDobError("That's not possible.");

        month++;
        setDobFieldFormatted(`${year}${month < 10 ? "0" + month : month}${day < 10 ? "0" + day : day}`);
        setDobFieldError(false);
        return false;
    };

    const setAndReturnDobError = (err) => {
        setDobFieldError(err);
        return err;
    };

    const handleNameFieldChange = (value) => {
        setNameField(value);
        return basicVerify("your name", false, value, true, [2, 20], false, true, setNameFieldError);
    };

    const handleGenderFieldChange = (value) => {
        setGenderField(value);
        return basicVerify("your gender", true, value, true, [1, 2], false, false, setGenderFieldError);
    };

    const handleHeightFieldChange = (value) => {
        value = parseInt(value);
        setHeightField(value);
        return basicVerify("your height", true, value, true, [1, 300], false, false, setHeightFieldError);
    };

    const handleBodyweightFieldChange = (value) => {
        value = parseInt(value);
        setBodyweightField(value);
        return basicVerify("your bodyweight", true, value, true, [1, 2000], false, false, setBodyweightFieldError);
    };

    const handleDescriptionFieldChange = (value) => {
        setDescriptionField(value);
        return basicVerify("your description", false, value, false, [1, 100], false, true, setDescriptionFieldError);
    };

    const handlePasswordFieldChange = (value) => {
        setPasswordField(value);
        handleConfirmPasswordFieldChange(confirmPasswordField, value);
        return basicVerify("your password", false, value, true, [8, 256], false, true, setPasswordFieldError);
    };

    const runFullCheck = () => {
        let errors = [];
        errors.push(handleNameFieldChange(nameField));
        errors.push(handleDobFieldChange(dobField));
        errors.push(handleGenderFieldChange(genderField));
        errors.push(handleUsernameFieldChange(usernameField));
        errors.push(handleEmailFieldChange(emailField));
        errors.push(handleHeightFieldChange(heightField));
        errors.push(handleBodyweightFieldChange(bodyweightField));
        errors.push(handleDescriptionFieldChange(descriptionField));
        errors.push(handlePasswordFieldChange(passwordField));
        errors.push(handleConfirmPasswordFieldChange(confirmPasswordField));
        for (let err of errors) if (err) return true;
        return false;
    };

    const signup = async () => {
        // TODO: verify everything on click, finish handler functions
        setGeneralError(false);
        let errors = runFullCheck();
        if (errors) {
            setGeneralError("Please address all errors on screen.");
            return;
        }

        let userData = {
            name: nameField,
            username: usernameField,
            email: emailField || null,
            description: descriptionField || null,
            dob: dobFieldFormatted,
            height: heightField,
            height_unit_fk: heightUnitField,
            gender_fk: genderField,
            bodyweight: bodyweightField,
            bw_unit_fk: bodyweightUnitField,
            activity_level_fk: activityLevelField,
            weight_goal_fk: weightGoalField,
            password: passwordField,
            icon_fk: iconField,
            theme: themeField,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        let response = await axios.post(Config.apiURL + "/auth/signup/", userData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });
        response = response.data;

        if (response.success) {
            history.replace("/login", { title: "Log in with your new credentials." });
        } else if (response.error) {
            setGeneralError("Server Error: " + response.error);
        } else {
            setGeneralError("Server Error: " + response);
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
                        label={nameFieldError ? nameFieldError : "Name (2-20)"}
                        type={"text"}
                        value={nameField}
                        onChange={handleNameFieldChange}
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
                        onChange={handleGenderFieldChange}
                        valuesArr={[
                            [0, "-Select-"],
                            [1, "Male"],
                            [2, "Female"],
                        ]}
                        size={2}
                        position={2}
                        error={genderFieldError ? true : false}
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
                            onChange={handleUsernameFieldChange}
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
                            onChange={handleEmailFieldChange}
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
                        onChange={handleHeightFieldChange}
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
                            [6, "In"],
                            [5, "Cm"],
                        ]}
                        size={2}
                        position={0}
                        error={false}
                    />
                    <InputField
                        label={bodyweightFieldError ? bodyweightFieldError : "Bodyweight"}
                        type={"number"}
                        value={bodyweightField}
                        onChange={handleBodyweightFieldChange}
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
                            [2, "Lb"],
                            [1, "Kg"],
                        ]}
                        size={2}
                        position={2}
                        error={false}
                    />
                </Grid>

                {/* Fourth Row: Activity Level */}
                <DropdownField
                    label={"Activity Level"}
                    value={activityLevelField}
                    onChange={setActivityLevelField}
                    valuesArr={[
                        [1, "Sedetary: Little to no exercise."],
                        [2, "Lightly Active: Light exercise / sports 1-3 days a week."],
                        [3, "Moderately Active: Moderate exercise / 3-5 days a week."],
                        [4, "Very Active: Hard exercise / sports 6-7 days a week."],
                        [5, "Extra Active: Very hard exercise / sports and physical job or 2x training."],
                    ]}
                    size={false}
                    position={-1}
                    error={false}
                />

                {/* Fourth Row: Weight Goal Level, Theme, Icon */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <DropdownField
                        label={"Weight Goal"}
                        value={weightGoalField}
                        onChange={setWeightGoalField}
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
                        error={false}
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
                        error={false}
                    />
                    <DropdownField
                        label={"Icon"}
                        value={iconField}
                        onChange={setIconField}
                        valuesArr={[[1, "Default"]]}
                        size={3}
                        position={2}
                        error={false}
                    />
                </Grid>

                {/* Fifth Row: Description */}
                <InputField
                    label={descriptionFieldError ? descriptionFieldError : "Description (1-100) (optional)"}
                    type={"text"}
                    value={descriptionField}
                    onChange={handleDescriptionFieldChange}
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
                        onChange={handlePasswordFieldChange}
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
