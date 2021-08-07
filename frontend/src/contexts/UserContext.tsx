import React, { useState, useContext, Context } from "react";

type User = boolean | UserObj;
type SetUserFuncType = (u: User) => void;

interface UserObj {
    name: string;
    username: string;
}

const UserContext: Context<User> = React.createContext<User>(false);
const UserUpdateContext: Context<SetUserFuncType> = React.createContext((u: User) => {});

export const useUser = (): User | boolean => {
    return useContext(UserContext);
};

export const useUpdateUser = (): SetUserFuncType => {
    return useContext(UserUpdateContext);
};

export const UserCtxProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<User>(false);

    const setUserFunc: SetUserFuncType = (u: User): void => {
        setUser(u);
    };

    return (
        <UserContext.Provider value={user}>
            <UserUpdateContext.Provider value={(u: User) => setUserFunc(u)}>{children}</UserUpdateContext.Provider>
        </UserContext.Provider>
    );
};
