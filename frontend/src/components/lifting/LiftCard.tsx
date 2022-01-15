import Config from "../../Config";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Link, useRouteMatch } from "react-router-dom";
import { liftObj, workoutObj, onChangeFuncNum } from "../../global/globalTypes";
import DropdownField from "../inputs/DropdownField";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { Rating } from "@mui/material";

interface Props {
    liftObj: liftObj;
    selected: boolean;
    handleClick: (selected: boolean, id: number) => void;
    updateLiftState: (id: number, workout: boolean, workoutId: number, prevWorkoutId: number, starred: boolean, starredVal: number) => void;
    workoutArr: workoutObj[];
}

const PREFIX = "LiftCard";
const classes = {
    card: `${PREFIX}-card`,
    selectedCard: `${PREFIX}-selected-card`,
    btn: `${PREFIX}-btn`,
    txt: `${PREFIX}-txt`,
    link: `${PREFIX}-link`,
    mrgTop: `${PREFIX}-mrgTop`,
    smlIcon: `${PREFIX}-smlIcon`,
    marginBtm: `${PREFIX}-marginBtm`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.card}`]: {
        width: "100%",

        "&:hover": {
            cursor: "pointer",
        },
    },
    [`& .${classes.btn}`]: {
        textTransform: "none",
        backgroundColor: theme.palette.primary.dark,

        "&:hover": {
            backgroundColor: theme.palette.warning.main,
        },
    },
    [`& .${classes.selectedCard}`]: {
        width: "100%",
        backgroundColor: theme.palette.common.black,

        "&:hover": {
            cursor: "pointer",
        },
    },
    [`& .${classes.txt}`]: {
        cursor: "text",
        marginRight: "5px",
    },
    [`& .${classes.link}`]: {
        textDecoration: "none",
        margin: "10px",
    },
    [`& .${classes.mrgTop}`]: {
        marginTop: "5px",
    },
    [`& .${classes.smlIcon}`]: {
        transform: "scale(0.8)",
    },
    [`& .${classes.marginBtm}`]: {
        marginBottom: "10px",
    },
}));

const LiftCard: React.FC<Props> = ({ liftObj, selected, handleClick, updateLiftState, workoutArr }) => {
    let { url } = useRouteMatch();

    const [editWorkout, setEditWorkout] = useState<boolean>(false);
    const [workoutId, setWorkoutId] = useState<number>(liftObj.workout_id || -1);
    const [disableWorkoutChange, setDisableWorkoutChange] = useState<boolean>(false);

    const [disableStarredChange, setDisableStarredChange] = useState<boolean>(false);

    let workoutArrVals: [number, string][] = [[-1, "None"]];
    for (let i = 0; i < workoutArr.length; i++) {
        workoutArrVals.push([workoutArr[i].id, workoutArr[i].name]);
    }

    const onWorkoutChange: onChangeFuncNum = (val) => {
        async function setWorkout() {
            let prevWID: number = liftObj.workout_id || -1;
            await axios.put(`${Config.apiUrl}/lift/${liftObj.id}`, { workout_fk: val, prevWID }, { withCredentials: true });

            updateLiftState(liftObj.id, true, val, prevWID, false, -1);
            setEditWorkout(false);
            setDisableWorkoutChange(false);
        }
        setDisableWorkoutChange(true);

        setWorkout();

        return { returnError: false, error: false, overwrite: false };
    };

    const onStarredChange: onChangeFuncNum = (val) => {
        async function setStarred() {
            let boolVal = val === 1;
            await axios.put(`${Config.apiUrl}/lift/${liftObj.id}`, { starred: boolVal }, { withCredentials: true });

            updateLiftState(liftObj.id, false, -1, -1, true, val);
            setDisableStarredChange(false);
        }
        setDisableStarredChange(true);

        setStarred();

        return { returnError: false, error: false, overwrite: false };
    };

    return (
        <Root
            style={{ width: "100%", margin: "10px 0" }}
            onClick={(e: any) => {
                if (e.target.nodeName === "DIV") handleClick(selected, liftObj.id);
            }}
        >
            <Grid item>
                <Card className={selected ? classes.selectedCard : classes.card}>
                    <CardContent>
                        {/* Title of the card with units */}
                        <Grid container direction="row">
                            <Grid item container xs={6} direction="row">
                                <Typography variant="h5" color="text.primary" gutterBottom className={classes.txt}>
                                    {liftObj.name}
                                </Typography>

                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    ({liftObj.plur_abbr})
                                </Typography>
                            </Grid>
                            <Grid item container xs={6} justifyContent="flex-end" direction="row">
                                <Rating
                                    disabled={disableStarredChange}
                                    value={liftObj.starred}
                                    max={1}
                                    onChange={(e, v) => {
                                        onStarredChange(v || 0);
                                    }}
                                />
                            </Grid>
                        </Grid>
                        {/* First row with maxes, theomaxes, and workout */}
                        <Grid container direction="row">
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={classes.txt}>
                                    Max: {liftObj.max ? liftObj.max : "---"}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={classes.txt}>
                                    Theo Max: {liftObj.theomax ? liftObj.theomax : "---"}
                                </Typography>
                            </Grid>
                            <Grid item container direction="row" xs={4} alignItems="center">
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={`${classes.txt} ${classes.mrgTop}`}>
                                    Workout:
                                </Typography>
                                <IconButton
                                    onClick={() => {
                                        setEditWorkout(!editWorkout);
                                    }}
                                >
                                    {editWorkout ? <CancelIcon className={classes.smlIcon} /> : <EditIcon className={classes.smlIcon} />}
                                </IconButton>
                            </Grid>
                        </Grid>
                        {/* Secondary row with details */}
                        <Grid container direction="row">
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.max ? `${liftObj.max} for ${liftObj.max_reps}` : ""}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.max_date ? `${new Date(liftObj.max_date).toDateString()}` : ""}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.theomax_weight ? `${liftObj.theomax_weight} for ${liftObj.theomax_reps}` : ""}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.theomax_date ? `${new Date(liftObj.theomax_date).toDateString()}` : ""}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {editWorkout ? (
                                    <DropdownField
                                        label={null}
                                        variant="standard"
                                        defaultValue={workoutId}
                                        useDefault={false}
                                        setValue={setWorkoutId}
                                        onChange={onWorkoutChange}
                                        valuesArr={workoutArrVals}
                                        size={12}
                                        position={-1}
                                        errorOverwrite={false}
                                        disabled={disableWorkoutChange}
                                        verify={false}
                                        verifyObj={{
                                            name: "workout",
                                            required: false,
                                            range: [1, 2],
                                            int: true,
                                            email: false,
                                            ascii: false,
                                            dob: false,
                                            alphaNum: true,
                                        }}
                                    />
                                ) : (
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                        {liftObj.workout_name ? `${liftObj.workout_name}` : "None"}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Grid container direction="row" className={classes.marginBtm}>
                            <Grid item xs={3}>
                                <Link to={`${url}/lift/${liftObj.id}`} className={classes.link}>
                                    <Button variant="contained" size="medium" className={classes.btn}>
                                        Go To Lift
                                    </Button>
                                </Link>
                            </Grid>
                            <Grid item container xs={8} direction="row" justifyContent="flex-end">
                                <Typography variant="subtitle1" color="text.secondary" className={classes.txt}>
                                    Created on {new Date(liftObj.created_at).toDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardActions>
                </Card>
            </Grid>
        </Root>
    );
};

export default LiftCard;
