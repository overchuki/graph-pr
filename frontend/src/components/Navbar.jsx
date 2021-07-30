import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import NavBarLink from "./NavBarLink";
import { useUpdateUser, useUser } from "../contexts/UserContext";
import { useUpdateTheme } from "../contexts/ThemeContext";
import NavBarLinkBtn from "./NavBarLinkBtn";
import React from "react";
import Config from "../Config";
import axios from "axios";

const Navbar = () => {
  const user = useUser();
  const updateUser = useUpdateUser();
  const updateTheme = useUpdateTheme();

  let logout = async () => {
    let response = await axios.post(
      Config.apiURL + "/auth/logout/",
      {},
      {
        withCredentials: true,
      }
    );
    response = response.data;

    if (response.success) {
      updateUser(false);
      updateTheme(0);
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
              onLogout={false}
            />
            <NavBarLinkBtn
              path="/"
              name="LOG OUT"
              contrast={false}
              onLogout={logout}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <NavBarLinkBtn
              path="/signup"
              name="SIGN UP"
              contrast={true}
              onLogout={false}
            />
            <NavBarLinkBtn
              path="/login"
              name="LOG IN"
              contrast={false}
              onLogout={false}
            />
          </React.Fragment>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
