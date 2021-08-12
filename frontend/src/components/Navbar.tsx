import React, { useState } from "react";
import axios from "axios";
import Config from "../Config";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
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
            <AppBar position="static">
                <Toolbar
                    style={{
                        margin: "0 10% 0 10%",
                    }}
                >
                    <NavBarLink path="/" name="Home" contrast={false} />
                    <NavBarLink path="/nutrition" name="Nutrition" contrast={false} />
                    <NavBarLink path="/lifting" name="Lifting" contrast={false} />
                    <NavBarLink path="/bodyweight" name="Bodyweight" contrast={false} />
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
