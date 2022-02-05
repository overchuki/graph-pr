import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Switch, Route, useHistory, Link, useLocation, useParams } from "react-router-dom";
import { HTTPPostResponse, ErrorType, snackbarType } from "../../global/globalTypes";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import { Button, CircularProgress, Typography } from "@mui/material";
import { liftObj, liftSetFull, liftSetParent, liftSetAllInfo, datesetArr, tooltipStrings } from "../../global/globalTypes";
import ChartWrapper from "../../components/datadisplay/ChartWrapper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import CheckWithLabel from "../../components/inputs/CheckWithLabel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const PREFIX = "LiftView";
const classes = {
    halfWidth: `${PREFIX}-halfWidth`,
    marginTop: `${PREFIX}-marginTop`,
    marginLeft: `${PREFIX}-marginLeft`,
    marginTopSml: `${PREFIX}-marginTopSml`,
    hr: `${PREFIX}-hr`,
    outline: `${PREFIX}-outline`,
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
    const params: { id?: string } = useParams();

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

    const [lift, setLift] = useState<liftObj>();
    const [sets, setSets] = useState<liftSetFull[]>([]);
    const [setsWithParent, setSetsWithParent] = useState<liftSetAllInfo[]>([]);

    const [setsInput, setSetsInput] = useState<datesetArr[]>([]);
    const [tooltipLabelArr, setTooltipLabelArr] = useState<tooltipStrings[]>([]);
    const [selectedArr, setSelectedArr] = useState<boolean[]>([]);
    const [topSetIdx, setTopSetIdx] = useState<number>(-1);

    const [xRange, setXRange] = useState<[string, string]>(["", ""]);
    const [yRange, setYRange] = useState<[number, number]>([0, 100]);

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

        if (s.length > 0) {
            let curDate = "";
            let curSetIter = 0;

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
                }

                if (tempSetsArray.length < cur.set_num) tempSetsArray.push([]);
                tempSetsArray[cur.set_num - 1].push({ x: cur.date, y: parseInt(cur.theomax) });

                if (tempLabelArray[curSetIter - 1].label.length < cur.set_num) {
                    tempLabelArray[curSetIter - 1].label.push(`${cur.set_num}: ${cur.weight} for ${cur.reps}. (Theo: ${cur.theomax})`);
                }

                if (cur.set_num === cur.top_set) {
                    topSetArray.push({ x: cur.date, y: parseInt(cur.theomax) });
                }
            }

            tempYRange[0] -= GRAPH_PADDING;
            tempYRange[1] += GRAPH_PADDING;
            if (tempYRange[0] < 0) tempYRange[0] = 0;
            else tempYRange[0] = roundToTen(tempYRange[0], 0);

            tempYRange[1] = roundToTen(tempYRange[1], 1);

            setXRange(tempXRange);
            setYRange(tempYRange);
        }

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

    // 0: not editing, 1: editing, 2: editing but nothing changed, so disable
    const [editLiftStatus, setEditLiftStatus] = useState<number>(0);
    const [editLiftName, setEditLitName] = useState<string>("");
    const [editLiftUnit, setEditLitUnit] = useState<number>(-1);

    const handleLiftNameChange = () => {};
    const handleLiftUnitChange = () => {};

    const handleEditLift = () => {
        if (lift) {
            setEditLitName(lift.name);
            setEditLitUnit(lift.unit_fk);
        }
        setEditLiftStatus(2);
    };

    const handleSaveLift = () => {};

    const handleCancelEdit = () => {
        if (lift) {
            setEditLitName(lift.name);
            setEditLitUnit(lift.unit_fk);
        }
        setEditLiftStatus(0);
    };

    const handleDeleteLift = () => {};

    useEffect(() => {
        async function getLiftData() {
            if (params.id) {
                const res: { data: { liftInfo: liftObj; liftSets: liftSetFull[] } } = await axios.get(`${Config.apiUrl}/lift/${params.id}/single`, {
                    withCredentials: true,
                });
                setLift(res.data.liftInfo);
                setSets(res.data.liftSets);
                configureLiftSets(res.data.liftSets);
            }
        }
        getLiftData();

        if (location.state && location.state.snackBarStatus) {
            openSnackbar("Lift Created", "success");
        }
    }, [location.state, params.id]);

    return (
        <Root>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="column" spacing={3}>
                <Grid item container direction="row" className={classes.marginTop}>
                    <Grid item container justifyContent="center" xs={1}>
                        <Link to="/lifting">
                            <IconButton>
                                <ArrowBackIcon fontSize="large" />
                            </IconButton>
                        </Link>
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
                    <Grid item container direction="column" xs={3}>
                        <Grid item container direction="row">
                            <Grid item xs={1}></Grid>
                            <Grid item xs={1}>
                                <Typography variant="h6" color="text.secondary">
                                    Lift
                                </Typography>
                            </Grid>
                            <Grid item container xs={9} justifyContent="flex-end">
                                {editLiftStatus === 0 ? (
                                    <Button variant="outlined" onClick={handleEditLift} startIcon={<EditIcon />}>
                                        Edit
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        onClick={handleSaveLift}
                                        color="success"
                                        startIcon={<CheckIcon />}
                                        disabled={editLiftStatus === 2}
                                    >
                                        Save
                                    </Button>
                                )}
                                {editLiftStatus === 0 ? (
                                    <Button
                                        variant="outlined"
                                        onClick={handleDeleteLift}
                                        className={classes.marginLeft}
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                    >
                                        Delete
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancelEdit}
                                        className={classes.marginLeft}
                                        color="warning"
                                        startIcon={<CloseIcon />}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                        <hr className={classes.hr} />
                        <Grid item>{/* {editLiftStatus === 0 ? () : ()} */}</Grid>
                    </Grid>
                    <Grid item container direction="column" xs={3}>
                        2
                    </Grid>
                    <Grid item container direction="column" xs={3}>
                        3
                    </Grid>
                    <Grid item container direction="column" xs={3}>
                        4
                    </Grid>
                </Grid>
            </Grid>
        </Root>
    );
};

export default LiftView;
