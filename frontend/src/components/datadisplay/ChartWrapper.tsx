import { useEffect, useState } from "react";
import "chartjs-adapter-moment";
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import { datesetArr, tooltipStrings, dataSetType } from "../../global/globalTypes";

ChartJS.register(...registerables);

const CHART_COLORS = {
    red: "rgb(255, 99, 132)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(75, 192, 192)",
    blue: "rgb(54, 162, 235)",
    purple: "rgb(153, 102, 255)",
    grey: "rgb(201, 203, 207)",
    darkGrey: "rgb(80, 81, 82)",
    darkerGrey: "rgb(25, 25, 25)",
};

interface Props {
    numArrays: datesetArr[];
    title: string;
    showTitle: boolean;
    selectedArr: boolean[];
    tooltipLabels?: tooltipStrings[];
    tooltipBools: { title: boolean; label: boolean; footer: boolean };
    highlightIndex?: number;
    xRange: number[] | string[];
    yRange: number[];
}

const ChartWrapper: React.FC<Props> = ({ numArrays, title, showTitle, selectedArr, tooltipLabels, tooltipBools, highlightIndex, xRange, yRange }) => {
    const timeFormat = "YYYYMMDD";

    const [labels, setLabels] = useState<tooltipStrings[]>([]);

    const [options, setOptions] = useState<{}>({});
    const [data, setData] = useState<{ datasets: dataSetType[] }>({ datasets: [] });

    const titleTooltip = (tooltipItems: { dataIndex: number; datasetIndex: number; label: string; raw: { x: string; y: number } }[]): string => {
        if (labels) {
            return labels[tooltipItems[0].dataIndex].title;
        }
        return "Title Error";
    };

    const labelTooltip = (tooltipItem: {
        dataIndex: number;
        datasetIndex: number;
        label: string;
        raw: { x: string; y: number };
    }): string[] | undefined => {
        return undefined;
    };

    const afterBodyTooltip = (
        tooltipItems: { dataIndex: number; datasetIndex: number; label: string; raw: { x: string; y: number } }[]
    ): string[] => {
        if (labels) {
            return labels[tooltipItems[0].dataIndex].label;
        }
        return ["Label Error"];
    };

    const footerTooltip = (tooltipItems: { dataIndex: number; datasetIndex: number; label: string; raw: { x: string; y: number } }[]): string => {
        if (labels) {
            return labels[tooltipItems[0].dataIndex].footer;
        }
        return "Footer Error";
    };

    const getLongest = (arr: datesetArr[]): number => {
        let len = 0;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].length > len) len = arr[i].length;
        }

        return len;
    };

    const getMinDate = (arr: string[]): { date: string; indices: number[] } => {
        let minDateStr = arr[0];

        let minDate = new Date(minDateStr);
        let indexArr = [0];

        for (let i = 1; i < arr.length; i++) {
            let curDateStr = arr[i];
            let curDate = new Date(curDateStr);

            if (curDate < minDate) {
                minDate = curDate;
                minDateStr = curDateStr;
                indexArr = [i];
            } else if (curDate.getTime() === minDate.getTime()) {
                indexArr.push(i);
            }
        }

        return { date: minDateStr, indices: indexArr };
    };

    const setConfig = () => {
        let allSetsCopy: datesetArr[] = [...numArrays];
        let maxLen = getLongest(allSetsCopy);

        let numOfArrays = allSetsCopy.length;
        let currentIter = 0;
        while (currentIter < maxLen) {
            let dateStrArr = [];
            let minDateObj: { date: string; indices: number[] } = { date: allSetsCopy[0][currentIter].x, indices: [0] };
            for (let i = 0; i < numOfArrays; i++) {
                if (allSetsCopy[i][currentIter]) dateStrArr.push(allSetsCopy[i][currentIter].x);
                else dateStrArr.push("");
            }
            minDateObj = getMinDate(dateStrArr);
            if (currentIter === 0) {
            }

            for (let i = 0; i < numOfArrays; i++) {
                if (!minDateObj.indices.includes(i)) {
                    allSetsCopy[i].splice(currentIter, 0, { x: minDateObj.date, y: null });
                }
            }

            maxLen = getLongest(allSetsCopy);
            currentIter++;

            if (currentIter > 20) break;
        }

        let tempDatasets: dataSetType[] = [];
        for (let i = 0; i < allSetsCopy.length; i++) {
            if (selectedArr[i]) {
                let color = CHART_COLORS.blue;
                let width = 1;
                if (i === highlightIndex) {
                    color = CHART_COLORS.yellow;
                    width = 3;
                }

                tempDatasets.push({
                    spanGaps: true,
                    data: allSetsCopy[i],
                    borderColor: color,
                    borderWidth: width,
                    fill: false,
                });
            }
        }

        setData({ datasets: tempDatasets });

        setOptions({
            responsive: true,
            interaction: {
                mode: "index" as const,
                intersect: false,
            },

            elements: {
                line: {
                    tension: 0,
                },
                point: {
                    radius: 0,
                },
            },
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: showTitle,
                    text: title,
                    font: {
                        size: 18,
                    },
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        title: tooltipBools.title ? titleTooltip : undefined,
                        label: tooltipBools.label ? labelTooltip : undefined,
                        afterBody: tooltipBools.label ? afterBodyTooltip : undefined,
                        footer: tooltipBools.footer ? footerTooltip : undefined,
                    },
                },
            },
            scales: {
                x: {
                    type: "time",
                    time: {
                        parser: timeFormat,
                        tooltipFormat: "ll",
                        displayFormats: {
                            quarter: "MMM YYYY",
                        },
                    },
                    grid: {
                        color: CHART_COLORS.darkerGrey,
                        borderColor: CHART_COLORS.darkGrey,
                        borderWidth: 2,
                    },
                    title: {
                        text: "Date",
                        display: true,
                    },
                    min: xRange[0],
                    max: xRange[1],
                },
                y: {
                    title: {
                        text: "Theoretical Max",
                        display: true,
                    },
                    grid: {
                        color: CHART_COLORS.darkerGrey,
                        borderColor: CHART_COLORS.darkGrey,
                        borderWidth: 2,
                    },
                    min: yRange[0],
                    max: yRange[1],
                },
            },
        });
    };

    useEffect(() => {
        setConfig();
        if (tooltipLabels) setLabels(tooltipLabels);
    }, [numArrays, selectedArr]);

    return <Line width="1000" height="300" options={options} data={data} />;
};

export default ChartWrapper;
