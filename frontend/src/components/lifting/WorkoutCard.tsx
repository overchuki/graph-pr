import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Link, useRouteMatch } from "react-router-dom";
import { workoutObj } from "../../global/globalTypes";

interface Props {
    workoutObj: workoutObj;
    selected: boolean;
    handleClick: (selected: boolean, id: number, name: string) => void;
}

const PREFIX = "WorkoutCard";
const classes = {
    card: `${PREFIX}-card`,
    selectedCard: `${PREFIX}-selected-card`,
    btn: `${PREFIX}-btn`,
    txt: `${PREFIX}-txt`,
    link: `${PREFIX}-link`,
    mrgTop: `${PREFIX}-mrgTop`,
    smlIcon: `${PREFIX}-smlIcon`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.card}`]: {
        width: "100%",

        "&:hover": {
            cursor: "pointer",
        },
    },
    [`& .${classes.btn}`]: {
        textTransform: "none",
        backgroundColor: theme.palette.primary.dark,

        "&:hover": {
            backgroundColor: theme.palette.warning.main,
        },
    },
    [`& .${classes.selectedCard}`]: {
        width: "100%",
        backgroundColor: theme.palette.common.black,

        "&:hover": {
            cursor: "pointer",
        },
    },
    [`& .${classes.txt}`]: {
        cursor: "text",
        marginRight: "5px",
    },
    [`& .${classes.link}`]: {
        textDecoration: "none",
        margin: "10px",
    },
    [`& .${classes.mrgTop}`]: {
        marginTop: "5px",
    },
    [`& .${classes.smlIcon}`]: {
        transform: "scale(0.8)",
    },
}));

const WorkoutCard: React.FC<Props> = ({ workoutObj, selected, handleClick }) => {
    let { url } = useRouteMatch();
    const daysArr = ["M", "T", "W", "R", "F", "S", "U"];
    const daysFullArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    let workoutDays = "";
    if (workoutObj.days) {
        for (let i = 0; i < workoutObj.days.length; i++) {
            if (i !== 0) workoutDays += ", ";
            workoutDays += daysFullArr[daysArr.indexOf(workoutObj.days.charAt(i))];
        }
    }

    return (
        <Root
            style={{ width: "100%", margin: "10px 0" }}
            onClick={(e: any) => {
                handleClick(selected, workoutObj.id, workoutObj.name);
            }}
        >
            <Grid item>
                <Card className={selected ? classes.selectedCard : classes.card}>
                    <CardContent>
                        {/* Title of the card and the description */}
                        <Grid container direction="row">
                            <Grid item container direction="row" xs={8}>
                                <Typography variant="h5" color="text.primary" gutterBottom className={classes.txt}>
                                    {workoutObj.name}
                                </Typography>
                                <Typography variant="h5" color="text.secondary" gutterBottom className={classes.txt}>
                                    {`(${workoutObj.liftCnt} lift${workoutObj.liftCnt !== 1 ? "s" : ""})`}
                                </Typography>
                            </Grid>
                            <Grid item container direction="row" justifyContent="flex-end" xs={4}>
                                <Link to={`${url}/workout/${workoutObj.id}`} className={classes.link}>
                                    <Button variant="contained" size="medium" className={classes.btn}>
                                        Go To Workout
                                    </Button>
                                </Link>
                            </Grid>
                        </Grid>
                        <Grid container direction="row">
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                {workoutObj.description}
                            </Typography>
                        </Grid>
                        <Grid container direction="row">
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                {workoutDays}
                            </Typography>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Root>
    );
};

export default WorkoutCard;
