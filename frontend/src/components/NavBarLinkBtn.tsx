import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        btn: {
            color: theme.palette.primary.contrastText,
            margin: "0 5px",
        },
        btnContrast: {
            color: theme.palette.secondary.contrastText,
            margin: "0 5px",
        },
    })
);

interface Props {
    path: string;
    name: string;
    contrast: boolean;
    logoutBtn: boolean;
    onLogout: () => void;
}

const NavBarLinkBtn: React.FC<Props> = ({ path, name, contrast, logoutBtn, onLogout }) => {
    const classes = useStyles();

    return (
        <Link to={path} style={{ textDecoration: "none" }}>
            <Button
                onClick={logoutBtn ? onLogout : () => {}}
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
