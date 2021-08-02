import Grid from "@material-ui/core/Grid";
import Config from "../Config";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { useState } from "react";
import { Link } from "react-router-dom";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";

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
    // Availability Codes -> 0: blank, 1: loading, 2: available, 3: taken

    const classes = useStyles();
    const [generalError, setGeneralError] = useState(false);

    const [nameField, setNameField] = useState("");
    const [nameFieldError, setNameFieldError] = useState(false);

    const [usernameField, setUsernameField] = useState("");
    const [usernameFieldError, setUsernameFieldError] = useState(false);
    const [checkedUsernames, setCheckedUsernames] = useState([[], []]);
    const [usernameAvailability, setUsernameAvailability] = useState(0);

    const [emailField, setEmailField] = useState("");
    const [emailFieldError, setEmailFieldError] = useState(false);
    const [checkedEmails, setCheckedEmails] = useState([[], []]);
    const [emailFieldAvailability, setEmailFieldAvailability] = useState(0);

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

    const [themeField, setThemeField] = useState(1);

    const [descriptionField, setDescriptionField] = useState("");
    const [descriptionFieldError, setDescriptionFieldError] = useState(false);

    const [passwordField, setPasswordField] = useState("");
    const [passwordFieldError, setPasswordFieldError] = useState(false);
    const [confirmPasswordField, setConfirmPasswordField] = useState("");
    const [confirmPasswordFieldError, setConfirmPasswordFieldError] = useState(false);

    const handleUsernameCheck = () => {};

    const handleEmailCheck = () => {};

    const handleDOBChange = (value) => {};

    const handleConfirmPasswordChange = (value) => {};

    const checkAvailable = (value, type) => {};

    const signup = async () => {
        // validate passwords are same
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
                    <Typography display="inline" variant="body1" color={generalError ? "error" : "textPrimary"}>
                        {generalError ? generalError : "Account Information (Items with a * are required)"}
                    </Typography>
                </Grid>

                {/* First row: Name, Birthday, Gender */}
                <Grid item container justifyContent="center" alignItems="center" className={classes.inputField}>
                    <Grid
                        item
                        xs={6}
                        className={classes.inputField}
                        style={{
                            padding: "0 10px 0 0",
                        }}
                    >
                        <TextField
                            label="*Name (2-20)"
                            type="text"
                            defaultValue={nameField}
                            error={false}
                            onChange={(e) => setNameField(e.target.value)}
                            autoComplete="name"
                            variant="outlined"
                            className={classes.inputField}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={4}
                        className={classes.inputField}
                        style={{
                            padding: "0 10px 0 10px",
                        }}
                    >
                        <TextField
                            label="*Birthday (MM/DD/YYYY)"
                            type="text"
                            defaultValue={dobField}
                            error={false}
                            onChange={(e) => handleDOBChange(e.target.value)}
                            autoComplete="bday"
                            variant="outlined"
                            className={classes.inputField}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={2}
                        className={classes.inputField}
                        style={{
                            padding: "0 0 0 10px",
                        }}
                    >
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="genderSelect">*Gender</InputLabel>
                            <Select labelId="genderSelect" value={genderField} onChange={(e) => setGenderField(e.target.value)} label="*Gender">
                                <MenuItem value={0}>
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={1}>Male</MenuItem>
                                <MenuItem value={2}>Female</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
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
                        <Grid item xs={6} className={classes.inputField}>
                            <TextField
                                label="*Username"
                                type="text"
                                defaultValue={usernameField}
                                error={false}
                                onChange={(e) => setUsernameField(e.target.value)}
                                autoComplete="username"
                                variant="outlined"
                                className={classes.inputField}
                            />
                        </Grid>
                        <Grid item container xs={3} justifyContent="center" className={classes.inputField}>
                            <Button onClick={handleUsernameCheck} variant="contained" className={classes.btnWarning}>
                                Check
                            </Button>
                        </Grid>
                        <Grid item container justifyContent="center" xs={3} className={classes.inputField}>
                            {/* <CheckIcon className={classes.textSuccess} /> */}
                            {/* <ClearIcon className={classes.textError} /> */}
                            <Typography display="inline" variant="body1" className={classes.textError}>
                                {/* Available || Taken */}
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
                        <Grid item xs={6} className={classes.inputField}>
                            <TextField
                                label="Email"
                                type="text"
                                defaultValue={emailField}
                                error={false}
                                onChange={(e) => setEmailField(e.target.value)}
                                autoComplete="username"
                                variant="outlined"
                                className={classes.inputField}
                            />
                        </Grid>
                        <Grid item container xs={3} justifyContent="center" className={classes.inputField}>
                            <Button onClick={handleEmailCheck} variant="contained" className={classes.btnWarning}>
                                Check
                            </Button>
                        </Grid>
                        <Grid item container justifyContent="center" xs={3} className={classes.inputField}>
                            {/* <CheckIcon className={classes.textSuccess} /> */}
                            {/* <ClearIcon className={classes.textError} /> */}
                            <Typography display="inline" variant="body1" className={classes.textError}>
                                {/* Available || Taken */}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Third Row: Height, Weight */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <Grid
                        item
                        container
                        xs={4}
                        alignItems="center"
                        justifyContent="center"
                        className={classes.inputField}
                        style={{ padding: "0 10px 0 0" }}
                    >
                        <TextField
                            label="*Height"
                            type="number"
                            defaultValue={heightField}
                            error={false}
                            onChange={(e) => setHeightField(e.target.value)}
                            variant="outlined"
                            className={classes.inputField}
                        />
                    </Grid>
                    <Grid
                        item
                        container
                        xs={2}
                        alignItems="center"
                        justifyContent="center"
                        className={classes.inputField}
                        style={{ padding: "0 10px 0 10px" }}
                    >
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="heightUnitSelect">*Height Unit</InputLabel>
                            <Select
                                labelId="heightUnitSelect"
                                value={heightUnitField}
                                onChange={(e) => setHeightUnitField(e.target.value)}
                                label="*Height Unit"
                            >
                                <MenuItem value={0}>
                                    <em>Unit</em>
                                </MenuItem>
                                <MenuItem value={6}>In</MenuItem>
                                <MenuItem value={5}>Cm</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={4}
                        alignItems="center"
                        justifyContent="center"
                        className={classes.inputField}
                        style={{ padding: "0 10px 0 10px" }}
                    >
                        <TextField
                            label="*Bodyweight"
                            type="number"
                            defaultValue={bodyweightField}
                            error={false}
                            onChange={(e) => setBodyweightField(e.target.value)}
                            variant="outlined"
                            className={classes.inputField}
                        />
                    </Grid>
                    <Grid
                        item
                        container
                        xs={2}
                        alignItems="center"
                        justifyContent="center"
                        className={classes.inputField}
                        style={{ padding: "0 0 0 10px" }}
                    >
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="bodyweightUnitSelect">*Weight Unit</InputLabel>
                            <Select
                                labelId="bodyweightUnitSelect"
                                value={bodyweightUnitField}
                                onChange={(e) => setBodyweightUnitField(e.target.value)}
                                label="* Weight Unit"
                            >
                                <MenuItem value={0}>
                                    <em>Unit</em>
                                </MenuItem>
                                <MenuItem value={1}>Kg</MenuItem>
                                <MenuItem value={2}>Lb</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Fourth Row: Activity Level */}
                <Grid item className={classes.inputField}>
                    <FormControl variant="outlined" className={classes.inputField}>
                        <InputLabel id="activityLevelSelect">*Activity Level</InputLabel>
                        <Select
                            labelId="activityLevelSelect"
                            value={activityLevelField}
                            onChange={(e) => setActivityLevelField(e.target.value)}
                            label="*Activity Level"
                        >
                            <MenuItem value={0}>
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={1}>Sedetary: Little to no exercise.</MenuItem>
                            <MenuItem value={2}>Lightly Active: Light exercise / sports 1-3 days a week.</MenuItem>
                            <MenuItem value={3}>Moderately Active: Moderate exercise / 3-5 days a week.</MenuItem>
                            <MenuItem value={4}>Very Active: Hard exercise / sports 6-7 days a week.</MenuItem>
                            <MenuItem value={5}>Extra Active: Very hard exercise / sports and physical job or 2x training.</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Fourth Row: Weight Goal Level, Theme, Icon */}
                <Grid item container alignItems="center" justifyContent="center" className={classes.inputField}>
                    <Grid item xs={6} className={classes.inputField} style={{ padding: "0 10px 0 0" }}>
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="weightGoalSelect">*Weight Goal</InputLabel>
                            <Select
                                labelId="weightGoalSelect"
                                value={weightGoalField}
                                onChange={(e) => setWeightGoalField(e.target.value)}
                                label="*Weight Goal"
                            >
                                <MenuItem value={0}>
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={1}>Extreme Loss (2lb / .9kg a week)</MenuItem>
                                <MenuItem value={2}>Regular Loss (1lb / .45kg a week)</MenuItem>
                                <MenuItem value={3}>Mild Loss (0.5lb / .225kg a week)</MenuItem>
                                <MenuItem value={4}>Maintenance (No change)</MenuItem>
                                <MenuItem value={5}>Mild Gain (0.5lb / .225kg a week)</MenuItem>
                                <MenuItem value={6}>Regular Gain (1lb / .45kg a week)</MenuItem>
                                <MenuItem value={7}>Extreme Gain (2lb / .9kg a week)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={3}
                        justifyContent="center"
                        alignItems="center"
                        className={classes.inputField}
                        style={{
                            padding: "0 5px 0 10px",
                        }}
                    >
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="themeSelect">*Theme</InputLabel>
                            <Select labelId="themeSelect" value={themeField} onChange={(e) => setThemeField(e.target.value)} label="*Theme">
                                <MenuItem value={0}>Light</MenuItem>
                                <MenuItem value={1}>Dark</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={3}
                        justifyContent="center"
                        alignItems="center"
                        className={classes.inputField}
                        style={{
                            padding: "0 0 0 15px",
                        }}
                    >
                        <FormControl variant="outlined" className={classes.inputField}>
                            <InputLabel id="iconSelect">*Icon</InputLabel>
                            <Select labelId="iconSelect" value={iconField} onChange={(e) => setIconField(e.target.value)} label="*Icon">
                                <MenuItem value={1}>Default</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Fifth Row: Description */}
                <Grid item className={classes.inputField}>
                    <TextField
                        label="Description (1-100)"
                        type="text"
                        defaultValue={descriptionField}
                        error={false}
                        onChange={(e) => setDescriptionField(e.target.value)}
                        autoComplete="description"
                        variant="outlined"
                        className={classes.inputField}
                    />
                </Grid>

                {/* Sixth Row: Password */}
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
                        <TextField
                            label="*Password"
                            type="password"
                            defaultValue={passwordField}
                            error={false}
                            onChange={(e) => setPasswordField(e.target.value)}
                            variant="outlined"
                            className={classes.inputField}
                        />
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
                        <TextField
                            label="*Confirm Password"
                            type="password"
                            defaultValue={confirmPasswordField}
                            error={false}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            variant="outlined"
                            className={classes.inputField}
                        />
                    </Grid>
                </Grid>

                {/* Seventh Row: Buttons */}
                <Grid item container alignItems="center" justifyContent="center">
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
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Signup;
