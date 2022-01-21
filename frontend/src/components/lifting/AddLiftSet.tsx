import Config from "../../Config";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import axios from "axios";
import { HTTPBasicResponse } from "../../global/globalTypes";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { dateToString } from "../util";
import LiftSetInputLine from "./LiftSetInputLine";

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
}

type setArray = [number | string, number | string][];

const MAX_SET_NUM = 10;

const AddLiftSet: React.FC<Props> = ({ id, unit }) => {
    const [date, setDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState<string>("");
    const [sets, setSets] = useState<setArray>([["", ""]]);
    const [topSet, setTopSet] = useState<number>(-1);
    const [setNum, setSetNum] = useState<number>(1);

    const handleSubmitSet = (setsSelected: setArray, dateSelected: Date, topSetSelected: number, notesSelected: string) => {
        const dateStr = dateToString(dateSelected);

        // verify sets, notes, topSet for correct types, length
        // Topset + 1, so it's one indexed

        // Send request, display appropriate snackbar

        // Reset all of the values back to default
    };

    const handleSetWeightChange = (setNumber: number, weight: number) => {
        let newSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) newSets.push(sets[i]);
            else {
                newSets.push([weight, sets[i][1]]);
            }
        }
        setSets(newSets);
    };

    const handleSetRepsChange = (setNumber: number, reps: number) => {
        let newSets: setArray = [];
        for (let i = 0; i < setNum; i++) {
            if (i !== setNumber) newSets.push(sets[i]);
            else {
                newSets.push([sets[i][0], reps]);
            }
        }
        setSets(newSets);
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
            <Grid container direction="column" alignItems="center" spacing={2} className={classes.outline}>
                <Grid item>
                    <Typography variant="h6" color="text.primary" gutterBottom>
                        Add Set Group
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
                <Grid item className={classes.maxWidth}>
                    <TextField
                        onChange={(e) => {
                            setNotes(e.target.value);
                        }}
                        variant="outlined"
                        label="Notes"
                        type="text"
                        className={classes.maxWidth}
                    />
                </Grid>
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
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleSubmitSet(sets, date, topSet, notes);
                        }}
                    >
                        Submit Set Group
                    </Button>
                </Grid>
            </Grid>
        </Root>
    );
};

export default AddLiftSet;
