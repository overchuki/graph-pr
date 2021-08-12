export type ErrorType = string | boolean;
export type HTTPBasicResponse = {
    success?: string;
    error?: string;
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
