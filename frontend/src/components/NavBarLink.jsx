import NavLink from "react-router-dom/NavLink";
import Typography from "@material-ui/core/Typography";

import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  linkStyle: {
    textDecoration: "none",
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2),

    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  activeLinkStyle: {
    backgroundColor: theme.palette.primary.dark,
  },
  contrastLinkStyle: {
    backgroundColor: theme.palette.secondary.main,

    "&:hover": {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  activeContrastLinkStyle: {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

const NavBarLink = ({ path, name, contrast }) => {
  const classes = useStyles();

  let className = contrast
    ? `${classes.linkStyle} ${classes.contrastLinkStyle}`
    : classes.linkStyle;
  let activeClassName = contrast
    ? `${classes.activeLinkStyle} ${classes.activeContrastLinkStyle}`
    : classes.activeLinkStyle;

  return (
    <NavLink
      to={path}
      className={className}
      activeClassName={activeClassName}
      exact
    >
      <Typography display="inline" variant="subtitle1">
        {name.toUpperCase()}
      </Typography>
    </NavLink>
  );
};

export default NavBarLink;
