import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Button, ButtonGroup, TextField, Typography } from "@mui/material";
import { liftSetAllInfo } from "../../global/globalTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import LiftSetEdit from "../../components/lifting/LiftSetEdit";
import SetCard from "../../components/lifting/SetCard";

const PREFIX = "LiftSetsView";
const classes = {
    marginTop: `${PREFIX}-marginTop`,
    marginLeft: `${PREFIX}-marginLeft`,
    marginTopSml: `${PREFIX}-marginTopSml`,
    outline: `${PREFIX}-outline`,
    btnDisabled: `${PREFIX}-btnDisabled`,
    dateWidth: `${PREFIX}-dateWidth`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.marginTop}`]: {
        marginTop: "30px",
    },
    [`& .${classes.marginLeft}`]: {
        marginLeft: "10px",
    },
    [`& .${classes.marginTopSml}`]: {
        marginTop: "10px",
    },
    [`& .${classes.outline}`]: {
        border: "solid 2px",
        borderColor: theme.palette.grey[600],
        borderRadius: "5px",
        margin: "0 10px",
        padding: "0",
    },
    [`& .${classes.btnDisabled}`]: {
        color: theme.palette.grey[700],
        borderColor: theme.palette.grey[700],
    },
    [`& .${classes.dateWidth}`]: {
        width: "60%",
    },
}));

type LocationState = {
    from: {
        pathname: string;
    };
    liftSets?: liftSetAllInfo[];
};

const LiftSetView = () => {
    const RESULTS_PER_PAGE = 9;

    const location = useLocation<LocationState>();
    const history = useHistory();
    const params: { id?: string } = useParams();

    const [sets, setSets] = useState<liftSetAllInfo[]>([]);
    const [visibleSets, setVisibleSets] = useState<liftSetAllInfo[]>([]);

    const [selectedSet, setSelectedSet] = useState<number>(-1);
    const [curPage, setCurPage] = useState<number>(1);

    const [defaultDateRange, setDefaultDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
    const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
    const [pageNum, setPageNum] = useState<number>(1);

    // 0: newest first, 1: oldest first
    const [order, setOrder] = useState<number>(0);
    const [dateOffset, setDateOffset] = useState<[number, number]>([0, 0]);

    // TODO: implement
    const getSetIdx = (i: number) => {
        let off = 0;
        if (order === 0) {
            off = dateOffset[1];
        } else {
            off = dateOffset[0];
        }

        let idx = (curPage - 1) * RESULTS_PER_PAGE;
        idx += off;
        idx += i;

        if (order === 1) {
            idx = sets.length - idx - 1;
        }

        return idx;
    };

    const resetAllValues = (allSets: liftSetAllInfo[], o: number, offset: [number, number]) => {
        setUpPageNum(allSets.length);
        onPaginationChange(false, curPage, o, offset);
    };

    const goBackToLiftPage = () => {
        history.goBack();
    };

    const setUpPageNum = (len: number) => {
        setPageNum(Math.ceil(len / RESULTS_PER_PAGE));
    };

    const getTheoMax = (weight: number, reps: number): string => {
        if (reps === 1) return weight + "";
        return (weight / (1 - 0.025 * reps)).toFixed(2);
    };

    const updateStateDelete = (idx: number) => {
        let tempSets = [...sets];
        tempSets = tempSets.filter((s, i) => i !== idx);

        setSets(tempSets);
        resetAllValues(tempSets, order, dateOffset);
    };

    const updateState = (
        newSets: [number | null, number | null][] | null,
        newDate: Date | null,
        newTopSet: number | null,
        newNotes: string | null,
        idx: number
    ) => {
        let tempSet = sets[idx];

        let dateChanged = false;

        if (newDate) {
            dateChanged = true;
            let defDateCpy: [Date, Date] = [...defaultDateRange];
            let dateCpy: [Date, Date] = [...dateRange];
            if (newDate.getTime() < defaultDateRange[0].getTime()) {
                defDateCpy[0] = newDate;
                if (dateRange[0].getTime() === defaultDateRange[0].getTime()) {
                    dateCpy[0] = newDate;
                }
            } else if (newDate.getTime() > defaultDateRange[1].getTime()) {
                defDateCpy[1] = newDate;
                if (dateRange[1].getTime() === defaultDateRange[1].getTime()) {
                    dateCpy[1] = newDate;
                }
            }

            setDateRange(dateCpy);
            setDefaultDateRange(defDateCpy);
            dateRangeChanged(dateCpy);

            tempSet.parent.date = newDate.toISOString();
        }

        if (newTopSet) {
            if (newTopSet === -1) tempSet.parent.top_set = undefined;
            else tempSet.parent.top_set = newTopSet;
        }

        if (newNotes !== null) {
            if (newNotes === "") tempSet.parent.notes = undefined;
            else tempSet.parent.notes = newNotes;
        }

        if (newSets) {
            for (let i = 0; i < newSets.length; i++) {
                if (newSets[i] !== null) {
                    let wNum: string = sets[selectedSet].sets[i].weight;
                    let w = newSets[i][0];
                    if (w !== null) wNum = w + "";

                    let rNum: number = sets[selectedSet].sets[i].reps;
                    let r = newSets[i][1];
                    if (r !== null) rNum = r;

                    let theo = getTheoMax(parseInt(wNum), rNum);

                    tempSet.sets[i].weight = wNum;
                    tempSet.sets[i].reps = rNum;
                    tempSet.sets[i].theomax = theo;
                }
            }
        }

        let tempSetsCpy = [...sets];
        tempSetsCpy[idx] = tempSet;

        if (dateChanged) tempSetsCpy.sort((a, b) => new Date(b.parent.date).getTime() - new Date(a.parent.date).getTime());

        setSets(tempSetsCpy);
        resetAllValues(tempSetsCpy, order, dateOffset);
    };

    // TODO: implement date compare here
    const compareDates = (one: Date, two: Date) => {};

    // TODO: implement change of date here, update filtered values
    const dateRangeChanged = (range: [Date, Date]) => {
        let leftFound = -1;
        let rightFound = -1;

        range[0].setUTCHours(0, 0, 0, 0);
        range[1].setUTCHours(0, 0, 0, 0);

        for (let i = 0; i < sets.length; i++) {
            let left = i;
            let right = sets.length - i - 1;

            console.log(sets[left].parent.date, range[1]);
            console.log(sets[right].parent.date, range[0]);

            let leftDate = new Date(sets[left].parent.date);
            let rightDate = new Date(sets[right].parent.date);
            leftDate.setUTCHours(0, 0, 0, 0);
            rightDate.setUTCHours(0, 0, 0, 0);

            if (leftDate.getTime() <= range[1].getTime() && leftFound === -1) {
                leftFound = left;
            } else if (rightDate.getTime() >= range[0].getTime() && rightFound === -1) {
                rightFound = i;
            }

            if (rightFound !== -1 && leftFound !== -1) break;
        }
        console.log(rightFound, leftFound);
        if (rightFound !== -1) rightFound = 0;
        if (leftFound !== -1) leftFound = 0;

        setDateOffset([rightFound, leftFound]);
        resetAllValues(sets, order, [rightFound, leftFound]);
    };

    const onPaginationChange = (event: any, page: number, o: number, offset: [number, number]) => {
        let off = 0;
        if (o === 0) {
            off = offset[1];
        } else {
            off = offset[0];
        }
        console.log(off);
        let min = off + (page - 1) * RESULTS_PER_PAGE;
        let max = off + (page - 1) * RESULTS_PER_PAGE + RESULTS_PER_PAGE;

        if (selectedSet < min || selectedSet >= max) setSelectedSet(-1);

        let tempSets: liftSetAllInfo[] = [...sets];
        if (o === 1) tempSets.reverse();

        setVisibleSets(tempSets.slice(min, max));
        setCurPage(page);
    };

    const setClicked = (i: number) => {
        if (i === selectedSet) setSelectedSet(-1);
        else setSelectedSet(i);
    };

    const resetFilter = () => {
        setDateRange(defaultDateRange);
        dateRangeChanged(defaultDateRange);
    };

    const changeOrder = (val: number) => {
        if (val !== order) {
            setOrder(val);
            resetAllValues(sets, val, dateOffset);
        }
    };

    useEffect(() => {
        if (location.state && location.state.liftSets) {
            let tempSets = location.state.liftSets;

            if (tempSets.length > 0) {
                setDateRange([new Date(tempSets[0].parent.date), new Date(tempSets[tempSets.length - 1].parent.date)]);
                setDefaultDateRange([new Date(tempSets[0].parent.date), new Date(tempSets[tempSets.length - 1].parent.date)]);
            }

            tempSets.reverse();

            setSets(tempSets);

            setDateOffset([0, 0]);
            setUpPageNum(tempSets.length);
            setCurPage(1);

            setVisibleSets(tempSets.slice(0, RESULTS_PER_PAGE));
            setOrder(0);
        }
    }, [location.state]);

    return (
        <Root>
            <Grid container direction="row" spacing={3}>
                <Grid item xs={1} container alignItems="flex-start" justifyContent="center" className={classes.marginTop}>
                    <IconButton onClick={goBackToLiftPage}>
                        <ArrowBackIcon fontSize="large" />
                    </IconButton>
                </Grid>
                <Grid container item direction="column" justifyContent="flex-start" spacing={2} xs={7}>
                    <Grid item container direction="row" justifyContent="center" className={classes.marginTop}>
                        <Typography variant="h4" color="text.secondary">
                            Edit Sets
                        </Typography>
                    </Grid>
                    <Grid item container direction="row" justifyContent="center" alignItems="center" spacing={3}>
                        <Grid item container alignItems="flex-end" direction="row" xs={2}>
                            <Grid item>
                                <ButtonGroup variant="outlined">
                                    <Button
                                        onClick={() => {
                                            changeOrder(1);
                                        }}
                                        color={order === 1 ? "info" : undefined}
                                        className={order === 0 ? classes.btnDisabled : ""}
                                    >
                                        Oldest
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            changeOrder(0);
                                        }}
                                        color={order === 0 ? "info" : undefined}
                                        className={order === 1 ? classes.btnDisabled : ""}
                                    >
                                        Newest
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                        </Grid>
                        <Grid item container justifyContent="center" alignItems="center" direction="row" xs={8}>
                            <Grid item container direction="row" justifyContent="flex-end" xs={4}>
                                <Grid item xs={10}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DesktopDatePicker
                                            className={classes.dateWidth}
                                            label="Start Date"
                                            inputFormat="MM/dd/yyyy"
                                            value={dateRange[0]}
                                            onChange={(newValue) => {
                                                let dateCpy: [Date, Date] = [...dateRange];
                                                if (!newValue) {
                                                    setDateRange(defaultDateRange);
                                                } else {
                                                    dateCpy[0] = newValue;
                                                    setDateRange(dateCpy);
                                                }
                                                dateRangeChanged(dateCpy);
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                            <Grid item container xs={1} justifyContent="center">
                                <Typography variant="h6" color="text.secondary">
                                    to
                                </Typography>
                            </Grid>
                            <Grid item container direction="row" justifyContent="flex-start" xs={4}>
                                <Grid item xs={10}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DesktopDatePicker
                                            label="End Date"
                                            inputFormat="MM/dd/yyyy"
                                            value={dateRange[1]}
                                            onChange={(newValue) => {
                                                let dateCpy: [Date, Date] = [...dateRange];
                                                if (!newValue) {
                                                    setDateRange(defaultDateRange);
                                                } else {
                                                    dateCpy[1] = newValue;
                                                    setDateRange(dateCpy);
                                                }
                                                dateRangeChanged(dateCpy);
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item container alignItems="flex-start" direction="row" xs={2}>
                            <Grid item>
                                <Button variant="outlined" color="info" onClick={resetFilter}>
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container direction="row">
                        <Grid item container direction="column">
                            {visibleSets.map((s, i) => (
                                <Grid item key={i + RESULTS_PER_PAGE * (curPage - 1)}>
                                    <SetCard set={s} idx={getSetIdx(i)} handleClick={setClicked} selected={selectedSet === getSetIdx(i)} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" justifyContent="center" style={{ marginBottom: "30px" }}>
                        <Pagination
                            onChange={(e, i) => {
                                onPaginationChange(false, i, order, dateOffset);
                            }}
                            count={pageNum}
                            color="secondary"
                        />
                    </Grid>
                </Grid>
                <Grid item container xs={4} direction="row" justifyContent="center">
                    {selectedSet !== -1 ? (
                        <LiftSetEdit
                            id={params.id ? parseInt(params.id) : -1}
                            idx={selectedSet}
                            liftSet={sets[selectedSet]}
                            updateState={updateState}
                            updateStateDelete={updateStateDelete}
                            name={new Date(sets[selectedSet].parent.date).toDateString()}
                        />
                    ) : (
                        <Typography variant="subtitle1" color="text.secondary" className={classes.marginTop}>
                            Click on a set to edit it here.
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </Root>
    );
};

export default LiftSetView;
