import { PieChart, Pie, Cell, Label } from "recharts";
import { useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

type chartPropObj = {
    name: string;
    primaryColor: string;
    overColor: string;
    consumed: number;
    total: number;
};

interface Props {
    sizing: {
        sideLength: number;
        maxRadius: number;
        lineRadius: number;
        lineSpacing: number;
    };
    pieData: Array<chartPropObj>;
    centerText: boolean;
}

type dataObjValue = {
    value: number;
    color: string;
};

type dataDisplayObj = {
    name: string;
    data: dataObjValue[];
    inner: number;
    outer: number;
    angle: [number, number];
    original: {
        consumed: number;
        total: number;
    };
};

const CircleChart: React.FC<Props> = ({ sizing, pieData, centerText }) => {
    const theme = useTheme();
    const startAngle = 90;

    const getDataObj = (chartData: chartPropObj, inner: number, outer: number): dataDisplayObj => {
        let over = 0;
        let under = 0;
        if (chartData.consumed < chartData.total) {
            under = chartData.total - chartData.consumed;
        } else if (chartData.consumed > chartData.total) {
            over = chartData.consumed - chartData.total;
        }

        let data = [
            { value: over, color: chartData.overColor },
            { value: chartData.consumed - over, color: chartData.primaryColor },
            { value: under, color: theme.palette.background.paper },
        ];
        let angle: [number, number] = [startAngle, startAngle - 360];

        return {
            name: chartData.name,
            original: {
                consumed: chartData.consumed,
                total: chartData.total,
            },
            data,
            inner,
            outer,
            angle,
        };
    };

    const dataArr: Array<dataDisplayObj> = pieData.map((entry, index) => {
        let outer = sizing.maxRadius - sizing.lineRadius * index - sizing.lineSpacing * index;
        console.log(outer - sizing.lineRadius, outer);
        return getDataObj(entry, outer - sizing.lineRadius, outer);
    });

    return (
        <Grid item style={{ paddingTop: "30px" }}>
            <PieChart width={sizing.sideLength} height={sizing.sideLength}>
                {dataArr.map((entry, index) => {
                    return (
                        <Pie
                            key={`pie-${index}`}
                            data={entry.data}
                            dataKey={"value"}
                            stroke="none"
                            cx="50%"
                            cy="50%"
                            startAngle={entry.angle[0]}
                            endAngle={entry.angle[1]}
                            innerRadius={entry.inner}
                            outerRadius={entry.outer}
                            animationEasing="ease"
                        >
                            {centerText && dataArr.length === 1 ? (
                                <Label
                                    value={`${entry.name.toUpperCase()}:${entry.original.consumed}/${entry.original.total}`}
                                    position="center"
                                    style={{
                                        maxWidth: sizing.maxRadius,
                                    }}
                                />
                            ) : (
                                ""
                            )}
                            {entry.data.map((cellEntry, cellIndex) => (
                                <Cell key={`cell-${cellIndex}`} fill={cellEntry.color} />
                            ))}
                        </Pie>
                    );
                })}
            </PieChart>
        </Grid>
    );
};

export default CircleChart;
