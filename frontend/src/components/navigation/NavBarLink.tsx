import { NavLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const PREFIX = "NavBarLink";
const classes = {
    linkStyle: `${PREFIX}-linkStyle`,
    activeLinkStyle: `${PREFIX}-activeLinkStyle`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.linkStyle}`]: {
        textDecoration: "none",
        color: theme.palette.primary.main,
        padding: theme.spacing(2),
    },
    [`& .${classes.activeLinkStyle}`]: {
        color: theme.palette.primary.dark,
    },
}));

interface Props {
    path: string;
    name: string;
    exact: boolean;
}

const NavBarLink: React.FC<Props> = ({ path, name, exact }) => {
    let className: string = classes.linkStyle;
    let activeClassName: string = classes.activeLinkStyle;

    return (
        <Root>
            <NavLink to={path} className={className} activeClassName={activeClassName} exact={exact}>
                <Typography display="inline" variant="subtitle1">
                    {name}
                </Typography>
            </NavLink>
        </Root>
    );
};

export default NavBarLink;
