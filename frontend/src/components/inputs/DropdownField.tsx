import { Grid, GridSize } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Dispatch, SetStateAction, useState } from "react";
import { basicVerify } from "../util";
import { ErrorType, VerificationObj, onChangeFuncNum, GridStyle } from "../../global/globalTypes";

interface Props {
    label: string | null;
    variant: "outlined" | "standard" | "filled" | undefined;
    defaultValue: number;
    useDefault: boolean;
    onChange?: onChangeFuncNum;
    setValue: Dispatch<SetStateAction<number>>;
    valuesArr: Array<[number, string]>;
    size: boolean | GridSize | undefined;
    position: number;
    errorOverwrite: ErrorType;
    disabled: boolean;
    verify: boolean;
    verifyObj: VerificationObj;
}

const DropdownField: React.FC<Props> = ({
    label,
    defaultValue,
    useDefault,
    variant,
    onChange,
    setValue,
    valuesArr,
    size,
    position,
    errorOverwrite,
    disabled,
    verify,
    verifyObj,
}) => {
    // position key -> -1: full row, 0: middle, 1: left, 2: right
    const pStr = `0 ${position === 0 || position === 1 ? "10px" : "0"} 0 ${position === 0 || position === 2 ? "10px" : "0"}`;
    let gridStyle: GridStyle = { width: "100%" };
    if (position !== -1) gridStyle.padding = pStr;

    const id = label ? `${label.replace(/\s/g, "")}Select` : null;

    const [error, setError] = useState<ErrorType>(false);

    const handleChange = (value: number): void => {
        let err: ErrorType = false;
        if (verify) {
            err = basicVerify(
                verifyObj.name,
                value + "",
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

        if (err) {
            setError(err);
            setValue(-1);
        } else {
            setError(false);
            setValue(value);
        }
    };

    return (
        <Grid item container alignItems="center" justifyContent="center" xs={size} style={gridStyle}>
            <FormControl variant={variant} style={{ width: "100%" }}>
                {label ? (
                    <InputLabel error={error || errorOverwrite ? true : false} id={id ? id : undefined}>
                        {label}
                    </InputLabel>
                ) : (
                    ""
                )}

                <Select
                    labelId={id ? id : undefined}
                    defaultValue={useDefault ? defaultValue : undefined}
                    value={useDefault ? undefined : defaultValue}
                    disabled={disabled}
                    error={error || errorOverwrite ? true : false}
                    onChange={(e: any) => handleChange(e.target.value)}
                    label={label}
                >
                    {valuesArr.map((val, idx) => (
                        <MenuItem key={idx} value={val[0]}>
                            {val[1]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
    );
};

export default DropdownField;
