import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from "react-router-dom";
import LiftView from "../components/lifting/LiftView";
import WorkoutView from "../components/lifting/WorkoutView";

interface liftObj {
    id: number;
    name: string;
    plur_abbr: string;
    max: number | null;
    max_reps: number | null;
    max_date: string | null;
    theomax: number | null;
    theomax_weight: number | null;
    theomax_reps: number | null;
    theomax_date: string | null;
    workout_name: string | null;
    created_at: string;
    duration: number | null;
}

interface workoutObj {
    id: number;
    name: string;
    description: string | null;
    days: string | null;
    liftCnt: number;
    created_at: string;
}

// type = 0: for lift
// type = 1: for workout
interface selectedCard {
    cardType: number;
    id: number;
}

const Lifting: React.FC = () => {
    let { path, url } = useRouteMatch();

    const [selectedCard, setSelectedCard] = useState<selectedCard>({ cardType: -1, id: -1 });

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

    useEffect(() => {
        // gets "Workout" and "Lift"
        return () => {};
    }, []);

    return (
        <Switch>
            <Route exact path={path}>
                <Grid container direction="row">
                    <Grid container item xs={4} direction="column">
                        Workouts here
                    </Grid>
                    <Grid container item xs={4} direction="column">
                        Lifts here
                    </Grid>
                    <Grid container item xs={4} direction="column">
                        Info panel
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
    );
};

export default Lifting;
