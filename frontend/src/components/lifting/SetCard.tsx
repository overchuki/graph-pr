import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { liftSetAllInfo } from "../../global/globalTypes";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const PREFIX = "SetCard";
const classes = {
    card: `${PREFIX}-card`,
    selectedCard: `${PREFIX}-selected-card`,
    txt: `${PREFIX}-txt`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.card}`]: {
        width: "100%",

        "&:hover": {
            cursor: "pointer",
            background: "#2F2F2F",
        },
    },
    [`& .${classes.selectedCard}`]: {
        background: "#0F0F0F",

        "&:hover": {
            cursor: "pointer",
            background: "#171717",
        },
    },
    [`& .${classes.txt}`]: {
        cursor: "text",
        marginRight: "5px",
    },
}));

interface Props {
    set: liftSetAllInfo;
    idx: number;
    handleClick: (idx: number) => void;
    selected: boolean;
}

const SetCard: React.FC<Props> = ({ set, idx, handleClick, selected }) => {
    const [liftSet, setLiftSet] = useState<liftSetAllInfo>();

    useEffect(() => {
        setLiftSet(set);
    }, [set]);

    return (
        <Root style={{ width: "100%", margin: "10px 0" }}>
            <Card
                className={selected ? classes.selectedCard : classes.card}
                onClick={() => {
                    handleClick(idx);
                }}
            >
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {liftSet ? new Date(liftSet.parent.date).toDateString() : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {liftSet ? (
                            <>
                                {liftSet.parent.top_set
                                    ? `${liftSet.sets[liftSet.parent.top_set - 1].weight} for ${
                                          liftSet.sets[liftSet.parent.top_set - 1].reps
                                      } (Theomax: ${liftSet.sets[liftSet.parent.top_set - 1].reps})`
                                    : `${liftSet.sets[0].weight} for ${liftSet.sets[0].reps} (Theomax: ${liftSet.sets[0].reps})`}
                            </>
                        ) : (
                            ""
                        )}
                    </Typography>
                </CardContent>
            </Card>
        </Root>
    );
};

export default SetCard;
