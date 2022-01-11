import Grid from "@mui/material/Grid";
import { workoutObj } from "../../global/globalTypes";

interface Props {
    workoutObj: workoutObj;
    selected: boolean;
}

const WorkoutCard: React.FC<Props> = (workoutObj, selected) => {
    return (
        <Grid item>
            <>workout card here</>
        </Grid>
    );
};

export default WorkoutCard;
