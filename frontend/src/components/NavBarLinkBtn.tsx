import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const PREFIX = "NavBarLinkBtn";
const classes = {
    btn: `${PREFIX}-btn`,
    btnContrast: `${PREFIX}-btnContrast`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.btn}`]: {
        color: theme.palette.primary.main,
        margin: "0 5px",
    },
    [`& .${classes.btnContrast}`]: {
        color: theme.palette.secondary.main,
        margin: "0 5px",
    },
}));

interface Props {
    path: string;
    name: string;
    contrast: boolean;
    logoutBtn: boolean;
    onLogout: () => void;
}

const NavBarLinkBtn: React.FC<Props> = ({ path, name, contrast, logoutBtn, onLogout }) => {
    return (
        <Root>
            <Link to={path} style={{ textDecoration: "none" }}>
                <Button
                    onClick={logoutBtn ? onLogout : () => {}}
                    variant={contrast ? "outlined" : "outlined"}
                    color={contrast ? "secondary" : "primary"}
                    disableElevation={contrast}
                    className={contrast ? classes.btnContrast : classes.btn}
                >
                    <Typography variant="subtitle1">{name}</Typography>
                </Button>
            </Link>
        </Root>
    );
};

export default NavBarLinkBtn;
