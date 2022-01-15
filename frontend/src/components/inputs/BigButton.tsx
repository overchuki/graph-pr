import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";

// type meaning:
// 0: use children
// 1: use the text
interface Props {
    type: number;
    text: string | undefined;
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
        backgroundColor: theme.palette.grey[800],
        padding: "10px 0 10px 0",
        border: "solid 1px",
        borderColor: theme.palette.grey[500],
        borderRadius: "5px",

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
        <Root style={{ width: "100%", marginTop: "10px" }}>
            <Grid container justifyContent="center" alignItems="center" className={contrast ? classes.btnContrast : classes.btn}>
                {type === 0 ? children : ""}
                {type === 1 ? (
                    <Typography variant="subtitle1" color="text.secondary">
                        {text}
                    </Typography>
                ) : (
                    ""
                )}
            </Grid>
        </Root>
    );
};

export default BigButton;
