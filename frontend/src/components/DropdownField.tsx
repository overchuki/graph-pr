import { Grid, GridSize } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Dispatch, SetStateAction } from "react";

interface Props {
    label: string;
    value: number;
    onChange: Dispatch<SetStateAction<number>> | ((val: number) => void);
    valuesArr: Array<[number, string]>;
    size: boolean | GridSize | undefined;
    position: number;
    error: boolean;
}

interface GridStyle {
    width: string;
    padding?: string;
}

const DropdownField: React.FC<Props> = ({ label, value, onChange, valuesArr, size, position, error }) => {
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;

    let gridStyle: GridStyle = {
        width: "100%",
    };

    if (position !== -1) {
        gridStyle.padding = pStr;
    }
    const id = `${label.replace(/\s/g, "")}Select`;

    return (
        <Grid item container alignItems="center" justifyContent="center" xs={size} style={gridStyle}>
            <FormControl variant="outlined" style={{ width: "100%" }}>
                <InputLabel error={error} id={id}>
                    {label}
                </InputLabel>
                <Select labelId={id} value={value} error={error} onChange={(e: any) => onChange(e.target.value)} label={label}>
                    {valuesArr.map((val, idx) => (
                        <MenuItem key={idx} value={val[0]}>
                            {val[1]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
    );
};

export default DropdownField;
