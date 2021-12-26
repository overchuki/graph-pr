import React, { useState } from "react";
import axios from "axios";
import Config from "../Config";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import NavBarLink from "./NavBarLink";
import NavBarLinkBtn from "./NavBarLinkBtn";
import { RootState } from "../global/store";
import { useAppDispatch, useAppSelector } from "../global/hooks";
import { logoutUser, setDefaultTheme } from "../global/actions";
import { HTTPBasicResponse } from "../global/globalTypes";

const Navbar: React.FC = () => {
    const user = useAppSelector((state: RootState) => state.user);
    const dispatch = useAppDispatch();

    const [logoutDialogState, setLogoutDialogState] = useState<boolean>(false);

    const logoutDialogOpen = (): void => {
        setLogoutDialogState(true);
    };

    const logoutDialogClose = (): void => {
        setLogoutDialogState(false);
    };

    const logout = async (): Promise<void> => {
        let response: { data: HTTPBasicResponse } = await axios.post(
            Config.apiUrl + "/auth/logout/",
            {},
            {
                withCredentials: true,
            }
        );

        if (response.data.success) {
            dispatch(logoutUser());
            dispatch(setDefaultTheme());
        } else {
            console.log(response);
        }
    };

    return (
        <>
            <Dialog
                open={logoutDialogState}
                onClose={logoutDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Logout?</DialogTitle>
                <DialogActions>
                    <Button variant="contained" onClick={logoutDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            logout();
                            logoutDialogClose();
                        }}
                        color="primary"
                        autoFocus
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
            <AppBar position="static" color="primary">
                <Toolbar
                    style={{
                        margin: "0 10% 0 10%",
                    }}
                >
                    <NavBarLink path="/" name="Home" />
                    <NavBarLink path="/nutrition" name="Nutrition" />
                    <NavBarLink path="/meals" name="Meals" />
                    <NavBarLink path="/lifting" name="Lifting" />
                    <NavBarLink path="/bodyweight" name="Bodyweight" />
                    <div style={{ flexGrow: 1 }} />
                    {user ? (
                        <React.Fragment>
                            <NavBarLinkBtn
                                path="/profile"
                                name="PROFILE"
                                contrast={true}
                                logoutBtn={false}
                                onLogout={async () => {}}
                            />
                            <NavBarLinkBtn
                                path="/"
                                name="LOG OUT"
                                contrast={false}
                                logoutBtn={true}
                                onLogout={logoutDialogOpen}
                            />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <NavBarLinkBtn
                                path="/signup"
                                name="SIGN UP"
                                contrast={true}
                                logoutBtn={false}
                                onLogout={async () => {}}
                            />
                            <NavBarLinkBtn
                                path="/login"
                                name="LOG IN"
                                contrast={false}
                                logoutBtn={false}
                                onLogout={async () => {}}
                            />
                        </React.Fragment>
                    )}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default Navbar;
