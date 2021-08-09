import { Grid, GridSize } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Dispatch, SetStateAction, useState } from "react";
import { basicVerify } from "./ServiceFunctions";

type ErrorType = string | boolean;
type ChangeFunc = (val: number) => { returnError: boolean; error: ErrorType };

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

interface Props {
    label: string;
    defaultValue: number;
    onChange?: ChangeFunc;
    setValue: Dispatch<SetStateAction<number>>;
    valuesArr: Array<[number, string]>;
    size: boolean | GridSize | undefined;
    position: number;
    errorOverwrite: boolean;
    disabled: boolean;
    verify: boolean;
    verifyObj: VerificationObj;
}

interface GridStyle {
    width: string;
    padding?: string;
}

const DropdownField: React.FC<Props> = ({
    label,
    defaultValue,
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

    const id = `${label.replace(/\s/g, "")}Select`;

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
            if (cngObj.returnError) err = cngObj.error;
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
            <FormControl variant="outlined" style={{ width: "100%" }}>
                <InputLabel error={error || errorOverwrite ? true : false} id={id}>
                    {label}
                </InputLabel>
                <Select
                    labelId={id}
                    defaultValue={defaultValue}
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
