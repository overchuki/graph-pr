import React, { useState, useContext, Context } from "react";
import { createTheme, Theme } from "@material-ui/core/styles";

type SetThemeFuncType = (n: number) => void;

const defaultTheme: number = 1;

export const useDefaultTheme = (): number => {
    return defaultTheme;
};

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

const themes: Array<Theme> = [lightTheme, darkTheme, testTheme];

const ThemeContext: Context<Theme> = React.createContext<Theme>(themes[defaultTheme]);
const ThemeUpdateContext: Context<SetThemeFuncType> = React.createContext<SetThemeFuncType>((n: number) => {});

export const useTheme = (): Theme => {
    return useContext(ThemeContext);
};

export const useUpdateTheme = (): SetThemeFuncType => {
    return useContext(ThemeUpdateContext);
};

export const ThemeCtxProvider: React.FC = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(themes[defaultTheme]);

    const setThemeFunc: SetThemeFuncType = (n: number): void => {
        if (n < themes.length) {
            setTheme(themes[n]);
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            <ThemeUpdateContext.Provider value={(n: number) => setThemeFunc(n)}>{children}</ThemeUpdateContext.Provider>
        </ThemeContext.Provider>
    );
};
