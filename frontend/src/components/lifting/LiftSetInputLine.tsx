import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState } from "react";
import { ErrorType } from "../../global/globalTypes";

interface Props {
    values: [number | string, number | string];
    set_num: number;
    unit?: string;
    selected: boolean;
    handleRemove?: (setNumber: number) => void;
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
                    {selected ? <>{iconHover ? <DisabledByDefaultIcon /> : <CheckBoxIcon />}</> : <CheckBoxOutlineBlankIcon />}
                </IconButton>
            </Grid>
            <Grid item xs={5}>
                <TextField
                    variant="outlined"
                    type="number"
                    label={weightError ? weightError : `Weight ${unit ? `(${unit})` : ""}`}
                    error={weightError ? true : false}
                    onChange={(e) => {
                        let err = handleWeightChange(set_num, e.target.value);
                        setWeightError(err);
                    }}
                    value={values[0]}
                    style={{ width: "100%" }}
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
                />
            </Grid>
            {set_num !== 0 && handleRemove ? (
                <Grid item xs={1}>
                    <IconButton
                        onClick={() => {
                            if (handleRemove) handleRemove(set_num);
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
