import React, { useState, useContext } from "react";
import createTheme from "@material-ui/core/styles/createTheme";

const defaultTheme = 1;

export const useDefaultTheme = () => {
    return defaultTheme;
};

const ThemeContext = React.createContext();
const ThemeUpdateContext = React.createContext();

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
        background: {
            default: "#f00",
        },
    },
});

const themes = [lightTheme, darkTheme, testTheme];

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const useUpdateTheme = () => {
    return useContext(ThemeUpdateContext);
};

export const ThemeCtxProvider = ({ children }) => {
    const [theme, setTheme] = useState(themes[defaultTheme]);

    const setThemeFunc = (n) => {
        if (n < themes.length) {
            setTheme(themes[n]);
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            <ThemeUpdateContext.Provider value={(n) => setThemeFunc(n)}>{children}</ThemeUpdateContext.Provider>
        </ThemeContext.Provider>
    );
};
