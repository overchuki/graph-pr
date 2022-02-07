import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useHistory, useLocation, useParams } from "react-router-dom";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import { TextField, Typography } from "@mui/material";
import { snackbarType, liftSetAllInfo } from "../../global/globalTypes";
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
}));

type LocationState = {
    from: {
        pathname: string;
    };
    liftSets?: liftSetAllInfo[];
};

const LiftSetView = () => {
    const RESULTS_PER_PAGE = 10;

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

    const goBackToLiftPage = () => {
        history.goBack();
    };

    const setUpPageNum = (len: number) => {
        setPageNum(Math.ceil(len / RESULTS_PER_PAGE));
        setCurPage(1);
    };

    const updateState = (
        newSets: [number | null, number | null][] | null,
        newDate: Date | null,
        newTopSet: number | null,
        newNotes: string | null,
        idx: number
    ) => {
        let tempSet = sets[idx];

        if (newDate) {
            // TODO: check to see if date is below min now, change that if it is
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

                    tempSet.sets[i].weight = wNum;
                    tempSet.sets[i].reps = rNum;
                }
            }
        }

        let tempSetsCpy = [...sets];
        tempSetsCpy[idx] = tempSet;

        setSets(tempSetsCpy);
    };

    // TODO: implement change of date here, update filtered values
    const dateRangeChanged = () => {};

    const onPaginationChange = (event: any, page: number) => {
        let min = (page - 1) * RESULTS_PER_PAGE;
        let max = (page - 1) * RESULTS_PER_PAGE + 10;
        if (selectedSet < min || selectedSet >= max) setSelectedSet(-1);
        setVisibleSets(sets.slice(min, max));
        setCurPage(page);
    };

    const setClicked = (i: number) => {
        if (i === selectedSet) setSelectedSet(-1);
        else setSelectedSet(i);
    };

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

    useEffect(() => {
        if (location.state && location.state.liftSets) {
            let tempSets = location.state.liftSets;

            setSets(tempSets);

            if (tempSets.length > 0) {
                setDateRange([new Date(tempSets[0].parent.date), new Date(tempSets[tempSets.length - 1].parent.date)]);
                setDefaultDateRange([new Date(tempSets[0].parent.date), new Date(tempSets[tempSets.length - 1].parent.date)]);
            }

            setUpPageNum(tempSets.length);

            setVisibleSets(tempSets.slice(0, RESULTS_PER_PAGE));
        }
    }, [location.state]);

    return (
        <Root>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="row" spacing={3}>
                <Grid item xs={2}>
                    <Grid item container justifyContent="center" xs={4} className={classes.marginTop}>
                        <IconButton onClick={goBackToLiftPage}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container item direction="column" justifyContent="flex-start" spacing={2} xs={6}>
                    <Grid item container direction="row" justifyContent="center" className={classes.marginTop}>
                        <Typography variant="h4" color="text.secondary">
                            Edit Sets
                        </Typography>
                    </Grid>
                    <Grid item container direction="row" justifyContent="center" alignItems="center" spacing={3}>
                        <Grid item>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DesktopDatePicker
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
                                        dateRangeChanged();
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6" color="text.secondary">
                                to
                            </Typography>
                        </Grid>
                        <Grid item>
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
                                        dateRangeChanged();
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                    <Grid item container direction="row">
                        <Grid item container direction="column">
                            {visibleSets.map((s, i) => (
                                <Grid item key={i + RESULTS_PER_PAGE * (curPage - 1)}>
                                    <SetCard
                                        set={s}
                                        idx={i + RESULTS_PER_PAGE * (curPage - 1)}
                                        handleClick={setClicked}
                                        selected={selectedSet === i + RESULTS_PER_PAGE * (curPage - 1)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" justifyContent="center" style={{ marginBottom: "30px" }}>
                        <Pagination onChange={onPaginationChange} count={pageNum} color="secondary" />
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    {selectedSet !== -1 ? (
                        <LiftSetEdit
                            id={params.id ? parseInt(params.id) : -1}
                            idx={selectedSet}
                            liftSet={sets[selectedSet]}
                            updateState={updateState}
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
