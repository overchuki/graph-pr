import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useHistory, Link, useLocation, useParams } from "react-router-dom";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import { Button, CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import {
    liftObj,
    liftSetFull,
    snackbarType,
    liftSetAllInfo,
    datesetArr,
    tooltipStrings,
    ErrorType,
    onChangeFuncStr,
    HTTPBasicResponse,
    workoutShort,
    workoutObj,
} from "../../global/globalTypes";
import ChartWrapper from "../../components/datadisplay/ChartWrapper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import CheckWithLabel from "../../components/inputs/CheckWithLabel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import WorkoutDialog from "../../components/lifting/WorkoutsDialog";
import { capitalizeFirstLetter, compareTwoArrays } from "../../components/util";
import ConfirmDialogWrapper from "../../components/inputs/ConfirmDialogWrapper";
import AddLiftSet from "../../components/lifting/AddLiftSet";

const PREFIX = "LiftView";
const classes = {
    halfWidth: `${PREFIX}-halfWidth`,
    marginTop: `${PREFIX}-marginTop`,
    marginLeft: `${PREFIX}-marginLeft`,
    marginTopSml: `${PREFIX}-marginTopSml`,
    hr: `${PREFIX}-hr`,
    outline: `${PREFIX}-outline`,
    outlineNoMrg: `${PREFIX}-outlineNoMrg`,
    label: `${PREFIX}-label`,
    smlIcon: `${PREFIX}-smlIcon`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.halfWidth}`]: {
        width: "40%",
        padding: "30px",
        margin: "auto",
    },
    [`& .${classes.marginTop}`]: {
        marginTop: "30px",
    },
    [`& .${classes.marginLeft}`]: {
        marginLeft: "10px",
    },
    [`& .${classes.marginTopSml}`]: {
        marginTop: "10px",
    },
    [`& .${classes.hr}`]: {
        width: "90%",
        borderColor: theme.palette.grey[500],
        background: theme.palette.grey[500],
    },
    [`& .${classes.outline}`]: {
        border: "solid 2px",
        borderColor: theme.palette.grey[600],
        borderRadius: "5px",
        margin: "0 10px",
        padding: "0",
    },
    [`& .${classes.outlineNoMrg}`]: {
        border: "solid 1px",
        borderColor: theme.palette.grey[600],
        borderRadius: "5px",
        margin: "5px 0",
        padding: "20px 15px 20px 0",
    },
    [`& .${classes.label}`]: {
        color: theme.palette.text.secondary,
    },
    [`& .${classes.smlIcon}`]: {
        transform: "scale(0.8)",
    },
}));

interface Props {}

type LocationState = {
    from: {
        pathname: string;
    };
    snackBarStatus?: boolean;
};

const LiftView: React.FC<Props> = () => {
    const GRAPH_PADDING = 40;

    const location = useLocation<LocationState>();
    const history = useHistory();
    const params: { id?: string } = useParams();

    // ------------------------------------------
    // SNACKBAR OPTIONS
    // ------------------------------------------
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

    // ------------------------------------------
    // SNACKBAR OPTIONS END
    // ------------------------------------------

    // ------------------------------------------
    // LIFT OPTIONS
    // ------------------------------------------

    const [updateState, setUpdateState] = useState<boolean>(false);

    const [lift, setLift] = useState<liftObj>();
    const [setsWithParent, setSetsWithParent] = useState<liftSetAllInfo[]>([]);

    const [setsInput, setSetsInput] = useState<datesetArr[]>([]);
    const [tooltipLabelArr, setTooltipLabelArr] = useState<tooltipStrings[]>([]);
    const [selectedArr, setSelectedArr] = useState<boolean[]>([]);
    const [topSetIdx, setTopSetIdx] = useState<number>(-1);

    const [xRange, setXRange] = useState<[string, string]>(["", ""]);
    const [yRange, setYRange] = useState<[number, number]>([0, 100]);

    const goBackToLifting = () => {
        history.push("/lifting", { snackBarStatusRoot: false });
    };

    const roundToTen = (val: number, dir: number): number => {
        let temp = val / 10;

        if (dir === -1) temp = Math.round(temp);
        else if (dir === 0) temp = Math.floor(temp);
        else if (dir === 1) temp = Math.ceil(temp);

        return temp * 10;
    };

    const configureLiftSets = (s: liftSetFull[]) => {
        let tempSetsArray: datesetArr[] = [];
        let tempLabelArray: tooltipStrings[] = [];
        let topSetArray: datesetArr = [];

        let tempXRange: [string, string] = ["", ""];
        let tempYRange: [number, number] = [0, 100];

        let tempSetsWithParent: liftSetAllInfo[] = [];

        if (s.length > 0) {
            let curDate = "";
            let curSetIter = 0;

            let curSetWithParent: liftSetAllInfo | null = null;

            tempYRange = [parseInt(s[0].theomax), parseInt(s[0].theomax)];

            for (let i = 0; i < s.length; i++) {
                let cur = s[i];
                if (i === 0) tempXRange[0] = cur.date;
                if (i === s.length - 1) tempXRange[1] = cur.date;

                if (parseInt(cur.theomax) > tempYRange[1]) tempYRange[1] = parseInt(cur.theomax);
                if (parseInt(cur.theomax) < tempYRange[0]) tempYRange[0] = parseInt(cur.theomax);

                if (cur.date !== curDate) {
                    curDate = cur.date;
                    curSetIter++;
                    tempLabelArray.push({ title: "", label: [], footer: cur.top_set ? `Top set: ${cur.top_set}` : "" });

                    if (curSetWithParent !== null) {
                        tempSetsWithParent.push(curSetWithParent);
                    }

                    curSetWithParent = {
                        parent: {
                            date: s[i].date,
                            notes: s[i].notes,
                            set_quantity: s[i].set_quantity,
                            top_set: s[i].top_set,
                        },
                        sets: [],
                    };
                }

                curSetWithParent?.sets.push({ reps: s[i].reps, weight: s[i].weight, theomax: s[i].theomax });

                if (tempSetsArray.length < cur.set_num) tempSetsArray.push([]);
                tempSetsArray[cur.set_num - 1].push({ x: cur.date, y: parseInt(cur.theomax) });

                if (tempLabelArray[curSetIter - 1].label.length < cur.set_num) {
                    tempLabelArray[curSetIter - 1].label.push(`${cur.set_num}: ${cur.weight} for ${cur.reps}. (Theo: ${cur.theomax})`);
                }

                if (cur.set_num === cur.top_set) {
                    topSetArray.push({ x: cur.date, y: parseInt(cur.theomax) });
                }
            }

            if (curSetWithParent !== null) {
                tempSetsWithParent.push(curSetWithParent);
            }

            tempYRange[0] -= GRAPH_PADDING;
            tempYRange[1] += GRAPH_PADDING;
            if (tempYRange[0] < 0) tempYRange[0] = 0;
            else tempYRange[0] = roundToTen(tempYRange[0], 0);

            tempYRange[1] = roundToTen(tempYRange[1], 1);

            setXRange(tempXRange);
            setYRange(tempYRange);
        }

        setSetsWithParent(tempSetsWithParent);

        tempSetsArray.push(topSetArray);
        let tempSelectedArray: boolean[] = [];
        for (let i = 0; i < tempSetsArray.length; i++) {
            if (i === tempSetsArray.length - 1) tempSelectedArray.push(true);
            else tempSelectedArray.push(false);
        }

        setTopSetIdx(tempSetsArray.length - 1);
        setTooltipLabelArr(tempLabelArray);

        setSelectedArr(tempSelectedArray);
        setSetsInput(tempSetsArray);
    };

    const handleGraphChecked = (i: number, checked: boolean) => {
        let newSelectedArr = [...selectedArr];
        newSelectedArr[i] = checked;
        setSelectedArr(newSelectedArr);
    };

    const updateLiftState = () => {
        setUpdateState(!updateState);
    };

    // ------------------------------------------
    // LIFT OPTIONS END
    // ------------------------------------------

    // ------------------------------------------
    // WORKOUT DIALOG OPTIONS
    // ------------------------------------------

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [workoutArray, setWorkoutArray] = useState<workoutObj[]>([]);

    const getWorkoutIDs = (workoutArr: workoutShort[]): number[] => {
        return workoutArr.map((w) => w.id);
    };

    const onDialogSave = async (workoutArr: number[] | null) => {
        setOpenDialog(false);
        if (workoutArr && lift) {
            if (!compareTwoArrays(workoutArr, getWorkoutIDs(lift.workouts))) {
                try {
                    const res: { data: HTTPBasicResponse } = await axios.put(
                        `${Config.apiUrl}/lift/${lift.id}/workout/`,
                        { workoutIDs: workoutArr },
                        { withCredentials: true }
                    );
                    if (res.data.success) {
                        setUpdateState(!updateState);
                        openSnackbar(capitalizeFirstLetter(res.data.success), "success");
                    } else if (res.data.error) {
                        openSnackbar(capitalizeFirstLetter(res.data.error), "error");
                    } else {
                        openSnackbar("Issue updating workouts.", "error");
                    }
                } catch (err) {
                    openSnackbar("Issue updating workouts.", "error");
                }
            }
        }
    };

    // ------------------------------------------
    // WORKOUT DIALOG OPTIONS END
    // ------------------------------------------

    // ------------------------------------------
    // EDIT LIFT OPTIONS
    // ------------------------------------------

    // 0: not editing, 1: editing, 2: editing but nothing changed, so disable, 3: submited, loading symbol
    const [editLiftStatus, setEditLiftStatus] = useState<number>(0);

    const [editLiftName, setEditLiftName] = useState<string>("");
    const [editLiftNameDiff, setEditLiftNameDiff] = useState<boolean>(false);
    const [editLiftNameErr, setEditLiftNameErr] = useState<ErrorType>("");

    const [editLiftUnit, setEditLitUnit] = useState<number>(-1);
    const [editLiftUnitDiff, setEditLiftUnitDiff] = useState<boolean>(false);

    const handleLiftNameChange: onChangeFuncStr = (val) => {
        setEditLiftName(val);

        if (lift?.name === val) {
            setEditLiftStatus(2);
            setEditLiftNameDiff(false);
        } else {
            setEditLiftStatus(1);
            setEditLiftNameDiff(true);
        }

        return { error: false, overwrite: false, returnError: false };
    };

    const handleLiftUnitChange = (unitVal: number) => {
        setEditLitUnit(unitVal);

        if (lift?.unit_fk === unitVal) {
            setEditLiftStatus(2);
            setEditLiftUnitDiff(false);
        } else {
            setEditLiftStatus(1);
            setEditLiftUnitDiff(true);
        }
    };

    const handleEditLift = () => {
        if (lift) {
            setEditLiftName(lift.name);
            setEditLitUnit(lift.unit_fk);
        }
        setEditLiftStatus(2);
    };

    const handleSaveLift = async () => {
        if (editLiftNameErr === false) return;
        setEditLiftStatus(3);

        let data = {
            name: editLiftNameDiff ? editLiftName : null,
            unit_fk: editLiftUnitDiff ? editLiftUnit : null,
        };

        try {
            const res: { data: HTTPBasicResponse } = await axios.put(`${Config.apiUrl}/lift/${lift?.id}/`, data, { withCredentials: true });
            if (res.data.success) {
                setUpdateState(!updateState);
                openSnackbar(capitalizeFirstLetter(res.data.success), "success");
            } else if (res.data.error) {
                openSnackbar(capitalizeFirstLetter(res.data.error), "error");
            } else {
                openSnackbar("Issue updating lift.", "error");
            }
        } catch (err) {
            openSnackbar("Issue updating lift.", "error");
        }

        setEditLiftStatus(0);
    };

    const handleCancelEdit = () => {
        if (lift) {
            setEditLiftName(lift.name);
            setEditLitUnit(lift.unit_fk);
        }
        setEditLiftStatus(0);
    };

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const handleDeleteLift = () => {
        setOpenDeleteDialog(true);
    };

    const cancelDeleteLift = () => {
        setOpenDeleteDialog(false);
    };

    const confirmDeleteLift = async () => {
        setOpenDeleteDialog(false);
        try {
            const res: { data: HTTPBasicResponse } = await axios.delete(`${Config.apiUrl}/lift/${lift?.id}/`, { withCredentials: true });
            if (res.data.success) {
                history.push("/lifting", { snackBarStatusRoot: true, snackBarMessage: "Lift has been deleted" });
            } else if (res.data.error) {
                openSnackbar(capitalizeFirstLetter(res.data.error), "error");
            } else {
                openSnackbar("Issue deleting lift.", "error");
            }
        } catch (err) {
            openSnackbar("Issue deleting lift.", "error");
        }
    };

    const goToLiftSetView = () => {
        history.push(`/lifting/liftSetView/${lift?.id}`, { liftSets: setsWithParent });
    };

    // ------------------------------------------
    // EDIT LIFT OPTIONS END
    // ------------------------------------------

    useEffect(() => {
        async function getLiftData() {
            if (params.id) {
                const res: { data: { liftInfo: liftObj; liftSets: liftSetFull[] } } = await axios.get(`${Config.apiUrl}/lift/${params.id}/single`, {
                    withCredentials: true,
                });
                setLift(res.data.liftInfo);
                configureLiftSets(res.data.liftSets);
            }

            let ws: { data: { workouts: workoutObj[] } } = await axios.get(`${Config.apiUrl}/lift/workout`, { withCredentials: true });
            setWorkoutArray(ws.data.workouts);
        }
        getLiftData();

        if (location.state && location.state.snackBarStatus) {
            openSnackbar("Lift Created", "success");
        }
    }, [location.state, params.id, updateState]);

    return (
        <Root>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="column" spacing={2}>
                <Grid item container direction="row" className={classes.marginTop}>
                    <Grid item container justifyContent="center" xs={1}>
                        <IconButton onClick={goBackToLifting}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Grid>
                    <Grid item container justifyContent="center" xs={10}>
                        <Typography variant="h4" color="text.secondary">
                            {lift?.name}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container direction="row">
                    <Grid item container xs={1} alignItems="center" direction="column" className={classes.outline}>
                        <Typography variant="subtitle1" color="text.secondary" className={classes.marginTopSml}>
                            Data Display
                        </Typography>
                        <hr className={classes.hr} />
                        {selectedArr.map((s, i) => (
                            <Grid item key={i}>
                                {i !== selectedArr.length - 1 ? (
                                    <CheckWithLabel
                                        onCheckChange={handleGraphChecked}
                                        label={`Set ${i + 1}`}
                                        value={i}
                                        controlled
                                        checked={selectedArr[i]}
                                    />
                                ) : (
                                    <CheckWithLabel
                                        onCheckChange={handleGraphChecked}
                                        label={`Top Sets`}
                                        value={i}
                                        controlled
                                        checked={selectedArr[i]}
                                        color="warning"
                                    />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                    <Grid item xs={10}>
                        <ChartWrapper
                            numArrays={setsInput}
                            selectedArr={selectedArr}
                            title=""
                            showTitle={false}
                            highlightIndex={topSetIdx}
                            tooltipBools={{ title: false, label: true, footer: true }}
                            tooltipLabels={tooltipLabelArr}
                            xRange={xRange}
                            yRange={yRange}
                        />
                    </Grid>
                </Grid>
                <Grid item></Grid>
                <Grid item container direction="row" spacing={3}>
                    <Grid item container direction="row" xs={3} justifyContent="center">
                        <Grid item container direction="column" xs={11} className={classes.outlineNoMrg} spacing={2}>
                            <Grid item container direction="row">
                                <Grid item xs={1}></Grid>
                                <Grid item xs={2}>
                                    <Typography variant="h4" color="text.secondary">
                                        Info
                                    </Typography>
                                </Grid>
                                <Grid item container xs={8} justifyContent="flex-end">
                                    {editLiftStatus === 3 ? <CircularProgress color="primary" /> : ""}
                                    {editLiftStatus === 0 ? (
                                        <Button color="info" variant="outlined" onClick={handleEditLift}>
                                            <EditIcon />
                                        </Button>
                                    ) : (
                                        <Button variant="outlined" onClick={handleSaveLift} color="success" disabled={editLiftStatus === 2}>
                                            <CheckIcon />
                                        </Button>
                                    )}
                                    {editLiftStatus === 0 ? (
                                        <Button variant="outlined" onClick={handleDeleteLift} className={classes.marginLeft} color="error">
                                            <DeleteIcon />
                                        </Button>
                                    ) : (
                                        <Button variant="outlined" onClick={handleCancelEdit} className={classes.marginLeft} color="warning">
                                            <CloseIcon />
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                            <br />
                            {editLiftStatus === 0 ? (
                                <Grid item container direction="row">
                                    <Grid item xs={1}></Grid>
                                    <Typography color="text.secondary" variant="h6">
                                        Name: {lift?.name}
                                    </Typography>
                                </Grid>
                            ) : (
                                <Grid item container direction="row">
                                    <Grid item xs={1}></Grid>
                                    <InputField
                                        label={"Edit Lift Name"}
                                        type={"text"}
                                        value={editLiftName}
                                        controlled={true}
                                        setValue={setEditLiftNameErr}
                                        errorOverwrite={false}
                                        autoComplete={""}
                                        size={6}
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
                                        onChange={handleLiftNameChange}
                                    />
                                </Grid>
                            )}
                            {editLiftStatus === 0 ? (
                                <Grid item container direction="row">
                                    <Grid item xs={1}></Grid>
                                    <Typography color="text.secondary" variant="h6">
                                        Unit: {lift?.plur_abbr}
                                    </Typography>
                                </Grid>
                            ) : (
                                <Grid item container direction="row">
                                    <Grid item xs={1}></Grid>
                                    <FormControl>
                                        <FormLabel>Unit</FormLabel>
                                        <RadioGroup
                                            row
                                            value={editLiftUnit}
                                            onChange={(e) => {
                                                let val = 2;
                                                try {
                                                    val = parseInt(e.target.value);
                                                    handleLiftUnitChange(val);
                                                } catch (err) {
                                                    handleLiftUnitChange(val);
                                                }
                                            }}
                                        >
                                            <FormControlLabel value={2} className={classes.label} control={<Radio />} label="Lbs" />
                                            <FormControlLabel value={1} className={classes.label} control={<Radio />} label="Kgs" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            )}
                            <Grid item container direction="row" alignItems="center">
                                <Grid item xs={1}></Grid>
                                <Grid item>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        Workout:
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton
                                        onClick={() => {
                                            setOpenDialog(true);
                                        }}
                                    >
                                        <EditIcon color="info" className={classes.smlIcon} />
                                    </IconButton>
                                </Grid>
                                <Grid item>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {lift?.workouts.map((w, i) => {
                                            if (i === lift?.workouts.length - 1) return w.name;
                                            return w.name + ", ";
                                        })}
                                        {lift?.workouts.length === 0 ? "None" : ""}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" xs={3} justifyContent="center">
                        <Grid item container direction="column" xs={11} spacing={2} className={classes.outlineNoMrg}>
                            <Grid item container direction="row">
                                <Grid item xs={1}></Grid>
                                <Grid item xs={2}>
                                    <Typography variant="h6" color="text.secondary">
                                        Performance
                                    </Typography>
                                </Grid>
                            </Grid>
                            <br />
                            <Grid item container direction="row" spacing={2}>
                                <Grid item container justifyContent="flex-end" xs={3}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Max:
                                    </Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {lift && lift.max && lift.max_reps && lift.max_date
                                            ? `${lift.max} ${lift.plur_abbr} for ${lift.max_reps}. (${new Date(lift.max_date).toDateString()})`
                                            : "--"}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid item container direction="row" spacing={2}>
                                <Grid item container justifyContent="flex-end" xs={3}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Theomax:
                                    </Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {lift && lift.theomax && lift.theomax_reps && lift.theomax_date
                                            ? `${lift.theomax} ${lift.plur_abbr}. ${lift.theomax_weight} for ${lift.theomax_reps}. (${new Date(
                                                  lift.theomax_date
                                              ).toDateString()})`
                                            : "--"}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid item container direction="row" spacing={2}>
                                <Grid item container justifyContent="flex-end" xs={3}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Duration:
                                    </Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {lift && lift.duration ? `${lift.duration} days` : "--"}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid item container direction="row">
                                <Grid item xs={1}></Grid>
                                <Grid item xs={11}>
                                    <Button onClick={goToLiftSetView} variant="outlined" color="info">
                                        View and Edit Lift Sets
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" xs={3} justifyContent="center">
                        <Grid item container direction="column" xs={11} className={classes.outlineNoMrg}>
                            <Grid item container direction="column" xs={3} spacing={2}>
                                <Grid item container direction="row">
                                    <Grid item xs={1}></Grid>
                                    <Grid item xs={11}>
                                        <Typography variant="h6" color="text.secondary">
                                            Latest (
                                            {setsWithParent.length > 0
                                                ? new Date(setsWithParent[setsWithParent.length - 1].parent.date).toDateString()
                                                : ""}
                                            )
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <br />
                                {setsWithParent.length > 0
                                    ? setsWithParent[setsWithParent.length - 1].sets.map((s, i) => (
                                          <Grid key={i} item container direction="row">
                                              <Grid item xs={1}></Grid>
                                              <Grid item xs={11}>
                                                  <Typography
                                                      variant="subtitle1"
                                                      color={
                                                          i + 1 === setsWithParent[setsWithParent.length - 1].parent.top_set
                                                              ? "text.primary"
                                                              : "text.secondary"
                                                      }
                                                  >
                                                      {i + 1}: {s.weight} {lift?.plur_abbr} for {s.reps} ({s.theomax} theomax).
                                                  </Typography>
                                              </Grid>
                                          </Grid>
                                      ))
                                    : ""}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container direction="column" xs={3} alignItems="center">
                        {lift ? <AddLiftSet id={lift.id} updateState={updateLiftState} name={lift.name} unit={lift.plur_abbr} /> : ""}
                    </Grid>
                </Grid>
            </Grid>
            <WorkoutDialog
                id="workoutDialog"
                keepMounted
                open={openDialog}
                onSaveParent={onDialogSave}
                workoutsProp={workoutArray}
                selectedWorkoutsProp={lift ? getWorkoutIDs(lift.workouts) : []}
            />
            <ConfirmDialogWrapper
                agreeStr="Delete"
                cancelStr="Cancel"
                keepMounted
                message="Are you sure you want to delete your lift? This will remove all data associated with it and will not be recoverable."
                onConfirm={confirmDeleteLift}
                onDeny={cancelDeleteLift}
                open={openDeleteDialog}
                title="Delete Lift"
            />
        </Root>
    );
};

export default LiftView;
