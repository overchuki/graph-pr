import React, { useState } from "react";
import axios from "axios";
import Config from "../../Config";
import { Link } from "react-router-dom";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import NavBarLink from "./NavBarLink";
import NavBarLinkBtn from "./NavBarLinkBtn";
import { RootState } from "../../global/store";
import { useAppDispatch, useAppSelector } from "../../global/hooks";
import { logoutUser, setDefaultTheme } from "../../global/actions";
import { HTTPBasicResponse } from "../../global/globalTypes";

const Navbar: React.FC = () => {
    const user = useAppSelector((state: RootState) => state.user);
    const dispatch = useAppDispatch();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
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
            handleClose();
        } else {
            console.log(response);
        }
    };

    return (
        <>
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
                        <>
                            <IconButton
                                aria-controls={open ? "basic-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? "true" : undefined}
                                onClick={handleClick}
                            >
                                <Avatar
                                    src="../../public/icons/defaultUser.png"
                                    style={{
                                        margin: "0",
                                        width: "30px",
                                        height: "30px",
                                    }}
                                />
                            </IconButton>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    "aria-labelledby": "basic-button",
                                }}
                            >
                                <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
                                    <MenuItem onClick={handleClose} style={{ textDecoration: "none" }}>
                                        Profile
                                    </MenuItem>
                                </Link>
                                <Divider />
                                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </Link>
                            </Menu>
                        </>
                    ) : (
                        <React.Fragment>
                            <NavBarLinkBtn path="/signup" name="Sign Up" contrast={true} logoutBtn={false} onLogout={async () => {}} />
                            <NavBarLinkBtn path="/login" name="Log In" contrast={false} logoutBtn={false} onLogout={async () => {}} />
                        </React.Fragment>
                    )}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default Navbar;
