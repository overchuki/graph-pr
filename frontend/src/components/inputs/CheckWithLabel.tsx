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
    controlled: boolean;
    checked?: boolean;
    color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | undefined;
}

const DayOfWeekCheck: React.FC<Props> = ({ onCheckChange, value, label, controlled, checked, color }) => {
    return (
        <Root>
            <Grid item>
                <FormControlLabel
                    checked={controlled ? checked : undefined}
                    className={classes.label}
                    control={
                        <Checkbox
                            onChange={(e, c) => {
                                onCheckChange(value, c);
                            }}
                            color={color ? color : undefined}
                        />
                    }
                    label={label}
                />
            </Grid>
        </Root>
    );
};

export default DayOfWeekCheck;
