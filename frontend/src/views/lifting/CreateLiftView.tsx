import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useHistory, Link } from "react-router-dom";
import { HTTPPostResponse, ErrorType, snackbarType, workoutObj } from "../../global/globalTypes";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import { Button, CircularProgress, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Typography } from "@mui/material";
import CheckWithLabel from "../../components/inputs/CheckWithLabel";
import { capitalizeFirstLetter } from "../../components/util";
import WorkoutDialog from "../../components/lifting/WorkoutsDialog";
import AddIcon from "@mui/icons-material/Add";

const PREFIX = "CreateLift";
const classes = {
    halfWidth: `${PREFIX}-halfWidth`,
    label: `${PREFIX}-label`,
    smlIcon: `${PREFIX}-smlIcon`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.halfWidth}`]: {
        width: "40%",
        padding: "30px",
        margin: "auto",
    },
    [`& .${classes.label}`]: {
        color: theme.palette.text.secondary,
    },
    [`& .${classes.smlIcon}`]: {
        transform: "scale(0.8)",
    },
}));

const CreateLiftView: React.FC = () => {
    const history = useHistory();

    const [workoutArray, setWorkoutArray] = useState<workoutObj[]>([]);

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
    const [unit, setUnit] = useState<number>(2);
    const [starred, setStarred] = useState<boolean>(false);
    const [workouts, setWorkouts] = useState<number[]>([]);
    const [workoutsName, setWorkoutsName] = useState<string[]>([]);

    const [status, setStatus] = useState<boolean>(false);

    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const onDialogSave = async (workoutArr: number[] | null) => {
        setOpenDialog(false);
        if (workoutArr) {
            setWorkouts(workoutArr);
            setWorkoutsName(workoutArray.filter((w) => workoutArr.includes(w.id)).map((w) => w.name));
        }
    };

    const onStarChange = (i: number, checked: boolean): void => {
        setStarred(checked);
    };

    const submitLift = async (nameIn: string, unitIn: number, workoutsIn: number[], starredIn: boolean) => {
        setStatus(true);
        let data = {
            name: nameIn,
            unit_fk: unitIn,
            workout_fk: workoutsIn,
            starred: starredIn,
        };

        if (nameIn === "") {
            openSnackbar("Lift name required", "error");
            setStatus(false);
            return;
        }

        setStatus(false);

        try {
            const res: { data: HTTPPostResponse } = await axios.post(`${Config.apiUrl}/lift`, data, { withCredentials: true });

            if (res.data.success && res.data.id) {
                setStatus(false);
                history.replace(`/lifting/lift/${res.data.id}`, { snackBarStatus: true });
            } else if (res.data.error) {
                openSnackbar(capitalizeFirstLetter(res.data.error), "error");
                setStatus(false);
            } else {
                openSnackbar("Error Creating Lift", "error");
                setStatus(false);
            }
        } catch (err) {
            openSnackbar("Error Creating Lift", "error");
            setStatus(false);
        }
    };

    useEffect(() => {
        async function getWorkouts() {
            let ws: { data: { workouts: workoutObj[] } } = await axios.get(`${Config.apiUrl}/lift/workout`, { withCredentials: true });
            setWorkoutArray(ws.data.workouts);
        }
        getWorkouts();
        return () => {};
    }, []);

    return (
        <Root style={{ textAlign: "center" }}>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="column" className={classes.halfWidth} spacing={2} justifyContent="center" alignItems="center">
                <Grid item>
                    <Typography variant="h5" color="text.primary">
                        Create Lift
                    </Typography>
                </Grid>
                <InputField
                    label={"Lift Name"}
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
                        name: "your lift name",
                        required: true,
                        range: [0, 20],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: false,
                    }}
                />
                <Grid item container direction="column" alignItems="flex-start" spacing={0}>
                    <FormControl>
                        <FormLabel>Unit</FormLabel>
                        <RadioGroup
                            value={unit}
                            onChange={(e) => {
                                let val = 2;
                                try {
                                    val = parseInt(e.target.value);
                                    setUnit(val);
                                } catch (err) {
                                    setUnit(val);
                                }
                            }}
                        >
                            <FormControlLabel value={2} className={classes.label} control={<Radio />} label="Lbs" />
                            <FormControlLabel value={1} className={classes.label} control={<Radio />} label="Kgs" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item container direction="column">
                    <Grid item container direction="row" alignItems="center">
                        <Typography variant="h6" color="text.secondary" gutterBottom style={{ margin: "auto 0" }}>
                            Select Workouts for this lift:
                        </Typography>
                        <IconButton
                            color="warning"
                            onClick={() => {
                                setOpenDialog(true);
                            }}
                        >
                            <AddIcon className={classes.smlIcon} />
                        </IconButton>
                    </Grid>
                    <Grid item container alignItems="flex-start">
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {workoutsName.length === 0 ? "None" : workoutsName.map((n, i) => (i !== workoutsName.length - 1 ? `${n}, ` : `${n}`))}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container direction="column" alignItems="flex-start" spacing={0}>
                    <CheckWithLabel onCheckChange={onStarChange} value={1} label={"Star this lift"} />
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
                                        if (typeof name == "string") {
                                            submitLift(name, unit, workouts, starred);
                                        }
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Create Lift
                                </Button>
                            </Grid>
                        </>
                    ) : (
                        <CircularProgress color="primary" />
                    )}
                </Grid>
                <WorkoutDialog
                    id="createLiftWorkoutDialog"
                    keepMounted
                    open={openDialog}
                    onSaveParent={onDialogSave}
                    workoutsProp={workoutArray}
                    selectedWorkoutsProp={workouts}
                />
            </Grid>
        </Root>
    );
};

export default CreateLiftView;
