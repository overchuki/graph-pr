import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { workoutObj } from "../../global/globalTypes";

interface Props {
    workoutsProp: workoutObj[];
    selectedWorkoutsProp: number[];
    onSaveParent: (workoutArr: number[] | null) => void;
    open: boolean;
    keepMounted: boolean;
    id: string;
}

const WorkoutDialog: React.FC<Props> = ({ workoutsProp, selectedWorkoutsProp, onSaveParent, open, ...other }) => {
    const [selectedWorkouts, setSelectedWorkouts] = useState<number[]>(selectedWorkoutsProp);

    const handleCancel = () => {
        onSaveParent(null);
    };

    const handleSave = () => {
        onSaveParent(selectedWorkouts);
    };

    const handleChecked = (event: any, checked: boolean) => {
        let wID = parseInt(event.target.value);
        if (checked) {
            setSelectedWorkouts([...selectedWorkouts, wID].sort((a, b) => a - b));
        } else {
            setSelectedWorkouts(selectedWorkouts.filter((w) => w !== wID));
        }
    };

    useEffect(() => {
        setSelectedWorkouts(selectedWorkoutsProp);
    }, [selectedWorkoutsProp]);

    return (
        <Dialog sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }} maxWidth="xs" open={open} {...other}>
            <DialogTitle>Choose Workouts</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    {workoutsProp.map((w, i) => (
                        <FormControlLabel
                            key={i}
                            control={
                                <Checkbox
                                    onChange={(e, c) => {
                                        handleChecked(e, c);
                                    }}
                                    checked={selectedWorkouts.includes(w.id)}
                                    value={w.id}
                                />
                            }
                            label={w.name}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default WorkoutDialog;
