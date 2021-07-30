import React, { useState, useContext } from "react";
import createTheme from "@material-ui/core/styles/createTheme";

const ThemeContext = React.createContext();
const ThemeUpdateContext = React.createContext();

const lightTheme = createTheme({});

const darkTheme = createTheme({
  palette: {
    type: "dark",
  },
});

const themes = [lightTheme, darkTheme];

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const useUpdateTheme = () => {
  return useContext(ThemeUpdateContext);
};

export const ThemeCtxProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes[0]);

  const setThemeFunc = (n) => {
    if (n < themes.length) {
      setTheme(themes[n]);
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeUpdateContext.Provider value={(n) => setThemeFunc(n)}>
        {children}
      </ThemeUpdateContext.Provider>
    </ThemeContext.Provider>
  );
};
