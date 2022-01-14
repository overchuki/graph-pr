import Config from "../Config";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import LiftView from "./lifting/LiftView";
import WorkoutView from "./lifting/WorkoutView";
import axios from "axios";
import { liftObj, workoutObj, getLiftResponse, getWorkoutResponse } from "../global/globalTypes";
import LiftCard from "../components/lifting/LiftCard";
import { styled } from "@mui/material/styles";
import WorkoutCard from "../components/lifting/WorkoutCard";
import { Typography } from "@mui/material";

interface selectedLift {
    id: number;
    wId: number;
}

const PREFIX = "Lifting";
const classes = {
    mainPage: `${PREFIX}-mainPage`,
    marginTop: `${PREFIX}-marginTop`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.mainPage}`]: {
        marginTop: "0",
    },
    [`& .${classes.marginTop}`]: {
        marginTop: "20px",
    },
}));

const Lifting: React.FC = () => {
    let { path } = useRouteMatch();
    const daysArr = ["M", "T", "W", "R", "F", "S", "U"];
    const daysFullArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let today = daysArr[new Date().getDay()];

    const [selectedLift, setSelectedLift] = useState<selectedLift>({ id: -1, wId: -1 });
    const [selectedWorkout, setSelectedWorkout] = useState<number>(-1);

    const [lifts, setLifts] = useState<liftObj[]>([]);
    const [workouts, setWorkouts] = useState<workoutObj[]>([]);

    const [filterLifts, setFilterLifts] = useState<liftObj[]>([]);
    const [filterWorkouts, setFilterWorkouts] = useState<workoutObj[]>([]);

    const liftSearchChange = (): void => {
        // set the filters for the lifts
    };

    const workoutSearchChange = (): void => {
        // set the filters for the workouts
    };

    const handleLiftClick = (selected: boolean, id: number) => {
        if (selected) {
            setSelectedLift({ id: -1, wId: -1 });
        } else {
            let workId = lifts.find((lift) => lift.id === id)?.workout_id;
            if (!workId) workId = -1;

            setSelectedLift({ id: id, wId: workId });
        }
    };

    const handleWorkoutClick = (selected: boolean, id: number) => {
        if (selected) {
            setSelectedWorkout(-1);
        } else {
            if (selectedLift.wId !== id) setSelectedLift({ id: -1, wId: -1 });
            setSelectedWorkout(id);
        }
    };

    useEffect(() => {
        async function getData() {
            try {
                const resLift: { data: getLiftResponse } = await axios.get(`${Config.apiUrl}/lift/?limit=20&offset=0`, { withCredentials: true });

                const resWorkout: { data: getWorkoutResponse } = await axios.get(`${Config.apiUrl}/lift/workout/`, { withCredentials: true });

                setLifts(resLift.data.liftArray);
                setFilterLifts(resLift.data.liftArray);

                setWorkouts(resWorkout.data.workouts);
                setFilterWorkouts(resWorkout.data.workouts);
            } catch (err) {
                console.error(err);
            }
        }
        getData();
        setSelectedLift({ id: -1, wId: -1 });
        setSelectedWorkout(-1);
        return () => {};
    }, []);

    return (
        <Root>
            <Switch>
                <Route exact path={path}>
                    <Grid container direction="row" className={classes.mainPage} spacing={3}>
                        <Grid container item xs={4} direction="column" alignItems="center" spacing={2}>
                            {filterWorkouts.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    handleClick={handleWorkoutClick}
                                    workoutObj={workout}
                                    selected={selectedWorkout === workout.id}
                                />
                            ))}
                        </Grid>
                        <Grid container item xs={4} direction="column" alignItems="center" spacing={2}>
                            {filterLifts.map((lift) => (
                                <LiftCard
                                    key={lift.id}
                                    liftObj={lift}
                                    workoutArr={workouts}
                                    handleClick={handleLiftClick}
                                    selected={selectedLift.id === lift.id}
                                />
                            ))}
                        </Grid>
                        <Grid container item xs={4} direction="column" alignItems="center" spacing={2}>
                            <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                                Click on a lift or workout to view the quick menu here
                            </Typography>
                        </Grid>
                    </Grid>
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
