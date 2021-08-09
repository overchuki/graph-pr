import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import { GridSize } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import Config from "../Config";
import InputField from "./InputField";
import { basicVerify } from "./ServiceFunctions";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        textMain: {
            color: theme.palette.text.primary,
        },
        textSuccess: {
            color: theme.palette.success.main,
        },
        textError: {
            color: theme.palette.error.main,
        },
        btnWarning: {
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,

            "&:hover": {
                backgroundColor: theme.palette.warning.light,
            },
        },
    })
);

type ErrorType = string | boolean;
type ChangeFunc = (val: string) => { returnError: boolean; error: ErrorType; overwrite: boolean };

interface VerificationObj {
    name: string;
    required: boolean;
    range: [number, number];
    int: boolean;
    email: boolean;
    ascii: boolean;
    dob: boolean;
    alphaNum: boolean;
}

interface ExistsFuncRes {
    available?: boolean;
    error?: string;
}

interface ExistsHttpResponse {
    data: ExistsFuncRes;
}

interface Props {
    label: string;
    defaultValue: string;
    setValue: Dispatch<SetStateAction<ErrorType>>;
    autoComplete: string;
    size: boolean | GridSize | undefined;
    type: string;
    position: number;
    disabled: boolean;
    verify: boolean;
    verifyObj: VerificationObj;
    checkType: string;
}

interface GridStyle {
    width: string;
    padding?: string;
}

const InputFieldCheck: React.FC<Props> = ({
    label,
    defaultValue,
    setValue,
    autoComplete,
    size,
    type,
    position,
    disabled,
    verify,
    verifyObj,
    checkType,
}) => {
    const classes = useStyles();
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr: string = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${
        position === 0 || position === 2 ? "10px" : "0"
    }`;
    let gridStyle: GridStyle = { width: "100%" };
    if (position !== -1) gridStyle.padding = pStr;

    // Availability Codes -->  -1: invalid, 0: blank, 1: loading, 2: available, 3: taken
    const [localValue, setLocalValue] = useState<ErrorType>(defaultValue);
    const [error, setError] = useState<ErrorType>(false);
    const [checked, setChecked] = useState<[Array<string>, Array<string>]>([[], []]);
    const [availability, setAvailability] = useState<number>(-1);

    const handleFieldChange: ChangeFunc = (value) => {
        setLocalValue(value);
        let err: ErrorType = false;

        err = basicVerify(
            verifyObj.name,
            value,
            verifyObj.required,
            verifyObj.range,
            verifyObj.int,
            verifyObj.email,
            verifyObj.ascii,
            verifyObj.alphaNum
        );

        if (err) {
            setAvailability(-1);
            return { returnError: false, error: false, overwrite: false };
        }
        if (!verifyObj.required && !value) {
            setAvailability(-1);
            setError(false);
            setValue(value);
            return { returnError: false, error: false, overwrite: false };
        }

        if (checked[0].includes(value)) {
            setAvailability(2);
        } else if (checked[1].includes(value)) {
            setAvailability(3);
            err = "Username in use.";
        } else {
            setAvailability(0);
            err = "Please check availability.";
        }

        if (err) {
            setError(err);
            setValue(false);
        } else {
            setError(false);
            setValue(value);
        }

        return { returnError: false, error: false, overwrite: false };
    };

    const handleCheck = async (): Promise<void> => {
        setAvailability(1);
        if (!localValue) {
            setAvailability(-1);
            return;
        }

        let available: ExistsFuncRes = await checkAvailable(localValue + "", checkType);

        if (available.error) {
            setAvailability(-1);
            return;
        }

        if (available.available) {
            setChecked([[...checked[0], localValue + ""], checked[1]]);
            setAvailability(2);
            setError(false);
            setValue(localValue);
        } else {
            setChecked([checked[0], [...checked[1], localValue + ""]]);
            setAvailability(3);
            setValue(false);
            setError("Username in use.");
        }
    };

    const checkAvailable = async (value: string, type: string): Promise<ExistsFuncRes> => {
        try {
            let response: ExistsHttpResponse = await axios.get(Config.apiUrl + `/auth/exists/?type=${type}&str=${value}`);
            if (response.data.error) {
                console.log(response.data.error);
                return response.data;
            }
            return response.data;
        } catch (err) {
            return { error: err };
        }
    };

    return (
        <Grid item container xs={size} justifyContent="center" alignItems="center" style={gridStyle}>
            <InputField
                label={label}
                type={type}
                defaultValue={defaultValue}
                setValue={setValue}
                onChange={handleFieldChange}
                errorOverwrite={error ? error : false}
                autoComplete={autoComplete}
                size={9}
                position={1}
                disabled={disabled || availability === 1}
                verify={verify}
                verifyObj={verifyObj}
            />
            <Grid
                item
                container
                xs={3}
                direction="column"
                justifyContent="center"
                alignItems="center"
                style={{ width: "100%", padding: "0 20px 0 0" }}
            >
                {availability === 0 || availability === -1 ? (
                    <Button
                        onClick={handleCheck}
                        variant="contained"
                        className={classes.btnWarning}
                        disabled={disabled || availability === -1}
                    >
                        Check
                    </Button>
                ) : (
                    ""
                )}
                {availability === 1 ? <CircularProgress color="secondary" /> : ""}
                {availability === 2 ? <CheckIcon className={classes.textSuccess} /> : ""}
                {availability === 3 ? <ClearIcon className={classes.textError} /> : ""}
                <Typography
                    display="inline"
                    variant="body1"
                    className={availability === 3 ? classes.textError : classes.textSuccess}
                >
                    {availability === 2 ? "Available" : ""}
                    {availability === 3 ? "Taken" : ""}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default InputFieldCheck;
