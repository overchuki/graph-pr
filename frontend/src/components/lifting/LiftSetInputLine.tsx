import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

interface Props {
    values: [number | string, number | string];
    set_num: number;
    unit: string;
    selected: boolean;
    handleRemove: (setNumber: number) => void;
    handleWeightChange: (setNumber: number, weight: number) => void;
    handleRepsChange: (setNumber: number, reps: number) => void;
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
                    label={`Weight (${unit})`}
                    onChange={(e) => {
                        handleWeightChange(set_num, parseInt(e.target.value));
                    }}
                    value={values[0]}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    variant="outlined"
                    type="number"
                    label="Reps"
                    onChange={(e) => {
                        handleRepsChange(set_num, parseInt(e.target.value));
                    }}
                    value={values[1]}
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
