import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import NavBarLink from "./NavBarLink";
import { useUpdateUser, useUser } from "../contexts/UserContext";
import { useUpdateTheme } from "../contexts/ThemeContext";
import NavBarLinkBtn from "./NavBarLinkBtn";
import React from "react";
import Config from "../Config";
import axios from "axios";

interface LogoutHttpResponse {
    data: {
        success?: string;
        error?: string;
    };
}

const Navbar: React.FC = () => {
    const user = useUser();
    const updateUser = useUpdateUser();
    const updateTheme = useUpdateTheme();

    let logout = async (): Promise<void> => {
        let response: LogoutHttpResponse = await axios.post(
            Config.apiUrl + "/auth/logout/",
            {},
            {
                withCredentials: true,
            }
        );

        if (response.data.success) {
            updateUser(false);
            updateTheme(1);
        } else {
            console.log(response);
        }
    };

    return (
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
                        <NavBarLinkBtn path="/" name="LOG OUT" contrast={false} logoutBtn={true} onLogout={logout} />
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
                        <NavBarLinkBtn path="/login" name="LOG IN" contrast={false} logoutBtn={false} onLogout={async () => {}} />
                    </React.Fragment>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
