import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { ErrorType, onChangeFuncStr } from "../../global/globalTypes";
import InputField from "../inputs/InputField";

interface Props {
    values: [number | string, number | string];
    set_num: number;
    unit: string;
    selected: boolean;
    handleRemove: (setNumber: number) => void;
    handleWeightChange: (setNumber: number, weight: string) => ErrorType;
    handleRepsChange: (setNumber: number, reps: string) => ErrorType;
    handleTopSetClick: (setNumber: number) => void;
}

const LiftSetInputLine: React.FC<Props> = ({
    values,
    unit,
    set_num,
    selected,
    handleRemove,
    handleWeightChange,
    handleRepsChange,
    handleTopSetClick,
}) => {
    const [iconHover, setIconHover] = useState<boolean>(false);
    const [weightError, setWeightError] = useState<ErrorType>(false);
    const [repsError, setRepsError] = useState<ErrorType>(false);

    return (
        <Grid item container direction="row" spacing={1} alignItems="center">
            <Grid item xs={2}>
                <IconButton
                    onMouseEnter={() => {
                        setIconHover(true);
                    }}
                    onMouseLeave={() => {
                        setIconHover(false);
                    }}
                    onClick={() => {
                        handleTopSetClick(set_num);
                    }}
                >
                    {selected ? <>{iconHover ? <ClearIcon /> : <CheckIcon />}</> : <AddIcon />}
                </IconButton>
            </Grid>
            <Grid item xs={5}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={weightError ? weightError : `Weight (${unit})`}
                    error={weightError ? true : false}
                    onChange={(e) => {
                        let err = handleWeightChange(set_num, e.target.value);
                        setWeightError(err);
                    }}
                    value={values[0]}
                    style={{ width: "100%" }}
                    InputProps={{ inputProps: { min: 1, max: 2000 } }}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={repsError ? repsError : "Reps"}
                    error={repsError ? true : false}
                    onChange={(e) => {
                        let err = handleRepsChange(set_num, e.target.value);
                        setRepsError(err);
                    }}
                    value={values[1]}
                    InputProps={{ inputProps: { min: 1, max: 30 } }}
                />
            </Grid>
            {set_num !== 0 ? (
                <Grid item xs={1}>
                    <IconButton
                        onClick={() => {
                            handleRemove(set_num);
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            ) : (
                ""
            )}
        </Grid>
    );
};

export default LiftSetInputLine;
