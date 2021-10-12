import { PieChart, Pie, Cell } from "recharts";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";

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
    fontSize: string;
    unitStr: string;
    scaleFactor: number;
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
    original: {
        consumed: number;
        total: number;
    };
};

const CircleChart: React.FC<Props> = ({ sizing, pieData, fontSize, unitStr, scaleFactor }) => {
    const theme = useTheme();
    const startAngle = 90;

    const getDataObj = (chartData: chartPropObj, inner: number, outer: number): dataDisplayObj => {
        let over = 0;
        let under = 0;
        let consumed = 0;
        if (chartData.consumed <= chartData.total) {
            under = chartData.total - chartData.consumed;
            consumed = chartData.total - under;
        } else if (chartData.consumed > chartData.total) {
            over = chartData.consumed - chartData.total;
            consumed = chartData.total - over;
            if (over >= chartData.total) {
                consumed = 0;
            }
        }

        let data = [
            { value: over, color: chartData.overColor },
            { value: consumed, color: chartData.primaryColor },
            { value: under, color: theme.palette.background.paper },
        ];

        return {
            name: chartData.name,
            original: {
                consumed: chartData.consumed,
                total: chartData.total,
            },
            data,
            inner,
            outer,
        };
    };

    const dataArr: Array<dataDisplayObj> = pieData.map((entry, index) => {
        let outer = sizing.maxRadius - sizing.lineRadius * index - sizing.lineSpacing * index;
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
                            startAngle={startAngle}
                            endAngle={startAngle - 360}
                            innerRadius={entry.inner}
                            outerRadius={entry.outer}
                            animationEasing="ease"
                        >
                            {entry.data.map((cellEntry, cellIndex) => (
                                <Cell key={`cell-${cellIndex}`} fill={cellEntry.color} />
                            ))}
                        </Pie>
                    );
                })}
                <text
                    x={sizing.sideLength / 2}
                    y={sizing.sideLength / 2 - sizing.sideLength / scaleFactor}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fill: theme.palette.text.primary,
                        fontSize: fontSize,
                    }}
                >
                    {`${dataArr[0].data[0].value > 0 ? dataArr[0].data[0].value : dataArr[0].data[2].value}${unitStr} ${
                        dataArr[0].data[0].value > 0 ? "over" : "left"
                    }`}
                </text>
                <text
                    x={sizing.sideLength / 2}
                    y={sizing.sideLength / 2 + sizing.sideLength / scaleFactor}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fill: theme.palette.text.primary,
                        fontSize: fontSize,
                    }}
                >
                    {`${dataArr[0].original.consumed}/${dataArr[0].original.total}`}
                </text>
            </PieChart>
        </Grid>
    );
};

export default CircleChart;
