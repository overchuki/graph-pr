interface workoutObj {
    id: number;
    name: string;
    description: string | null;
    days: string | null;
    liftCnt: number;
    created_at: string;
}

interface Props {
    workoutObj: workoutObj;
}

const WorkoutCard: React.FC<Props> = (workoutObj) => {
    return <>workout card here</>;
};

export default WorkoutCard;
