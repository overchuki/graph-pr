import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

const InputField = ({ label, value, onChange, error, autoComplete, size, type, position, disabled }) => {
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;

    let gridStyle = {
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
