import ChartWrapper from "../components/datadisplay/ChartWrapper";
import { datesetArr, tooltipStrings, dataSetType } from "../global/globalTypes";

const Bodyweight = () => {
    const sampleData: datesetArr[] = [
        [
            { x: "20220102", y: 135 },
            { x: "20220104", y: 145 },
            { x: "20220107", y: 155 },
            { x: "20220109", y: 165 },
            { x: "20220113", y: 145 },
            { x: "20220116", y: 155 },
            { x: "20220416", y: 185 },
            { x: "20220716", y: 195 },
        ],
        [
            { x: "20211002", y: 95 },
            { x: "20211109", y: 105 },
            { x: "20220102", y: 115 },
            { x: "20220104", y: 125 },
            { x: "20220107", y: 115 },
            { x: "20220109", y: 105 },
            { x: "20220113", y: 125 },
            { x: "20220116", y: 135 },
            { x: "20220211", y: 145 },
            { x: "20220317", y: 185 },
        ],
    ];

    let tooltipLabels: tooltipStrings[] = [];

    for (let i = 0; i < sampleData[1].length; i++) {
        tooltipLabels.push({ footer: "sampleFoot", title: "FALSE", label: [] });
        for (let x = 0; x < sampleData.length; x++) {
            tooltipLabels[i].label.push("sampleLabel");
        }
    }

    return (
        <div style={{ maxHeight: "100%", maxWidth: "90%", marginLeft: "50px", marginTop: "100px" }}>
            <ChartWrapper
                numArrays={sampleData}
                selectedArr={[true, true]}
                title="Sample title"
                showTitle={false}
                tooltipLabels={tooltipLabels}
                tooltipBools={{ title: true, label: true, footer: false }}
                highlightIndex={1}
            />
        </div>
    );
};

export default Bodyweight;
