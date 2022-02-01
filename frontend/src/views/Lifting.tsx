import Config from "../Config";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";
import LiftView from "./lifting/LiftView";
import WorkoutView from "./lifting/WorkoutView";
import axios from "axios";
import { liftObj, workoutObj, getLiftResponse, getWorkoutResponse, workoutShort } from "../global/globalTypes";
import LiftCard from "../components/lifting/LiftCard";
import { styled } from "@mui/material/styles";
import WorkoutCard from "../components/lifting/WorkoutCard";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import CreateLiftView from "./lifting/CreateLiftView";
import CreateWorkoutView from "./lifting/CreateWorkoutView";
import BigButton from "../components/inputs/BigButton";
import AddLiftSet from "../components/lifting/AddLiftSet";

interface selectedLift {
    id: number;
    workouts: workoutShort[];
}
interface selectedWorkout {
    id: number;
    name: string;
}

const PREFIX = "Lifting";
const classes = {
    mainPage: `${PREFIX}-mainPage`,
    marginTop: `${PREFIX}-marginTop`,
    marginLeft: `${PREFIX}-marginLeft`,
    fullWidth: `${PREFIX}-fullWidth`,
    link: `${PREFIX}-link`,
    hr: `${PREFIX}-hr`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.mainPage}`]: {
        marginTop: "0",
    },
    [`& .${classes.marginTop}`]: {
        marginTop: "20px",
    },
    [`& .${classes.marginLeft}`]: {
        marginLeft: "20px",
    },
    [`& .${classes.fullWidth}`]: {
        width: "100%",
    },
    [`& .${classes.link}`]: {
        textDecoration: "none",
    },
    [`& .${classes.hr}`]: {
        width: "100%",
        borderColor: theme.palette.grey[500],
        background: theme.palette.grey[500],
    },
}));

const Lifting: React.FC = () => {
    let { url, path } = useRouteMatch();
    const daysArr = ["U", "M", "T", "W", "R", "F", "S"];
    const [today, setToday] = useState<string>(daysArr[new Date().getDay()]);

    const [workoutSearch, setWorkoutSearch] = useState<string>("");
    const [liftSearch, setLiftSearch] = useState<string>("");

    const [stateChange, setStateChange] = useState<boolean>(false);

    const [selectedLift, setSelectedLift] = useState<selectedLift>({ id: -1, workouts: [] });
    const [selectedWorkout, setSelectedWorkout] = useState<selectedWorkout>({ id: -1, name: "" });

    const [lifts, setLifts] = useState<liftObj[]>([]);
    const [workouts, setWorkouts] = useState<workoutObj[]>([]);

    const [filterLifts, setFilterLifts] = useState<liftObj[]>([]);
    const [filterWorkouts, setFilterWorkouts] = useState<workoutObj[]>([]);

    const liftSearchChange = (value: string): void => {
        setLiftSearch(value);
        setFilterLiftsWrapper(value, selectedWorkout.id, lifts);
    };

    const workoutSearchChange = (value: string): void => {
        setWorkoutSearch(value);
        setFilterWorkoutsWrapper(value, workouts);
    };

    const getWorkoutIDs = (workoutArr: workoutShort[]): number[] => {
        return workoutArr.map((w) => w.id);
    };

    const updateLiftWorkoutState = () => {
        setStateChange(!stateChange);
    };

    const handleLiftClick = (selected: boolean, id: number) => {
        if (selected) {
            setSelectedLift({ id: -1, workouts: [] });
        } else {
            let lift = lifts.find((lift) => lift.id === id);
            let workouts = lift?.workouts;
            if (!workouts) workouts = [];

            setSelectedLift({ id: id, workouts });
        }
    };

    const handleWorkoutClick = (selected: boolean, id: number, name: string) => {
        if (selected) {
            setSelectedWorkout({ id: -1, name: "" });
            setFilterLiftsWrapper(liftSearch, -1, lifts);
        } else {
            let wIDs = getWorkoutIDs(selectedLift.workouts);
            if (!wIDs.includes(id)) setSelectedLift({ id: -1, workouts: [] });
            setSelectedWorkout({ id, name });
            setFilterLiftsWrapper(liftSearch, id, lifts);
        }
    };

    const setFilterWorkoutsWrapper = (searchVal: string, localWorkouts: workoutObj[]) => {
        if (searchVal === "") {
            setFilterWorkouts(localWorkouts);
        } else {
            let filtered: workoutObj[] = [];
            filtered = localWorkouts.filter((workout) => workout.name.toLowerCase().includes(searchVal.toLowerCase()));
            setFilterWorkouts(filtered);
        }
    };

    const setFilterLiftsWrapper = (searchVal: string, wId: number, localLifts: liftObj[]) => {
        if (searchVal === "" && wId === -1) {
            setFilterLifts(localLifts);
        } else {
            let filtered: liftObj[] = [];
            if (wId === -1) {
                filtered = localLifts.filter((lift) => lift.name.toLowerCase().includes(searchVal.toLowerCase()));
            } else if (searchVal === "") {
                filtered = localLifts.filter((lift) => getWorkoutIDs(lift.workouts).includes(wId));
            } else {
                filtered = localLifts.filter(
                    (lift) => getWorkoutIDs(lift.workouts).includes(wId) && lift.name.toLowerCase().includes(searchVal.toLowerCase())
                );
            }
            if (wId === -1) {
                filtered.sort((a, b) => b.starred - a.starred);
            } else {
                filtered.sort(
                    (a, b) => (a.workouts.find((w) => w.id === wId)?.order_num || -1) - (b.workouts.find((w) => w.id === wId)?.order_num || -1)
                );
            }
            setFilterLifts(filtered);
        }
    };

    useEffect(() => {
        async function getData() {
            try {
                const resLift: { data: getLiftResponse } = await axios.get(`${Config.apiUrl}/lift/?limit=20&offset=0`, { withCredentials: true });

                const resWorkout: { data: getWorkoutResponse } = await axios.get(`${Config.apiUrl}/lift/workout/`, { withCredentials: true });

                setLifts(resLift.data.lifts);
                setWorkouts(resWorkout.data.workouts);

                let tempFilterLifts = resLift.data.lifts.sort((a, b) => b.starred - a.starred);
                setFilterLifts(tempFilterLifts);

                let tempFilterWorkouts = resWorkout.data.workouts.sort(
                    (a, b) =>
                        (b.days?.toLowerCase().includes(today.toLowerCase()) ? 1 : 0) - (a.days?.toLowerCase().includes(today.toLowerCase()) ? 1 : 0)
                );
                setFilterWorkouts(tempFilterWorkouts);

                setFilterLiftsWrapper(liftSearch, selectedWorkout.id, tempFilterLifts);
                setFilterWorkoutsWrapper(workoutSearch, tempFilterWorkouts);
            } catch (err) {
                console.error(err);
            }
        }
        getData();
        return () => {};
    }, [stateChange]);

    return (
        <Root>
            <Switch>
                <Route exact path={path}>
                    <Grid container direction="row" justifyContent="center" className={classes.mainPage} spacing={5}>
                        {/* Workout section */}
                        <Grid container item xs={4} direction="column" spacing={2} className={classes.marginLeft}>
                            <Typography variant="h4" color="text.primary">
                                Workouts
                            </Typography>
                            <hr className={classes.hr} />
                            <Link to={`${url}/createWorkout`} className={`${classes.link} ${classes.fullWidth}`}>
                                <BigButton type={0} text="" contrast={false}>
                                    <AddIcon color="action" />
                                    <Typography variant="subtitle1" color="text.primary">
                                        Workout
                                    </Typography>
                                </BigButton>
                            </Link>
                            <TextField
                                label="Start typing to search workouts"
                                variant="outlined"
                                className={classes.fullWidth}
                                onChange={(e) => {
                                    workoutSearchChange(e.target.value);
                                }}
                                style={{ marginTop: "20px" }}
                            />
                            <Typography variant="h5" color="text.primary" className={classes.marginTop}>
                                Today
                            </Typography>
                            <hr className={classes.hr} />
                            {filterWorkouts.map((workout, idx) => (
                                <div key={workout.id}>
                                    {!workout.days?.toLowerCase().includes(today.toLowerCase()) &&
                                    (idx === 0 || filterWorkouts[idx - 1].days?.toLowerCase().includes(today.toLowerCase())) ? (
                                        <>
                                            <Typography variant="h5" color="text.primary" className={classes.marginTop}>
                                                All Workouts
                                            </Typography>
                                            <hr className={classes.hr} />
                                        </>
                                    ) : (
                                        ""
                                    )}
                                    <WorkoutCard handleClick={handleWorkoutClick} workoutObj={workout} selected={selectedWorkout.id === workout.id} />
                                </div>
                            ))}
                            {workouts.length === 0 ? (
                                <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                    You do not have any workouts yet, create one above.
                                </Typography>
                            ) : (
                                ""
                            )}
                            {workouts.length !== 0 && filterWorkouts.length === 0 ? (
                                <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                    The search does not match any workouts.
                                </Typography>
                            ) : (
                                ""
                            )}
                        </Grid>
                        {/* Lift Section */}
                        <Grid container item xs={4} direction="column" spacing={2}>
                            <Typography variant="h4" color="text.primary">
                                Lifts
                            </Typography>
                            <hr className={classes.hr} />
                            <Link to={`${url}/createLift`} className={`${classes.link} ${classes.fullWidth}`}>
                                <BigButton type={0} text="" contrast={false}>
                                    <AddIcon color="action" />
                                    <Typography variant="subtitle1" color="text.primary">
                                        Lift
                                    </Typography>
                                </BigButton>
                            </Link>
                            <TextField
                                label="Start typing to search lifts"
                                variant="outlined"
                                className={classes.fullWidth}
                                onChange={(e) => {
                                    liftSearchChange(e.target.value);
                                }}
                                style={{ marginTop: "20px" }}
                            />
                            <Typography variant="h5" color="text.primary" className={classes.marginTop}>
                                {selectedWorkout.id === -1 ? "All Lifts" : `${selectedWorkout.name}`}
                            </Typography>
                            <hr className={classes.hr} />
                            {filterLifts.map((lift) => (
                                <LiftCard
                                    key={lift.id}
                                    liftObj={lift}
                                    workoutArr={workouts}
                                    handleClick={handleLiftClick}
                                    updateLiftState={updateLiftWorkoutState}
                                    selected={selectedLift.id === lift.id}
                                />
                            ))}
                            {lifts.length === 0 ? (
                                <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                    You do not have any lifts yet, create one above.
                                </Typography>
                            ) : (
                                ""
                            )}
                            {lifts.length !== 0 && filterLifts.length === 0 && selectedWorkout.id !== -1 ? (
                                <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                    This workout does not have any lifts yet.
                                </Typography>
                            ) : (
                                ""
                            )}
                            {lifts.length !== 0 && filterLifts.length === 0 && selectedWorkout.id === -1 ? (
                                <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                    The search does not match any lifts.
                                </Typography>
                            ) : (
                                ""
                            )}
                        </Grid>
                        {/* Add lift set section */}
                        <Grid container item xs={3} direction="column" alignItems="center" spacing={2}>
                            {selectedLift.id === -1 ? (
                                <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                    Click on a lift to quickly add a set here.
                                </Typography>
                            ) : (
                                <AddLiftSet
                                    id={selectedLift.id}
                                    updateState={updateLiftWorkoutState}
                                    name={lifts.find((l) => l.id === selectedLift.id)?.name}
                                    unit={lifts.find((l) => l.id === selectedLift.id)?.plur_abbr || "lbs"}
                                />
                            )}
                        </Grid>
                    </Grid>
                </Route>
                <Route path={`${path}/createLift`}>
                    <CreateLiftView />
                </Route>
                <Route path={`${path}/createWorkout`}>
                    <CreateWorkoutView />
                </Route>
                <Route path={`${path}/workout/:id`}>
                    <WorkoutView />
                </Route>
                <Route path={`${path}/lift/:id`}>
                    <LiftView />
                </Route>
            </Switch>
        </Root>
    );
};

export default Lifting;
