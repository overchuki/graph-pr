import Config from "../Config";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";
import LiftView from "./lifting/LiftView";
import WorkoutView from "./lifting/WorkoutView";
import axios from "axios";
import { liftObj, workoutObj, getLiftResponse, getWorkoutResponse } from "../global/globalTypes";
import LiftCard from "../components/lifting/LiftCard";
import { styled } from "@mui/material/styles";
import WorkoutCard from "../components/lifting/WorkoutCard";
import AddIcon from "@mui/icons-material/Add";
import { TextField, Typography } from "@mui/material";
import CreateLiftView from "./lifting/CreateLiftView";
import CreateWorkoutView from "./lifting/CreateWorkoutView";
import BigButton from "../components/inputs/BigButton";

interface selectedLift {
    id: number;
    wId: number;
    wName: string;
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
    },
}));

const Lifting: React.FC = () => {
    let { url, path } = useRouteMatch();
    const daysArr = ["U", "M", "T", "W", "R", "F", "S"];
    let today = daysArr[new Date().getDay()];

    const [workoutSearch, setWorkoutSearch] = useState<string>("");
    const [liftSearch, setLiftSearch] = useState<string>("");

    const [selectedLift, setSelectedLift] = useState<selectedLift>({ id: -1, wId: -1, wName: "" });
    const [selectedWorkout, setSelectedWorkout] = useState<selectedWorkout>({ id: -1, name: "" });

    const [lifts, setLifts] = useState<liftObj[]>([]);
    const [workouts, setWorkouts] = useState<workoutObj[]>([]);

    const [filterLifts, setFilterLifts] = useState<liftObj[]>([]);
    const [filterWorkouts, setFilterWorkouts] = useState<workoutObj[]>([]);

    const liftSearchChange = (value: string): void => {
        setLiftSearch(value);
        setFilterLiftsWrapper(value, selectedWorkout.id);
    };

    const workoutSearchChange = (value: string): void => {
        setWorkoutSearch(value);
        setFilterWorkoutsWrapper(value);
    };

    const updateLiftWorkoutState = (
        id: number,
        workout: boolean,
        workoutId: number,
        prevWorkoutId: number,
        starred: boolean,
        starredVal: number
    ): void => {
        let liftsNew: liftObj[] = [];
        let filterLiftsNew: liftObj[] = [];
        let workoutsNew: workoutObj[] = [];
        let filterWorkoutsNew: workoutObj[] = [];

        if (workout) {
            let wObj = workouts.filter((workout) => workout.id === workoutId);
            let workoutName: string | null = null;
            if (wObj.length > 0) workoutName = wObj[0].name;

            liftsNew = lifts.map((lift) => {
                if (lift.id === id) return { ...lift, workout_id: workoutId, workout_name: workoutName };
                return lift;
            });
            filterLiftsNew = filterLifts.map((lift) => {
                if (lift.id === id) return { ...lift, workout_id: workoutId, workout_name: workoutName };
                return lift;
            });

            workoutsNew = workouts.map((workout) => {
                if (workout.id === workoutId) return { ...workout, liftCnt: workout.liftCnt + 1 };
                else if (workout.id === prevWorkoutId) return { ...workout, liftCnt: workout.liftCnt - 1 };
                return workout;
            });
            filterWorkoutsNew = filterWorkouts.map((workout) => {
                if (workout.id === workoutId) return { ...workout, liftCnt: workout.liftCnt + 1 };
                else if (workout.id === prevWorkoutId) return { ...workout, liftCnt: workout.liftCnt - 1 };
                return workout;
            });
        } else if (starred) {
            liftsNew = lifts.map((lift) => {
                if (lift.id === id) return { ...lift, starred: starredVal };
                return lift;
            });
            filterLiftsNew = filterLifts.map((lift) => {
                if (lift.id === id) return { ...lift, starred: starredVal };
                return lift;
            });
        }

        if (workout || starred) {
            setLifts(liftsNew);
            setFilterLifts(filterLiftsNew);

            if (workout) {
                setWorkouts(workoutsNew);
                setFilterWorkouts(filterWorkoutsNew);
            }
        }
    };

    const handleLiftClick = (selected: boolean, id: number) => {
        if (selected) {
            setSelectedLift({ id: -1, wId: -1, wName: "" });
        } else {
            let lift = lifts.find((lift) => lift.id === id);
            let workId = lift?.workout_id;
            let workName = lift?.workout_name;
            if (!workId) workId = -1;
            if (!workName) workName = "";

            setSelectedLift({ id: id, wId: workId, wName: workName });
        }
    };

    const handleWorkoutClick = (selected: boolean, id: number, name: string) => {
        if (selected) {
            setSelectedWorkout({ id: -1, name: "" });
            setFilterLiftsWrapper(liftSearch, -1);
        } else {
            if (selectedLift.wId !== id) setSelectedLift({ id: -1, wId: -1, wName: "" });
            setSelectedWorkout({ id, name });
            setFilterLiftsWrapper(liftSearch, id);
        }
    };

    const setFilterWorkoutsWrapper = (searchVal: string) => {
        if (searchVal === "") {
            setFilterWorkouts(workouts);
        } else {
            let filtered: workoutObj[] = [];
            filtered = workouts.filter((workout) => workout.name.toLowerCase().includes(searchVal.toLowerCase()));
            setFilterWorkouts(filtered);
        }
    };

    const setFilterLiftsWrapper = (searchVal: string, wId: number) => {
        if (searchVal === "" && wId === -1) {
            setFilterLifts(lifts);
        } else {
            let filtered: liftObj[] = [];
            if (wId === -1) {
                filtered = lifts.filter((lift) => lift.name.toLowerCase().includes(searchVal.toLowerCase()));
            } else if (searchVal === "") {
                filtered = lifts.filter((lift) => lift.workout_id === wId);
            } else {
                filtered = lifts.filter((lift) => lift.workout_id === wId && lift.name.toLowerCase().includes(searchVal.toLowerCase()));
            }
            filtered.sort((a, b) => b.starred - a.starred);
            setFilterLifts(filtered);
        }
    };

    useEffect(() => {
        async function getData() {
            try {
                const resLift: { data: getLiftResponse } = await axios.get(`${Config.apiUrl}/lift/?limit=20&offset=0`, { withCredentials: true });

                const resWorkout: { data: getWorkoutResponse } = await axios.get(`${Config.apiUrl}/lift/workout/`, { withCredentials: true });

                setLifts(resLift.data.liftArray);
                setWorkouts(resWorkout.data.workouts);

                setFilterLifts(resLift.data.liftArray.sort((a, b) => b.starred - a.starred));
                setFilterWorkouts(
                    resWorkout.data.workouts.sort(
                        (a, b) =>
                            (b.days?.toLowerCase().includes(today.toLowerCase()) ? 1 : 0) -
                            (a.days?.toLowerCase().includes(today.toLowerCase()) ? 1 : 0)
                    )
                );
            } catch (err) {
                console.error(err);
            }
        }
        getData();
        setSelectedLift({ id: -1, wId: -1, wName: "" });
        setSelectedWorkout({ id: -1, name: "" });
        return () => {};
    }, []);

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
                            <TextField
                                label="Start typing to search workouts"
                                variant="outlined"
                                className={classes.fullWidth}
                                onChange={(e) => {
                                    workoutSearchChange(e.target.value);
                                }}
                            />
                            <Link to={`${url}/createWorkout`} className={`${classes.link} ${classes.fullWidth}`}>
                                <BigButton type={0} text="" contrast={false}>
                                    <AddIcon color="action" />
                                    <Typography variant="subtitle1" color="text.primary">
                                        Add Workout
                                    </Typography>
                                </BigButton>
                            </Link>
                            <Typography variant="h5" color="text.primary" className={classes.marginTop}>
                                Today
                            </Typography>
                            <hr className={classes.hr} />
                            {filterWorkouts.map((workout, idx) => (
                                <>
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
                                    <WorkoutCard
                                        key={workout.id}
                                        handleClick={handleWorkoutClick}
                                        workoutObj={workout}
                                        selected={selectedWorkout.id === workout.id}
                                    />
                                </>
                            ))}
                        </Grid>
                        {/* Lift Section */}
                        <Grid container item xs={4} direction="column" spacing={2}>
                            <Typography variant="h4" color="text.primary">
                                Lifts
                            </Typography>
                            <hr className={classes.hr} />
                            <TextField
                                label="Start typing to search lifts"
                                variant="outlined"
                                className={classes.fullWidth}
                                onChange={(e) => {
                                    liftSearchChange(e.target.value);
                                }}
                            />
                            <Link to={`${url}/createLift`} className={`${classes.link} ${classes.fullWidth}`}>
                                <BigButton type={0} text="" contrast={false}>
                                    <AddIcon color="action" />
                                    <Typography variant="subtitle1" color="text.primary">
                                        Add Lift
                                    </Typography>
                                </BigButton>
                            </Link>
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
                        </Grid>
                        {/* Add lift set section */}
                        <Grid container item xs={3} direction="column" alignItems="center" spacing={2}>
                            <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                Click on a lift to quickly add a set here.
                            </Typography>
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
