import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";

// type meaning:
// 0: use children
// 1: use the text
interface Props {
    type: number;
    text: string | null;
    contrast: boolean;
}

const PREFIX = "BigButton";
const classes = {
    btn: `${PREFIX}-btn`,
    btnContrast: `${PREFIX}-btnContrast`,
};
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.btn}`]: {
        width: "100%",
        backgroundColor: theme.palette.background.paper,

        "&:hover": {
            cursor: "pointer",
        },
    },
    [`& .${classes.btnContrast}`]: {
        width: "100%",
        backgroundColor: theme.palette.background.paper,

        "&:hover": {
            cursor: "pointer",
        },
    },
}));

const BigButton: React.FC<Props> = ({ children, type, text, contrast }) => {
    return (
        <Root style={{ minWidth: "100%" }}>
            <Grid container justifyContent="center" alignItems="center" className={contrast ? classes.btnContrast : classes.btn}>
                {type === 0 ? children : ""}
                {type === 1 ? text : ""}
            </Grid>
        </Root>
    );
};

export default BigButton;
