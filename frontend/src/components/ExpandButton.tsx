import React from "react";
import { Button, styled } from "@mui/material";
import { ExpandButtonProps, StyledButtonProps, StyledExpandIcon } from "../Constants";


const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "fullWidth",
})<StyledButtonProps>(({ theme, fullWidth }) => ({
  height: "36px",
  borderRadius: "12px",
  padding: "6px 16px",
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  background: `linear-gradient(135deg,
    ${theme.palette.primary.dark} 0%,
    ${theme.palette.primary.main} 100%)`,
  transition: "all 0.2s ease-in-out",

  "&:hover": {
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
    background: `linear-gradient(135deg,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.main} 100%)`,
  },

  "&:active": {
    transform: "translateY(0)",
    filter: "brightness(95%)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },

  [theme.breakpoints.down("sm")]: {
    flex: fullWidth ? 1 : "initial",
    minWidth: fullWidth ? "120px" : "initial",
    marginLeft: fullWidth ? theme.spacing(1) : "initial",
  },
}));

const ExpandButton: React.FC<ExpandButtonProps> = ({
  isExpanded,
  onToggle,
  fullWidth = false,
}) => {
  return (
    <StyledButton
      variant="contained"
      color="primary"
      onClick={onToggle}
      endIcon={<StyledExpandIcon expanded={isExpanded} />}
      fullWidth={fullWidth}
    >
      {isExpanded ? "Collapse" : "Expand"}
    </StyledButton>
  );
};

export default ExpandButton;
