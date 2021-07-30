import Link from "react-router-dom/NavLink";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  btn: {
    color: theme.palette.primary.contrastText,
    margin: "0 5px",
  },
  btnContrast: {
    color: theme.palette.secondary.contrastText,
    margin: "0 5px",
  },
}));

const NavBarLinkBtn = ({ path, name, contrast, onLogout }) => {
  const classes = useStyles();

  return (
    <Link to={path} style={{ textDecoration: "none" }}>
      <Button
        onClick={onLogout ? onLogout : () => {}}
        variant={contrast ? "contained" : "text"}
        color={contrast ? "secondary" : "primary"}
        disableElevation={contrast}
        className={contrast ? classes.btnContrast : classes.btn}
      >
        <Typography variant="subtitle1">{name}</Typography>
      </Button>
    </Link>
  );
};

export default NavBarLinkBtn;
