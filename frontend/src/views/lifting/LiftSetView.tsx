import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useHistory, Link, useLocation } from "react-router-dom";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import {
    Button,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from "@mui/material";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { capitalizeFirstLetter } from "../../components/util";
import Pagination from "@mui/material/Pagination";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

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

    const [sets, setSets] = useState<liftSetAllInfo[]>([]);
    const [visibleSets, setVisibleSets] = useState<liftSetAllInfo[]>([]);

    const [selectedSet, setSelectedSet] = useState<number>(-1);

    const [defaultDateRange, setDefaultDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
    const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
    const [pageNum, setPageNum] = useState<number>(1);

    const goBackToLiftPage = () => {
        history.goBack();
    };

    const setUpPageNum = (len: number) => {
        setPageNum(Math.ceil(len / RESULTS_PER_PAGE));
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
        }
    }, [location.state]);

    return (
        <Root>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="row">
                <Grid item xs={3}>
                    <Grid item container justifyContent="center" xs={4} className={classes.marginTop}>
                        <IconButton onClick={goBackToLiftPage}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container item direction="column" justifyContent="space-between" spacing={2} xs={6}>
                    <Grid item container direction="row" justifyContent="center" className={classes.marginTop}>
                        <Typography variant="h4" color="text.secondary">
                            Edit Sets
                        </Typography>
                    </Grid>
                    <Grid item container direction="row" xs={2} justifyContent="center" alignItems="center" spacing={3}>
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
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                    <Grid item container direction="row">
                        <Grid item container direction="column">
                            stuff go here
                        </Grid>
                    </Grid>
                    <Grid item container direction="row" justifyContent="center">
                        <Pagination count={pageNum} color="secondary" />
                    </Grid>
                </Grid>
                <Grid item xs={3}>
                    Stuffy here
                </Grid>
            </Grid>
        </Root>
    );
};

export default LiftSetView;
