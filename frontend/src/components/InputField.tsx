import { Grid, GridSize } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Dispatch, SetStateAction, useState } from "react";
import { basicVerify, dobVerify } from "./util";
import { ErrorType, VerificationObj, onChangeFuncStr, GridStyle, keyChangeFunc } from "../global/globalTypes";

interface Props {
    label: string;
    defaultValue: string;
    onChange?: onChangeFuncStr;
    keyChange?: keyChangeFunc;
    setValue: Dispatch<SetStateAction<ErrorType>>;
    errorOverwrite: ErrorType;
    autoComplete: string;
    size: boolean | GridSize | undefined;
    type: string;
    position: number;
    disabled: boolean;
    verify: boolean;
    verifyObj: VerificationObj;
}

const InputField: React.FC<Props> = ({
    label,
    defaultValue,
    onChange,
    keyChange,
    setValue,
    errorOverwrite,
    autoComplete,
    size,
    type,
    position,
    disabled,
    verify,
    verifyObj,
}) => {
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr: string = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;
    let gridStyle: GridStyle = { width: "100%" };
    if (position !== -1) gridStyle.padding = pStr;

    const [error, setError] = useState<ErrorType>(false);

    const handleChange = (value: string): void => {
        let err: ErrorType = false;
        if (verify) {
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
        }

        if (onChange) {
            let cngObj = onChange(value);
            if (cngObj.returnError && (!err || cngObj.overwrite)) {
                err = false;
                errorOverwrite = cngObj.error;
            }
        }

        if (verifyObj.dob) {
            let dobResponse = dobVerify(value);
            if (dobResponse.error) err = dobResponse.error;
            else value = dobResponse.formatted || value;
        }

        if (err) {
            setError(err);
            setValue(false);
        } else {
            setError(false);
            setValue(value);
        }
    };

    return (
        <Grid item container alignItems="center" justifyContent="center" xs={size} style={gridStyle}>
            <TextField
                label={errorOverwrite || error ? error || errorOverwrite : label}
                type={type}
                defaultValue={defaultValue}
                error={error || errorOverwrite ? true : false}
                onChange={(e) => handleChange(e.target.value)}
                autoComplete={autoComplete}
                variant="outlined"
                color="primary"
                disabled={disabled}
                style={{
                    width: "100%",
                }}
                onKeyDown={(e) => {
                    if (keyChange) keyChange(e.key);
                }}
            />
        </Grid>
    );
};

export default InputField;
