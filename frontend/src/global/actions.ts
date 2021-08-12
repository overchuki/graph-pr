import * as actionTypes from "./actionTypes";
import { userData } from "./globalTypes";

export const loginUser = (user: userData) => {
    return {
        type: actionTypes.USER_LOGIN,
        payload: {
            user,
        },
    };
};

export const logoutUser = () => {
    return {
        type: actionTypes.USER_LOGOUT,
        payload: {},
    };
};

export const setTheme = (theme: number) => {
    return {
        type: actionTypes.SET_THEME,
        payload: {
            theme,
        },
    };
};

export const setDefaultTheme = () => {
    return {
        type: actionTypes.SET_DEFAULT_THEME,
        payload: {},
    };
};
