import Grid from "@mui/material/Grid";
import { workoutObj } from "../../global/globalTypes";

interface Props {
    workoutObj: workoutObj;
    selected: boolean;
    handleClick: (selected: boolean, id: number) => void;
}

const WorkoutCard: React.FC<Props> = ({ workoutObj, selected, handleClick }) => {
    return (
        <Grid item>
            <>workout card here</>
        </Grid>
    );
};

export default WorkoutCard;
