import Grid from "@mui/material/Grid";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import CircleChartGroup from "../components/nutrition/CircleChartGroup";

const Nutrition: React.FC = () => {
    let today = new Date();
    const [date, setDate] = useState<Date | null>(today);

    const [tabValue, setTabValue] = useState(0);
    const [calories, setCalories] = useState([0, 0]);
    const [protein, setProtein] = useState([0, 0]);
    const [carbs, setCarbs] = useState([0, 0]);
    const [fat, setFat] = useState([0, 0]);

    useEffect(() => {
        console.log(date);
        console.log("effect test");
    }, [date]);

    return (
        <Grid container direction="row">
            <Grid item xs={1}></Grid>
            <Grid item container alignItems="center" justifyContent="center" direction="column" xs={2}>
                <CircleChartGroup
                    calories={{ consumed: calories[0], total: calories[1] }}
                    protein={{ consumed: protein[0], total: protein[1] }}
                    carbs={{ consumed: carbs[0], total: carbs[1] }}
                    fat={{ consumed: fat[0], total: fat[1] }}
                />
            </Grid>
            <Grid item container direction="column" justifyContent="flex-start" alignItems="center" xs={8}>
                <Grid item xs={1}></Grid>
                <Grid item container xs={1} justifyContent="center">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DesktopDatePicker
                            label="Date to Display"
                            inputFormat="MM/dd/yyyy"
                            value={date}
                            onChange={(newValue) => {
                                if (!newValue) {
                                    setDate(today);
                                } else {
                                    setDate(newValue);
                                }
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item container xs={9}>
                    Current plan and needs
                </Grid>
                {/* <Grid item container xs={5}>
                    List of meals and items consumed today
                </Grid> */}
                {/* <Grid item xs={1}></Grid> */}
            </Grid>
            <Grid item xs={1}></Grid>
        </Grid>
    );
};

export default Nutrition;
