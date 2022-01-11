import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Link, useRouteMatch } from "react-router-dom";

interface liftObj {
    id: number;
    name: string;
    plur_abbr: string;
    max: number | null;
    max_reps: number | null;
    max_date: string | null;
    theomax: number | null;
    theomax_weight: number | null;
    theomax_reps: number | null;
    theomax_date: string | null;
    workout_name: string | null;
    created_at: string;
    duration: number | null;
}

interface Props {
    liftObj: liftObj;
    selected: boolean;
    handleClick: (selected: boolean, id: number) => void;
}

const PREFIX = "LiftCard";
const classes = {
    card: `${PREFIX}-card`,
    selectedCard: `${PREFIX}-selected-card`,
    btn: `${PREFIX}-btn`,
    txt: `${PREFIX}-txt`,
    link: `${PREFIX}-link`,
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
}));

const LiftCard: React.FC<Props> = ({ liftObj, selected, handleClick }) => {
    let { url } = useRouteMatch();

    return (
        <Root
            style={{ width: "100%", margin: "10px 0" }}
            onClick={(e) => {
                handleClick(selected, liftObj.id);
            }}
        >
            <Grid item>
                <Card className={selected ? classes.selectedCard : classes.card}>
                    <CardContent>
                        <Grid container direction="row">
                            <Typography variant="h5" color="text.primary" gutterBottom className={classes.txt}>
                                {liftObj.name}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                ({liftObj.plur_abbr})
                            </Typography>
                        </Grid>
                        <Grid container direction="row">
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={classes.txt}>
                                    Max: {liftObj.max ? liftObj.max : "---"}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={classes.txt}>
                                    Theo Max: {liftObj.theomax ? liftObj.theomax : "---"}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.primary" gutterBottom className={classes.txt}>
                                    Workout: {liftObj.workout_name ? liftObj.workout_name : "---"}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container direction="row">
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.max ? `${liftObj.max} for ${liftObj.max_reps}` : ""}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.theomax_reps ? `${liftObj.theomax_reps} for ${liftObj.theomax_reps}` : ""}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom className={classes.txt}>
                                    {liftObj.workout_name ? `${liftObj.workout_name}` : ""}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Link to={`${url}/lift/${liftObj.id}`} className={classes.link}>
                            <Button variant="contained" size="medium" className={classes.btn}>
                                Go To Lift
                            </Button>
                        </Link>
                    </CardActions>
                </Card>
            </Grid>
        </Root>
    );
};

export default LiftCard;
