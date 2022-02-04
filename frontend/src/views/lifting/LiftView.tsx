import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Switch, Route, useHistory, Link, useLocation, useParams } from "react-router-dom";
import { HTTPPostResponse, ErrorType, snackbarType } from "../../global/globalTypes";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import { Button, CircularProgress, Typography } from "@mui/material";
import { liftObj, liftSetFull, liftSetParent, liftSetAllInfo, datesetArr, tooltipStrings } from "../../global/globalTypes";
import ChartWrapper from "../../components/datadisplay/ChartWrapper";

const PREFIX = "LiftView";
const classes = {
    halfWidth: `${PREFIX}-halfWidth`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.halfWidth}`]: {
        width: "40%",
        padding: "30px",
        margin: "auto",
    },
}));

interface Props {}

type LocationState = {
    from: {
        pathname: string;
    };
    snackBarStatus?: boolean;
};

const LiftView: React.FC<Props> = () => {
    const location = useLocation<LocationState>();
    const params: { id?: string } = useParams();

    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarType, setSnackbarType] = useState<snackbarType>("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const openSnackbar = (message: string, type: snackbarType) => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarOpen(true);
    };

    const [lift, setLift] = useState<liftObj>();
    const [sets, setSets] = useState<liftSetFull[]>([]);
    const [setsWithParent, setSetsWithParent] = useState<liftSetAllInfo[]>([]);

    const [setsInput, setSetsInput] = useState<datesetArr[]>([]);
    const [tooltipLabelArr, setTooltipLabelArr] = useState<tooltipStrings[]>([]);
    const [selectedArr, setSelectedArr] = useState<boolean[]>([]);
    const [topSetIdx, setTopSetIdx] = useState<number>(-1);

    const configureLiftSets = (s: liftSetFull[]) => {
        let tempSetsArray: datesetArr[] = [];
        let tempLabelArray: tooltipStrings[] = [];
        let topSetArray: datesetArr = [];

        if (s.length > 0) {
            let curDate = "";
            let curSetIter = 0;

            for (let i = 0; i < s.length; i++) {
                let cur = s[i];
                if (cur.date !== curDate) {
                    curDate = cur.date;
                    curSetIter++;
                    tempLabelArray.push({ title: "", label: [], footer: cur.top_set ? `Top set: ${cur.top_set}` : "" });
                }

                if (tempSetsArray.length < cur.set_num) tempSetsArray.push([]);
                tempSetsArray[cur.set_num - 1].push({ x: cur.date, y: parseInt(cur.theomax) });

                if (tempLabelArray[curSetIter - 1].label.length < cur.set_num) {
                    tempLabelArray[curSetIter - 1].label.push(`${cur.set_num}: ${cur.weight} for ${cur.reps}. (Theo: ${cur.theomax})`);
                }

                if (cur.set_num === cur.top_set) {
                    topSetArray.push({ x: cur.date, y: parseInt(cur.theomax) });
                }
            }
        }

        tempSetsArray.push(topSetArray);

        setTopSetIdx(tempSetsArray.length - 1);
        setSelectedArr([true, true, false, true, true, true, true]);

        setTooltipLabelArr(tempLabelArray);
        setSetsInput(tempSetsArray);
    };

    useEffect(() => {
        async function getLiftData() {
            if (params.id) {
                const res: { data: { liftInfo: liftObj; liftSets: liftSetFull[] } } = await axios.get(`${Config.apiUrl}/lift/${params.id}/single`, {
                    withCredentials: true,
                });
                setLift(res.data.liftInfo);
                setSets(res.data.liftSets);
                configureLiftSets(res.data.liftSets);
            }
        }
        getLiftData();

        if (location.state && location.state.snackBarStatus) {
            openSnackbar("Lift Created", "success");
        }
    }, [location.state, params.id]);

    return (
        <Root>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
            <Grid container direction="column">
                <Grid item>
                    <ChartWrapper
                        numArrays={setsInput}
                        selectedArr={selectedArr}
                        title=""
                        showTitle={false}
                        highlightIndex={topSetIdx}
                        tooltipBools={{ title: false, label: true, footer: true }}
                        tooltipLabels={tooltipLabelArr}
                    />
                </Grid>
            </Grid>
        </Root>
    );
};

export default LiftView;
