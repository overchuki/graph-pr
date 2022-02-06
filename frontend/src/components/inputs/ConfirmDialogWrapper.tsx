import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import { DialogContentText } from "@mui/material";

interface Props {
    onConfirm: () => void;
    onDeny: () => void;
    title: string;
    message: string;
    cancelStr: string;
    agreeStr: string;
    open: boolean;
    keepMounted: boolean;
}

const WorkoutDialog: React.FC<Props> = ({ onConfirm, onDeny, title, message, cancelStr, agreeStr, open, ...other }) => {
    return (
        <Dialog open={open} onClose={onDeny} {...other}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onDeny}>
                    {cancelStr}
                </Button>
                <Button onClick={onConfirm}>{agreeStr}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default WorkoutDialog;
