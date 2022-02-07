import Config from "../../Config";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import axios from "axios";
import { HTTPBasicResponse, snackbarType, ErrorType, liftSetAllInfo } from "../../global/globalTypes";
import { styled } from "@mui/material/styles";
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
import CheckIcon from "@mui/icons-material/Check";

const PREFIX = "AddLiftSet";
const classes = {
    maxWidth: `${PREFIX}-maxWidth`,
    outline: `${PREFIX}-outline`,
    marginLeft: `${PREFIX}-marginLeft`,
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
    [`& .${classes.marginLeft}`]: {
        marginLeft: "10px",
    },
}));

interface Props {
    id: number;
    name?: string;
    updateState: (newSets: ([number, number] | null)[] | null, newDate: Date | null, newTopSet: number | null, newNotes: string | null) => void;
    liftSet: liftSetAllInfo;
}

type setArray = [string, string][];

const WEIGHT_RANGE = [1, 2000];
const REPS_RANGE = [1, 30];

const LiftSetEdit: React.FC<Props> = ({ id, name, updateState, liftSet }) => {
    const [setNum, setSetNum] = useState<number>(0);

    const [oldDate, setOldDate] = useState<Date>(new Date());
    const [oldNotes, setOldNotes] = useState<string>("");
    const [oldSets, setOldSets] = useState<setArray>([]);
    const [oldTopSet, setOldTopSet] = useState<number>(-1);

    const [newDate, setNewDate] = useState<Date>(new Date());
    const [newNotes, setNewNotes] = useState<ErrorType>("");
    const [newNotesVal, setNewNotesVal] = useState<string>("");
    const [newSets, setNewSets] = useState<setArray>([]);
    const [newTopSet, setNewTopSet] = useState<number>(-1);

    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarType, setSnackbarType] = useState<snackbarType>("success");

    // 0: editing, 1: editing but nothing changed, so disable, 2: submited, loading symbol
    const [submitStatus, setSubmitStatus] = useState<number>(1);

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const openSnackbar = (message: string, type: snackbarType) => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarOpen(true);
    };

    const handleSaveEdit = async (setsSelected: setArray, dateSelected: Date, topSetSelected: number, notesSelected: ErrorType) => {
        setSubmitStatus(2);

        const oldDateStr = dateToString(oldDate);

        let dateStr: string | null = dateToString(dateSelected);
        if (dateSelected.getTime() === oldDate.getTime()) dateStr = null;

        let data: {
            sets: ([number, number] | null)[] | null;
            oldDate: string;
            newDate: string | null;
            top_set: number | null;
            notes: string | null;
        } = {
            sets: [],
            oldDate: oldDateStr,
            newDate: dateStr,
            top_set: topSetSelected === -1 || topSetSelected === oldTopSet ? null : topSetSelected + 1,
            notes: null,
        };

        if (topSetSelected !== -1 && (topSetSelected < 0 || topSetSelected > 9)) {
            openSnackbar("Top set out of range", "error");
            setSubmitStatus(1);
            return;
        }
        if (
            (notesSelected && typeof notesSelected === "string" && (notesSelected.length < 1 || notesSelected.length > 100)) ||
            notesSelected === false
        ) {
            openSnackbar("Notes out of range", "error");
            setSubmitStatus(1);
            return;
        } else if (notesSelected !== "" && notesSelected !== true && notesSelected !== oldNotes) data.notes = notesSelected;

        for (let i = 0; i < setsSelected.length; i++) {
            let modifiedCount = 0;

            let weight = parseInt(newSets[i][0]);
            let reps = parseInt(newSets[i][1]);

            if (!weight || !reps) {
                openSnackbar("Please fill out all sets and reps", "error");
                setSubmitStatus(1);
                return;
            } else if (weight < WEIGHT_RANGE[0] || weight > WEIGHT_RANGE[1]) {
                openSnackbar("Weight out of range", "error");
                setSubmitStatus(1);
                return;
            } else if (reps < REPS_RANGE[0] || reps > REPS_RANGE[1]) {
                openSnackbar("Reps out of range", "error");
                setSubmitStatus(1);
                return;
            } else if (weight === parseInt(oldSets[i][0]) && reps === parseInt(oldSets[i][1])) {
                if (data.sets !== null) data.sets.push(null);
            } else {
                modifiedCount++;
                if (data.sets !== null) data.sets.push([weight, reps]);
            }

            if (modifiedCount === 0) {
                data.sets = null;
            }
        }

        try {
            const res: { data: HTTPBasicResponse } = await axios.put(`${Config.apiUrl}/lift/${id}/set/`, data, { withCredentials: true });

            if (res.data.success) {
                openSnackbar(capitalizeFirstLetter(res.data.success), "success");

                updateState(data.sets, data.newDate ? new Date(data.newDate) : null, data.top_set, data.notes);

                openSnackbar(capitalizeFirstLetter(res.data.success), "success");
                setOldDate(data.newDate ? new Date(data.newDate) : oldDate);
                setOldNotes(data.notes ? data.notes : oldNotes);
                setOldTopSet(data.top_set ? data.top_set : oldTopSet);

                setNewDate(dateSelected);
                setNewNotes(data.notes ? data.notes : oldNotes);
                setNewNotesVal(data.notes ? data.notes : oldNotes);
                setNewTopSet(data.top_set ? data.top_set : oldTopSet);

                if (data.sets !== null) {
                    let tempSets: setArray = [];
                    for (let i = 0; i < data.sets.length; i++) {
                        if (data.sets !== null && data.sets[i] !== null) {
                            tempSets.push([data.sets[i]?.[0] + "", data.sets[i]?.[1] + ""]);
                        } else {
                            tempSets.push([oldSets[i][0], oldSets[i][1]]);
                        }
                    }
                    setOldSets(tempSets);
                    setNewSets(tempSets);

                    console.log(tempSets);
                } else {
                    setOldSets(oldSets);
                    setNewSets(oldSets);
                }
            } else if (res.data.error) {
                openSnackbar(capitalizeFirstLetter(res.data.error), "error");
            } else {
                openSnackbar("Error updating set.", "error");
            }
        } catch (err) {
            openSnackbar("Error updating set", "error");
        }

        setSubmitStatus(1);
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

        let tempNewSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) tempNewSets.push(newSets[i]);
            else {
                tempNewSets.push([weight, newSets[i][1]]);
                if (weight === oldSets[i][0]) setSubmitStatus(1);
                else setSubmitStatus(0);
            }
        }
        setNewSets(tempNewSets);

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

        let tempNewSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) tempNewSets.push(newSets[i]);
            else {
                tempNewSets.push([newSets[i][0], reps]);
                if (reps === oldSets[i][1]) setSubmitStatus(1);
                else setSubmitStatus(0);
            }
        }
        setNewSets(tempNewSets);

        return false;
    };

    const handleTopSetClick = (setNumber: number) => {
        let newSetNum = setNumber;
        if (setNumber === newTopSet) newSetNum = -1;

        if (newSetNum === oldTopSet) setSubmitStatus(1);
        else setSubmitStatus(0);

        setNewTopSet(newSetNum);
    };

    useEffect(() => {
        setOldDate(new Date(liftSet.parent.date));
        setOldNotes(liftSet.parent.notes ? liftSet.parent.notes : "");
        setOldTopSet(liftSet.parent.top_set ? liftSet.parent.top_set : -1);

        let tempSets: setArray = [];
        for (let i = 0; i < liftSet.sets.length; i++) {
            tempSets.push([liftSet.sets[i].weight, liftSet.sets[i].reps + ""]);
        }
        setOldSets(tempSets);

        setNewDate(new Date(liftSet.parent.date));
        setNewNotesVal(liftSet.parent.notes ? liftSet.parent.notes : "");
        setNewTopSet(liftSet.parent.top_set ? liftSet.parent.top_set : -1);
        setNewSets(tempSets);
    }, [liftSet]);

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
                            value={newDate}
                            onChange={(newValue) => {
                                if (!newValue) {
                                    setNewDate(new Date());
                                } else {
                                    setNewDate(newValue);
                                }
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <InputField
                    label={"Notes"}
                    type={"text"}
                    value={newNotesVal}
                    controlled={true}
                    setValue={setNewNotes}
                    onChange={(v) => {
                        setNewNotesVal(v);
                        if (v === oldNotes) setSubmitStatus(1);
                        else setSubmitStatus(0);
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
                        {newTopSet === -1 ? "Choose top set on the left" : `Top Set: ${newTopSet + 1}`}
                    </Typography>
                </Grid>
                {newSets.map((s, i) => (
                    <LiftSetInputLine
                        key={i}
                        values={s}
                        set_num={i}
                        selected={newTopSet === i}
                        handleRepsChange={handleSetRepsChange}
                        handleWeightChange={handleSetWeightChange}
                        handleTopSetClick={handleTopSetClick}
                    />
                ))}

                <Grid item>
                    {submitStatus === 2 ? <CircularProgress color="primary" /> : ""}
                    {submitStatus === 0 || submitStatus === 1 ? (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                handleSaveEdit(newSets, newDate, newTopSet, newNotes);
                            }}
                            color="success"
                            startIcon={<CheckIcon />}
                            disabled={submitStatus === 1}
                        >
                            Save Changes
                        </Button>
                    ) : (
                        ""
                    )}
                </Grid>
            </Grid>
        </Root>
    );
};

export default LiftSetEdit;
