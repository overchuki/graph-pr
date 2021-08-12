import * as actionTypes from "./actionTypes";
import { userData } from "./globalTypes";

export type storeState = {
    user: boolean | userData;
    theme: number;
};

export const defaultThemeIdx = 1;

const defaultState = {
    user: false,
    theme: defaultThemeIdx,
};

export const reducer = (state: storeState = defaultState, action: { type: string; payload: any }) => {
    switch (action.type) {
        case actionTypes.USER_LOGIN:
            return { ...state, user: action.payload.user };
        case actionTypes.USER_LOGOUT:
            return defaultState;
        case actionTypes.SET_THEME:
            return { ...state, theme: action.payload.theme };
        case actionTypes.SET_DEFAULT_THEME:
            return { ...state, theme: defaultThemeIdx };
        default:
            return state;
    }
};
