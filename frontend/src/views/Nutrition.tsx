import Grid from "@mui/material/Grid";
import CircleChart from "../components/CircleChart";
import { useTheme } from "@mui/material";
import { useState } from "react";
import { ErrorType } from "../global/globalTypes";
// import AdapterDateFns from "@mui/lab/AdapterDateFns";
// import LocalizationProvider from "@mui/lab/LocalizationProvider";
// import DatePicker from "@mui/lab/DatePicker";

const Nutrition = () => {
    const theme = useTheme();
    const calorieSizing = {
        lineRadius: 25,
        lineSpacing: 10,
        maxRadius: 100,
        sideLength: 200,
    };
    const macroSizing = {
        lineRadius: 15,
        lineSpacing: 10,
        maxRadius: 55,
        sideLength: 110,
    };
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
    let dateStr = yyyy + "/" + mm + "/" + dd;
    const [date, setDate] = useState<ErrorType>(dateStr);

    const [tabValue, setTabValue] = useState(0);

    return (
        <Grid container direction="row">
            <Grid item container alignItems="center" justifyContent="center" direction="column" xs={3}>
                <CircleChart
                    sizing={calorieSizing}
                    pieData={[
                        {
                            name: "Calories",
                            consumed: 3680,
                            total: 3600,
                            primaryColor: theme.palette.primary.main,
                            overColor: theme.palette.error.main,
                        },
                    ]}
                    fontSize="larger"
                    unitStr=" cal"
                    scaleFactor={15}
                />
                <CircleChart
                    sizing={macroSizing}
                    pieData={[
                        {
                            name: "Protein",
                            consumed: 160,
                            total: 185,
                            primaryColor: theme.palette.secondary.main,
                            overColor: theme.palette.error.main,
                        },
                    ]}
                    fontSize="medium"
                    unitStr="g"
                    scaleFactor={10}
                />
                <CircleChart
                    sizing={macroSizing}
                    pieData={[
                        {
                            name: "Carbs",
                            consumed: 240,
                            total: 270,
                            primaryColor: theme.palette.warning.main,
                            overColor: theme.palette.error.main,
                        },
                    ]}
                    fontSize="medium"
                    unitStr="g"
                    scaleFactor={10}
                />
                <CircleChart
                    sizing={macroSizing}
                    pieData={[
                        {
                            name: "Fat",
                            consumed: 50,
                            total: 70,
                            primaryColor: theme.palette.success.main,
                            overColor: theme.palette.error.main,
                        },
                    ]}
                    fontSize="medium"
                    unitStr="g"
                    scaleFactor={10}
                />
            </Grid>
            <Grid item container direction="column" justifyContent="flex-start" alignItems="center" xs={9}>
                <Grid>
                    {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Basic example"
                            value={value}
                            onChange={(newValue) => {
                                setValue(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider> */}
                </Grid>
                <Grid>Current plan and needs</Grid>
                <Grid>List of meals and items consumed today</Grid>
                <Grid></Grid>
            </Grid>
        </Grid>
    );
};

export default Nutrition;
