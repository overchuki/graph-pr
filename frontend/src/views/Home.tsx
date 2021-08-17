import Grid from "@material-ui/core/Grid";
import CircleChart from "../components/CircleChart";
import { useTheme } from "@material-ui/core/styles";

const Home = () => {
    const theme = useTheme();
    const calorieSizing = {
        lineRadius: 20,
        lineSpacing: 10,
        maxRadius: 100,
        sideLength: 200,
    };
    const macroSizing = {
        lineRadius: 10,
        lineSpacing: 10,
        maxRadius: 50,
        sideLength: 100,
    };

    return (
        <Grid container>
            <Grid item container alignItems="center" justifyContent="center" direction="column">
                <CircleChart
                    sizing={calorieSizing}
                    pieData={[
                        {
                            name: "Calories",
                            consumed: 3400,
                            total: 3600,
                            primaryColor: theme.palette.primary.main,
                            overColor: theme.palette.error.main,
                        },
                    ]}
                    centerText={true}
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
                    centerText={true}
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
                    centerText={true}
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
                    centerText={true}
                />
            </Grid>
        </Grid>
    );
};

export default Home;
