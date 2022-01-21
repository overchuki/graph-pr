import Config from "../../Config";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Link, useRouteMatch } from "react-router-dom";
import { liftObj, workoutObj, onChangeFuncNum, workoutShort, HTTPBasicResponse } from "../../global/globalTypes";
import WorkoutDialog from "./WorkoutsDialog";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { Box, Rating } from "@mui/material";
import SnackbarWrapper from "../SnackbarWrapper";

interface Props {
    liftObj: liftObj;
    selected: boolean;
    handleClick: (selected: boolean, id: number) => void;
    updateLiftState: () => void;
    workoutArr: workoutObj[];
}

type snackbarType = "success" | "info" | "warning" | "error";

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

    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarType, setSnackbarType] = useState<snackbarType>("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const [workoutString, setWorkoutString] = useState<string>("");

    const [disableStarredChange, setDisableStarredChange] = useState<boolean>(false);

    const getWorkoutIDs = (workoutArr: workoutShort[]): number[] => {
        return workoutArr.map((w) => w.id);
    };

    const capitalizeFirstLetter = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.substring(1, str.length);
    };

    const compareTwoArrays = (one: number[], two: number[]): boolean => {
        if (one.length !== two.length) return false;

        for (let i = 0; i < two.length; i++) {
            one.splice(one.indexOf(two[i]), 1);
        }
        if (one.length === 0) return true;

        return false;
    };

    const onDialogSave = async (workoutArr: number[] | null) => {
        setOpenDialog(false);
        if (workoutArr) {
            if (!compareTwoArrays(workoutArr, getWorkoutIDs(liftObj.workouts))) {
                const res: { data: HTTPBasicResponse } = await axios.put(
                    `${Config.apiUrl}/lift/${liftObj.id}/workout/`,
                    { workoutIDs: workoutArr },
                    { withCredentials: true }
                );
                if (res.data.success) {
                    updateLiftState();
                    openSnackbar(capitalizeFirstLetter(res.data.success), "success");
                } else if (res.data.error) {
                    openSnackbar(res.data.error, "error");
                } else {
                    openSnackbar("Issue updating workouts.", "error");
                }
            }
        }
    };

    const openSnackbar = (message: string, type: snackbarType) => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarOpen(true);
    };

    const onStarredChange: onChangeFuncNum = (val) => {
        async function setStarred() {
            let boolVal = val === 1;
            const res: { data: HTTPBasicResponse } = await axios.put(
                `${Config.apiUrl}/lift/${liftObj.id}`,
                { starred: boolVal },
                { withCredentials: true }
            );

            if (res.data.success) {
                updateLiftState();
                openSnackbar(capitalizeFirstLetter(res.data.success), "success");
            } else if (res.data.error) {
                openSnackbar(res.data.error, "error");
            } else {
                openSnackbar("Issue updating lift.", "error");
            }

            setDisableStarredChange(false);
        }
        setDisableStarredChange(true);

        setStarred();

        return { returnError: false, error: false, overwrite: false };
    };

    useEffect(() => {
        let tempWStr: string = "";
        for (let i = 0; i < liftObj.workouts.length; i++) {
            tempWStr += liftObj.workouts[i].name;
            if (i < liftObj.workouts.length - 1) tempWStr += ", ";
        }
        setWorkoutString(tempWStr);
    }, [liftObj]);

    return (
        <Root
            style={{ width: "100%", margin: "10px 0" }}
            onClick={(e: any) => {
                if (e.target.nodeName === "DIV") handleClick(selected, liftObj.id);
            }}
        >
            <Grid item>
                <SnackbarWrapper
                    open={snackbarOpen}
                    message={snackbarMessage}
                    type={snackbarType}
                    duration={3000}
                    handleClose={handleSnackbarClose}
                />
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
                            <Grid item xs={8}>
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={classes.txt}>
                                    Last Set Group{liftObj.lastSet ? ` (${new Date(liftObj.lastSet.parent.date).toDateString()})` : ""}:
                                </Typography>
                            </Grid>
                            <Grid item container direction="row" xs={4} alignItems="center">
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={`${classes.txt} ${classes.mrgTop}`}>
                                    Workout:
                                </Typography>
                                <IconButton
                                    onClick={() => {
                                        setOpenDialog(true);
                                    }}
                                >
                                    <EditIcon className={classes.smlIcon} />
                                </IconButton>
                            </Grid>
                        </Grid>
                        {/* Secondary row with details */}
                        <Grid container direction="row">
                            <Grid item xs={8}>
                                {liftObj.lastSet ? (
                                    liftObj.lastSet.sets.map((s, i) => (
                                        <Typography
                                            key={i}
                                            variant="subtitle1"
                                            color={s.set_num === liftObj.lastSet.parent.top_set ? "text.primary" : "text.secondary"}
                                            gutterBottom
                                            className={classes.txt}
                                        >
                                            {s.weight} for {s.reps} ({s.theomax} theomax).
                                        </Typography>
                                    ))
                                ) : (
                                    <Box sx={{ typography: "subtitle1", fontStyle: "italic", color: "text.secondary" }}>No lift sets exist.</Box>
                                )}
                            </Grid>
                            <Grid item xs={4}>
                                {liftObj.workouts.length > 0 ? (
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                        {workoutString}
                                    </Typography>
                                ) : (
                                    <Box sx={{ typography: "subtitle1", fontStyle: "italic", color: "text.secondary" }}>None.</Box>
                                )}
                            </Grid>
                        </Grid>
                        <WorkoutDialog
                            id="workoutDialog"
                            keepMounted
                            open={openDialog}
                            onSaveParent={onDialogSave}
                            workoutsProp={workoutArr}
                            selectedWorkoutsProp={getWorkoutIDs(liftObj.workouts)}
                        />
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
