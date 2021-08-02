import React, { useState, useContext } from "react";

const UserContext = React.createContext();
const UserUpdateContext = React.createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const useUpdateUser = () => {
    return useContext(UserUpdateContext);
};

export const UserCtxProvider = ({ children }) => {
    const [user, setUser] = useState(false);

    const setUserFunc = (u) => {
        setUser(u);
    };

    return (
        <UserContext.Provider value={user}>
            <UserUpdateContext.Provider value={(u) => setUserFunc(u)}>{children}</UserUpdateContext.Provider>
        </UserContext.Provider>
    );
};
