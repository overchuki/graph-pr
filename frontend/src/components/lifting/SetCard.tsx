import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { liftSetAllInfo } from "../../global/globalTypes";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";

const PREFIX = "SetCard";
const classes = {
    card: `${PREFIX}-card`,
    selectedCard: `${PREFIX}-selected-card`,
    txt: `${PREFIX}-txt`,
    marginLeft: `${PREFIX}-marginLeft`,
    contentPadding: `${PREFIX}-contentPadding`,
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
        background: "#001636",

        "&:hover": {
            cursor: "pointer",
            background: "#002254",
        },
    },
    [`& .${classes.txt}`]: {
        cursor: "text",
        marginRight: "5px",
    },
    [`& .${classes.marginLeft}`]: {
        marginLeft: "30px",
    },
    [`& .${classes.contentPadding}`]: {
        padding: "10px 10px 3px 10px",
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
                <CardContent className={classes.contentPadding}>
                    <Grid container direction="row" alignItems="center" justifyContent="center">
                        <Grid item container xs={6} direction="row" justifyContent="flex-end">
                            <Typography gutterBottom variant="h6" component="div">
                                {liftSet ? new Date(liftSet.parent.date).toDateString() : ""}
                            </Typography>
                        </Grid>
                        <Grid item container xs={6} direction="row" justifyContent="flex-start">
                            <Typography variant="body2" color="text.secondary" className={classes.marginLeft}>
                                {liftSet ? (
                                    <>
                                        {liftSet.parent.top_set
                                            ? `${liftSet.sets[liftSet.parent.top_set - 1].weight} for ${
                                                  liftSet.sets[liftSet.parent.top_set - 1].reps
                                              } (Theomax: ${liftSet.sets[liftSet.parent.top_set - 1].theomax})`
                                            : `${liftSet.sets[0].weight} for ${liftSet.sets[0].reps} (Theomax: ${liftSet.sets[0].theomax})`}
                                    </>
                                ) : (
                                    ""
                                )}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Root>
    );
};

export default SetCard;
