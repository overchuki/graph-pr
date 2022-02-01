import { Grid, FormControlLabel, Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "DayWeekCheckbox";
const classes = {
    label: `${PREFIX}-label`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.label}`]: {
        color: theme.palette.text.secondary,
    },
}));

interface Props {
    onCheckChange: (i: number, checked: boolean) => void;
    value: number;
    label: string;
}

const DayOfWeekCheck: React.FC<Props> = ({ onCheckChange, value, label }) => {
    return (
        <Root>
            <Grid item>
                <FormControlLabel
                    className={classes.label}
                    control={
                        <Checkbox
                            onChange={(e, c) => {
                                onCheckChange(value, c);
                            }}
                        />
                    }
                    label={label}
                />
            </Grid>
        </Root>
    );
};

export default DayOfWeekCheck;
