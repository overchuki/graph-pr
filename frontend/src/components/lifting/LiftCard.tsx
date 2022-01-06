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
}

const LiftCard: React.FC<Props> = (liftObj) => {
    return <>lift card here</>;
};

export default LiftCard;
