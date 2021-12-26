import Grid from "@mui/material/Grid";
import CircleChart from "../components/CircleChart";
import { useTheme } from "@mui/material";

interface Props {
    calories: {
        consumed: number;
        total: number;
    };
    protein: {
        consumed: number;
        total: number;
    };
    carbs: {
        consumed: number;
        total: number;
    };
    fat: {
        consumed: number;
        total: number;
    };
}

const CircleChartGroup: React.FC<Props> = ({ calories, protein, carbs, fat }) => {
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

    return (
        <>
            <CircleChart
                sizing={calorieSizing}
                pieData={[
                    {
                        name: "Calories",
                        consumed: calories.consumed,
                        total: calories.total,
                        primaryColor: theme.palette.primary.dark,
                        overColor: theme.palette.error.dark,
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
                        consumed: protein.consumed,
                        total: protein.total,
                        primaryColor: theme.palette.secondary.dark,
                        overColor: theme.palette.error.dark,
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
                        consumed: carbs.consumed,
                        total: carbs.total,
                        primaryColor: theme.palette.warning.dark,
                        overColor: theme.palette.error.dark,
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
                        consumed: fat.consumed,
                        total: fat.total,
                        primaryColor: theme.palette.success.dark,
                        overColor: theme.palette.error.dark,
                    },
                ]}
                fontSize="medium"
                unitStr="g"
                scaleFactor={10}
            />
        </>
    );
};

export default CircleChartGroup;
