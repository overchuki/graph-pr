import { Grid, GridSize } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { Dispatch, SetStateAction } from "react";

interface Props {
    label: string;
    value: string | number;
    onChange: Dispatch<SetStateAction<string>> | ((val: string) => string | boolean);
    error: boolean;
    autoComplete: string;
    size: boolean | GridSize | undefined;
    type: string;
    position: number;
    disabled: boolean;
}

interface GridStyle {
    width: string;
    padding?: string;
}

const InputField: React.FC<Props> = ({ label, value, onChange, error, autoComplete, size, type, position, disabled }) => {
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;

    let gridStyle: GridStyle = {
        width: "100%",
    };

    if (position !== -1) {
        gridStyle.padding = pStr;
    }

    return (
        <Grid item container alignItems="center" justifyContent="center" xs={size} style={gridStyle}>
            <TextField
                label={label}
                type={type}
                defaultValue={value}
                error={error}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                variant="outlined"
                color="primary"
                disabled={disabled}
                style={{
                    width: "100%",
                }}
            />
        </Grid>
    );
};

export default InputField;
