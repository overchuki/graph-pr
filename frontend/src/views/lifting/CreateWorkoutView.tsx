import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useHistory, Link } from "react-router-dom";
import { HTTPPostResponse, ErrorType, snackbarType } from "../../global/globalTypes";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import { Button, CircularProgress, Typography } from "@mui/material";
import CheckWithLabel from "../../components/inputs/CheckWithLabel";
import { capitalizeFirstLetter } from "../../components/util";

const PREFIX = "CreateWorkout";
const classes = {
    halfWidth: `${PREFIX}-halfWidth`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.halfWidth}`]: {
        width: "40%",
        padding: "30px",
        margin: "auto",
    },
}));

const CreateWorkoutView: React.FC = () => {
    const daysArr = ["U", "M", "T", "W", "R", "F", "S"];
    const daysFullArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const history = useHistory();

    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarType, setSnackbarType] = useState<snackbarType>("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const openSnackbar = (message: string, type: snackbarType) => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarOpen(true);
    };

    const [name, setName] = useState<ErrorType>("");
    const [description, setDescription] = useState<ErrorType>("");
    const [days, setDays] = useState<string>("");

    const [status, setStatus] = useState<boolean>(false);

    const onCheckChange = (i: number, checked: boolean): void => {
        const c = daysArr[i];

        if (!checked) {
            setDays(days.replace(c, ""));
        } else {
            setDays(days + c);
        }
    };

    const submitWorkout = async (nameIn: string, descIn: string, daysIn: string) => {
        setStatus(true);

        if (nameIn === "") {
            openSnackbar("Workout name required", "error");
            setStatus(false);
            return;
        }

        let data = {
            name: nameIn,
            description: descIn,
            days: daysIn,
        };

        try {
            const res: { data: HTTPPostResponse } = await axios.post(`${Config.apiUrl}/lift/workout`, data, { withCredentials: true });

            if (res.data.success && res.data.id) {
                setStatus(false);
                history.replace(`/lifting/workout/${res.data.id}`, { snackBarStatus: true });
            } else if (res.data.error) {
                openSnackbar(capitalizeFirstLetter(res.data.error), "error");
                setStatus(false);
            } else {
                openSnackbar("Error Creating Workout", "error");
                setStatus(false);
            }
        } catch (err) {
            openSnackbar("Error Creating Workout", "error");
            setStatus(false);
        }
    };

    return (
        <Root style={{ textAlign: "center" }}>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="column" className={classes.halfWidth} spacing={2} justifyContent="center" alignItems="center">
                <Grid item>
                    <Typography variant="h5" color="text.primary">
                        Create Workout
                    </Typography>
                </Grid>
                <InputField
                    label={"Workout Name"}
                    type={"text"}
                    value={""}
                    controlled={false}
                    setValue={setName}
                    errorOverwrite={name === false ? "Invalid name" : false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
                    verify={true}
                    verifyObj={{
                        name: "your workout name",
                        required: true,
                        range: [0, 20],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: false,
                    }}
                />
                <InputField
                    label={"Workout Description (optional)"}
                    type={"text"}
                    value={""}
                    controlled={false}
                    setValue={setDescription}
                    errorOverwrite={description === false ? "Invalid description" : false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
                    verify={true}
                    verifyObj={{
                        name: "your description",
                        required: false,
                        range: [0, 200],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: false,
                    }}
                />
                <Grid item container direction="column" alignItems="flex-start" spacing={0}>
                    <Typography variant="subtitle1" color="text.secondary">
                        Select Days of the Week (optional):
                    </Typography>
                    {daysFullArr.map((d, i) => (
                        <CheckWithLabel key={i} onCheckChange={onCheckChange} value={i} label={d} />
                    ))}
                </Grid>
                <Grid item container justifyContent="center" spacing={2}>
                    {status === false ? (
                        <>
                            <Grid item>
                                <Link to="/lifting" style={{ textDecoration: "none" }}>
                                    <Button variant="outlined" color="secondary">
                                        Back to Lifts
                                    </Button>
                                </Link>
                            </Grid>
                            <Grid item>
                                <Button
                                    onClick={() => {
                                        if (typeof name == "string" && typeof description == "string") {
                                            submitWorkout(name, description, days);
                                        }
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Create Workout
                                </Button>
                            </Grid>
                        </>
                    ) : (
                        <CircularProgress color="primary" />
                    )}
                </Grid>
            </Grid>
        </Root>
    );
};

export default CreateWorkoutView;
