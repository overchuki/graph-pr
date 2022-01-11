import Config from "../Config";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { BrowserRouter as Router, Switch, Route, Link, useParams, useRouteMatch } from "react-router-dom";
import LiftView from "../components/lifting/LiftView";
import WorkoutView from "../components/lifting/WorkoutView";
import axios from "axios";
import { liftObj, workoutObj, getLiftResponse, getWorkoutResponse } from "../global/globalTypes";
import LiftCard from "../components/lifting/LiftCard";
import { styled } from "@mui/material/styles";
import WorkoutCard from "../components/lifting/WorkoutCard";
import { Typography } from "@mui/material";

// type = 0: for lift
// type = 1: for workout
interface selectedCard {
    cardType: number;
    id: number;
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

    const handleLiftClick = (selected: boolean, id: number) => {
        if (selected) {
            setSelectedCard({ cardType: -1, id: -1 });
        } else {
            setSelectedCard({ cardType: 0, id: id });
        }
    };

    const handleWorkoutClick = (selected: boolean, id: number) => {
        if (selected) {
            setSelectedCard({ cardType: -1, id: -1 });
        } else {
            setSelectedCard({ cardType: 1, id: id });
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
                                    workoutObj={workout}
                                    selected={selectedCard.cardType === 1 && selectedCard.id === workout.id}
                                />
                            ))}
                        </Grid>
                        <Grid container item xs={4} direction="column" alignItems="center" spacing={2}>
                            {filterLifts.map((lift) => (
                                <LiftCard
                                    key={lift.id}
                                    liftObj={lift}
                                    handleClick={handleLiftClick}
                                    selected={selectedCard.cardType === 0 && selectedCard.id === lift.id}
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
