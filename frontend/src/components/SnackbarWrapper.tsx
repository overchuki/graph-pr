import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

interface Props {
    open: boolean;
    duration: number;
    type: "success" | "info" | "warning" | "error";
    handleClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
    message: string;
}

const SnackbarWrapper: React.FC<Props> = ({ open, duration, type, handleClose, message }) => {
    return (
        <Snackbar open={open} autoHideDuration={duration} onClose={handleClose}>
            <Alert
                onClose={handleClose}
                severity={type}
                sx={{ width: "100%" }}
                action={
                    <IconButton onClick={handleClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default SnackbarWrapper;
