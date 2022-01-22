import Config from "../../Config";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import axios from "axios";
import { HTTPBasicResponse, snackbarType, ErrorType } from "../../global/globalTypes";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { dateToString, capitalizeFirstLetter } from "../util";
import LiftSetInputLine from "./LiftSetInputLine";
import InputField from "../inputs/InputField";
import SnackbarWrapper from "../SnackbarWrapper";
import CircularProgress from "@mui/material/CircularProgress";

const PREFIX = "AddLiftSet";
const classes = {
    maxWidth: `${PREFIX}-maxWidth`,
    outline: `${PREFIX}-outline`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.maxWidth}`]: {
        width: "100%",
    },
    [`& .${classes.outline}`]: {
        border: "solid 1px",
        borderColor: theme.palette.grey[600],
        borderRadius: "5px",
        margin: "5px 0",
        padding: "0 15px 20px 0",
    },
}));

interface Props {
    id: number;
    unit: string;
    name?: string;
    updateState: () => void;
}

type setArray = [string, string][];

const MAX_SET_NUM = 10;
const WEIGHT_RANGE = [1, 2000];
const REPS_RANGE = [1, 30];

const AddLiftSet: React.FC<Props> = ({ id, unit, name, updateState }) => {
    const [date, setDate] = useState<Date>(new Date());
    const [notesVal, setNotesVal] = useState<string>("");
    const [notes, setNotes] = useState<ErrorType>("");
    const [sets, setSets] = useState<setArray>([["", ""]]);
    const [topSet, setTopSet] = useState<number>(-1);
    const [setNum, setSetNum] = useState<number>(1);

    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarType, setSnackbarType] = useState<snackbarType>("success");

    const [submitStatus, setSubmitStatus] = useState<boolean>(false);

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const openSnackbar = (message: string, type: snackbarType) => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarOpen(true);
    };

    const handleSubmitSet = async (setsSelected: setArray, dateSelected: Date, topSetSelected: number, notesSelected: ErrorType) => {
        setSubmitStatus(true);

        const dateStr = dateToString(dateSelected);

        let data: { sets: [number, number][]; date: string; top_set: number | null; notes: string | null } = {
            sets: [],
            date: dateStr,
            top_set: topSetSelected === -1 ? null : topSetSelected + 1,
            notes: null,
        };

        if (topSetSelected !== -1 && (topSetSelected < 0 || topSetSelected > 9)) {
            openSnackbar("Top set out of range", "error");
            setSubmitStatus(false);
            return;
        }
        if (
            (notesSelected && typeof notesSelected === "string" && (notesSelected.length < 1 || notesSelected.length > 100)) ||
            notesSelected === false
        ) {
            openSnackbar("Notes out of range", "error");
            setSubmitStatus(false);
            return;
        } else {
            if (notesSelected !== "" && notesSelected !== true) data.notes = notesSelected;
        }

        for (let i = 0; i < setsSelected.length; i++) {
            let weight = parseInt(sets[i][0]);
            let reps = parseInt(sets[i][1]);
            if (!weight || !reps) {
                openSnackbar("Please fill out all sets and reps", "error");
                setSubmitStatus(false);
                return;
            } else if (weight < WEIGHT_RANGE[0] || weight > WEIGHT_RANGE[1]) {
                openSnackbar("Weight out of range", "error");
                setSubmitStatus(false);
                return;
            } else if (reps < REPS_RANGE[0] || reps > REPS_RANGE[1]) {
                openSnackbar("Reps out of range", "error");
                setSubmitStatus(false);
                return;
            } else {
                data.sets.push([weight, reps]);
            }
        }

        try {
            const res: { data: HTTPBasicResponse } = await axios.post(`${Config.apiUrl}/lift/${id}/set/`, data, { withCredentials: true });

            if (res.data.success) {
                updateState();
                openSnackbar(capitalizeFirstLetter(res.data.success), "success");
                setDate(new Date());
                setNotes("");
                setNotesVal("");
                setSets([["", ""]]);
                setTopSet(-1);
                setSetNum(1);
            } else if (res.data.error) {
                openSnackbar(capitalizeFirstLetter(res.data.error), "error");
            } else {
                openSnackbar("Issue updating workouts.", "error");
            }
        } catch (err) {
            openSnackbar("Error adding set", "error");
        }

        setSubmitStatus(false);
    };

    const handleSetWeightChange = (setNumber: number, weight: string): ErrorType => {
        let error: ErrorType = false;
        try {
            let valueInt: number = parseInt(weight);
            if (valueInt < WEIGHT_RANGE[0]) error = `Too small.`;
            if (valueInt > WEIGHT_RANGE[1]) error = `Too large.`;
        } catch (err) {
            error = "Invalid type";
        }
        if (error) return error;

        let newSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) newSets.push(sets[i]);
            else {
                newSets.push([weight, sets[i][1]]);
            }
        }
        setSets(newSets);

        return false;
    };

    const handleSetRepsChange = (setNumber: number, reps: string): ErrorType => {
        let error: ErrorType = false;
        try {
            let valueInt: number = parseInt(reps);
            if (valueInt < REPS_RANGE[0]) error = `Too small.`;
            if (valueInt > REPS_RANGE[1]) error = `Too large.`;
        } catch (err) {
            error = "Invalid type";
        }
        if (error) return error;

        let newSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) newSets.push(sets[i]);
            else {
                newSets.push([sets[i][0], reps]);
            }
        }
        setSets(newSets);

        return false;
    };

    const handleTopSetClick = (setNumber: number) => {
        if (setNumber === topSet) setTopSet(-1);
        else setTopSet(setNumber);
    };

    const addSetAtEnd = () => {
        setSets([...sets, ["", ""]]);
        setSetNum(setNum + 1);
    };

    const removeSet = (setNumber: number) => {
        let newSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) newSets.push(sets[i]);
        }
        if (setNumber === topSet) setTopSet(-1);
        setSets(newSets);
        setSetNum(setNum - 1);
    };

    return (
        <Root style={{ width: "90%" }}>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="column" alignItems="center" spacing={2} className={classes.outline}>
                <Grid item>
                    <Typography variant="h6" color="text.primary" gutterBottom>
                        Add Set Group {name ? `(${name})` : ""}
                    </Typography>
                </Grid>
                <Grid item>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DesktopDatePicker
                            label="Date of Set"
                            inputFormat="MM/dd/yyyy"
                            value={date}
                            onChange={(newValue) => {
                                if (!newValue) {
                                    setDate(new Date());
                                } else {
                                    setDate(newValue);
                                }
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <InputField
                    label={"Notes"}
                    type={"text"}
                    value={notesVal}
                    controlled={true}
                    setValue={setNotes}
                    onChange={(v) => {
                        setNotesVal(v);
                        return { returnError: false, error: "", overwrite: false };
                    }}
                    errorOverwrite={false}
                    autoComplete={""}
                    size={false}
                    position={-1}
                    disabled={false}
                    verify={true}
                    verifyObj={{
                        name: "your note",
                        required: false,
                        range: [1, 100],
                        int: false,
                        email: false,
                        ascii: true,
                        dob: false,
                        alphaNum: false,
                    }}
                    range={[1, 100]}
                />
                <Grid item>
                    <Typography variant="subtitle2" color="text.secondary">
                        {topSet === -1 ? "Choose top set on the left" : `Top Set: ${topSet + 1}`}
                    </Typography>
                </Grid>
                {sets.map((s, i) => (
                    <LiftSetInputLine
                        key={i}
                        values={s}
                        set_num={i}
                        selected={topSet === i}
                        unit={unit}
                        handleRemove={removeSet}
                        handleRepsChange={handleSetRepsChange}
                        handleWeightChange={handleSetWeightChange}
                        handleTopSetClick={handleTopSetClick}
                    />
                ))}
                {setNum < MAX_SET_NUM ? (
                    <Grid item>
                        <Button variant="outlined" onClick={addSetAtEnd}>
                            <AddIcon />
                            Set
                        </Button>
                    </Grid>
                ) : (
                    ""
                )}
                <Grid item>
                    {submitStatus ? (
                        <CircularProgress color="primary" />
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleSubmitSet(sets, date, topSet, notes);
                            }}
                        >
                            Submit Set Group
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Root>
    );
};

export default AddLiftSet;
