import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import { GridSize } from "@mui/material";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import Config from "../../Config";
import InputField from "./InputField";
import { basicVerify } from "../util";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { ErrorType, VerificationObj, onChangeFuncStr, GridStyle } from "../../global/globalTypes";

const PREFIX = "InFieldCheck";
const classes = {
    root: `${PREFIX}-root`,
    textSuccess: `${PREFIX}-textSuccess`,
    textError: `${PREFIX}-textError`,
};
const Root = styled("div")(({ theme }) => ({
    [`&.${classes.root}`]: {
        textAlign: "center",
    },
    [`& .${classes.textSuccess}`]: {
        color: theme.palette.success.main,
    },
    [`& .${classes.textError}`]: {
        color: theme.palette.error.main,
    },
}));

interface ExistsHttpResponse {
    data: { success?: { available: boolean }; error?: string };
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
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr: string = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;
    let gridStyle: GridStyle = { width: "100%" };
    if (position !== -1) gridStyle.padding = pStr;

    // Availability Codes -->  -1: invalid, 0: blank, 1: loading, 2: available, 3: taken
    const [localValue, setLocalValue] = useState<ErrorType>(defaultValue);
    const [error, setError] = useState<ErrorType>(false);
    const [checked, setChecked] = useState<[Array<string>, Array<string>]>([[], []]);
    const [availability, setAvailability] = useState<number>(-1);

    const handleFieldChange: onChangeFuncStr = (value: any) => {
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

        let res: ExistsHttpResponse = await checkAvailable(localValue + "", checkType);

        if (res.data.error) {
            setAvailability(-1);
            return;
        }

        if (res.data.success) {
            if (res.data.success.available) {
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
        } else {
            setError("Unknown server error");
        }
    };

    const checkAvailable = async (value: string, type: string): Promise<ExistsHttpResponse> => {
        try {
            let response: ExistsHttpResponse = await axios.get(Config.apiUrl + `/auth/exists/?type=${type}&str=${value}`);
            return response;
        } catch (err: any) {
            return { data: { error: err.message } };
        }
    };

    return (
        <Grid item container xs={size} justifyContent="center" alignItems="center" style={gridStyle}>
            <InputField
                label={label}
                type={type}
                value={defaultValue}
                controlled={false}
                setValue={setValue}
                keyChange={(keyString: any) => {
                    if (keyString === "Enter" && availability === 0) handleCheck();
                }}
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
                <Root className={classes.root}>
                    {availability === 0 || availability === -1 ? (
                        <Button onClick={handleCheck} variant="contained" color="warning" disabled={disabled || availability === -1}>
                            Check
                        </Button>
                    ) : (
                        ""
                    )}
                    {availability === 1 ? <CircularProgress color="secondary" /> : ""}
                    {availability === 2 ? <CheckIcon className={classes.textSuccess} /> : ""}
                    {availability === 3 ? <ClearIcon className={classes.textError} /> : ""}
                    <Typography display="inline" variant="body1" className={availability === 3 ? classes.textError : classes.textSuccess}>
                        {availability === 2 ? "Available" : ""}
                        {availability === 3 ? "Taken" : ""}
                    </Typography>
                </Root>
            </Grid>
        </Grid>
    );
};

export default InputFieldCheck;
