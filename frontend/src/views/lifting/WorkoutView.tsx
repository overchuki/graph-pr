import { styled } from "@mui/material/styles";
import Config from "../../Config";
import axios from "axios";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Switch, Route, useHistory, Link, useLocation } from "react-router-dom";
import { HTTPPostResponse, ErrorType, snackbarType } from "../../global/globalTypes";
import SnackbarWrapper from "../../components/SnackbarWrapper";
import InputField from "../../components/inputs/InputField";
import { Button, CircularProgress, Typography } from "@mui/material";

const PREFIX = "CreateWorkout";
const classes = {
    halfWidth: `${PREFIX}-halfWidth`,
    link: `${PREFIX}-link`,
    label: `${PREFIX}-label`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.halfWidth}`]: {
        width: "40%",
        padding: "30px",
        margin: "auto",
    },
    [`& .${classes.link}`]: {
        textDecoration: "none",
    },
    [`& .${classes.label}`]: {
        color: theme.palette.text.secondary,
    },
}));

interface Props {}

type LocationState = {
    from: {
        pathname: string;
    };
    snackBarStatus?: boolean;
};

const WorkoutView: React.FC<Props> = () => {
    const location = useLocation<LocationState>();

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

    useEffect(() => {
        if (location.state && location.state.snackBarStatus) {
            openSnackbar("Workout Created", "success");
        }
    }, []);

    return (
        <Root>
            <SnackbarWrapper open={snackbarOpen} message={snackbarMessage} type={snackbarType} duration={3000} handleClose={handleSnackbarClose} />
        </Root>
    );
};

export default WorkoutView;
