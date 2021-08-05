import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const DropdownField = ({ label, value, onChange, valuesArr, size, position, error }) => {
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;

    let gridStyle = {
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
                <Select labelId={id} value={value} error={error} onChange={(e) => onChange(e.target.value)} label={label}>
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
