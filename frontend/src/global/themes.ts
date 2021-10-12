import { green } from "@mui/material/colors";
import { createTheme, Theme } from "@mui/material/styles";

const lightTheme = createTheme({
    palette: {
        mode: "light",
    },
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

const testTheme = createTheme({
    palette: {
        mode: "light",
        primary: green,
        background: {
            default: "#f00",
        },
    },
});

export const themes: Array<Theme> = [lightTheme, darkTheme, testTheme];
