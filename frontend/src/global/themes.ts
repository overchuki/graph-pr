import { green } from "@material-ui/core/colors";
import { createTheme, Theme } from "@material-ui/core/styles";

const lightTheme = createTheme({
    palette: {
        type: "light",
    },
});

const darkTheme = createTheme({
    palette: {
        type: "dark",
    },
});

const testTheme = createTheme({
    palette: {
        type: "light",
        primary: green,
        background: {
            default: "#f00",
        },
    },
});

export const themes: Array<Theme> = [lightTheme, darkTheme, testTheme];
