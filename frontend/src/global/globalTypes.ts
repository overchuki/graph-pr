import { ScatterDataPoint } from "chart.js";

export type ErrorType = string | boolean;
export type HTTPBasicResponse = {
    success?: string;
    error?: string;
};
export type HTTPPostResponse = {
    success?: string;
    error?: string;
    id?: number;
};
export type userData = {
    name: string;
    username: string;
    email: string;
    description: string;
    dob: string;
    height: number;
    height_unit: string;
    height_unit_fk: number;
    theme: number;
    gender: string;
    gender_fk: number;
    weight_unit: string;
    weight_unit_fk: number;
    activity_level: string;
    activity_level_description: string;
    activity_level_fk: number;
    weight_goal: string;
    weight_goal_fk: number;
    icon_location: string;
    created_at: string;
};
export type getUserDataResponse = {
    data: {
        user?: userData;
        error?: string;
    };
};
export type VerificationObj = {
    name: string;
    required: boolean;
    range: [number, number];
    int: boolean;
    email: boolean;
    ascii: boolean;
    dob: boolean;
    alphaNum: boolean;
};
export type onChangeFuncNum = (val: number) => { returnError: boolean; error: ErrorType; overwrite: boolean };
export type onChangeFuncStr = (val: string) => { returnError: boolean; error: ErrorType; overwrite: boolean };
export type GridStyle = {
    width: string;
    padding?: string;
};
export type keyChangeFunc = (keyString: string) => any;
export type liftObj = {
    id: number;
    name: string;
    unit_fk: number;
    plur_abbr: string;
    starred: number;
    max: number | null;
    max_reps: number | null;
    max_date: string | null;
    theomax: number | null;
    theomax_weight: number | null;
    theomax_reps: number | null;
    theomax_date: string | null;
    lastSet: { parent: liftSetParent; sets: liftSet[] };
    workouts: workoutShort[];
    created_at: string;
    duration: number | null;
};
export type workoutShort = { name: string; id: number; order_num: number };
export type liftSetParent = {
    id: number;
    notes: string | null;
    set_quantity: number;
    top_set: number | null;
    date: string;
    lift_fk: number;
};
export type liftSet = {
    id: number;
    set_num: number;
    weight: number;
    reps: number;
    theomax: number;
    lift_set_parent_fk: number;
    lift_fk: number;
};
export type liftSetFull = {
    set_num: number;
    weight: string;
    reps: number;
    theomax: string;
    top_set?: number;
    date: string;
    set_quantity: number;
    notes?: string;
};
export type liftSetShort = {
    weight: string;
    reps: number;
    theomax: string;
};
export type liftSetShortDate = {
    weight: string;
    reps: number;
    theomax: string;
    date: string;
};
export type liftSetAllInfo = {
    parent: liftSetParent;
    sets: liftSetShort[];
};
export type workoutObj = {
    id: number;
    name: string;
    description: string | null;
    days: string | null;
    liftCnt: number;
    created_at: string;
};
export type getLiftResponse = {
    lifts: liftObj[];
};
export type getWorkoutResponse = {
    workouts: workoutObj[];
};
export type snackbarType = "success" | "info" | "warning" | "error";
export type datesetArr = { x: string; y: number | null }[];
export type tooltipStrings = {
    title: string;
    label: string[];
    footer: string;
};
export type dataSetType = {
    spanGaps: boolean;
    data: { x: string; y: number | null }[];
    borderColor: string;
    borderWidth: number;
    fill: boolean;
};
