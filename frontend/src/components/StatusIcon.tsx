import { styled } from "@mui/material/styles";
import { Box, Tooltip, SvgIcon } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockIcon from "@mui/icons-material/Lock";
import { ClassStatusEnum } from "../Constants";

const StyledStatusIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 0.2s ease-in-out",
}));

const StatusIcon = ({ status }: { status: ClassStatusEnum }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Open":
        return {
          icon: (
            <CircleIcon
              sx={{
                fontSize: 12,
                color: (theme) => theme.palette.success.main,
                filter: "drop-shadow(0 2px 4px rgba(0,200,0,0.2))",
              }}
            />
          ),
          label: "Open",
        };
      case "Wait List":
        return {
          icon: (
            <AccessTimeIcon
              sx={{
                fontSize: 16,
                color: (theme) => theme.palette.warning.main,
                filter: "drop-shadow(0 2px 4px rgba(255,150,0,0.2))",
              }}
            />
          ),
          label: "Waitlist available",
        };
      case "Closed":
        return {
          icon: (
            <LockIcon
              sx={{
                fontSize: 14,
                color: (theme) => theme.palette.error.main,
                filter: "drop-shadow(0 2px 4px rgba(200,0,0,0.2))",
              }}
            />
          ),
          label: "Closed",
        };
      default:
        return {
          icon: (
            <CircleIcon
              sx={{
                fontSize: 12,
                color: (theme) => theme.palette.grey[400],
              }}
            />
          ),
          label: "Unknown status",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tooltip title={config.label} arrow disableInteractive>
      <StyledStatusIcon sx={{ zIndex: 0 }}>{config.icon}</StyledStatusIcon>
    </Tooltip>
  );
};

export default StatusIcon;
