import React, { useState } from "react";
import {
  Button,
  Popover,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  styled,
  alpha,
  SelectProps,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { StyledExpandIcon } from "../Colors";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",

  marginBottom: theme.spacing(2.5),
  "& .MuiOutlinedInput-root": {
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  "& .MuiSelect-select": {
    padding: "8px 14px",
  },
}));

const StyledFilterButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: "6px 16px",
  height: 36,
  textTransform: "none",
  borderColor: theme.palette.divider,
  marginRight: theme.spacing(2),

  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main,
  },
  "& .MuiButton-startIcon": {
    marginRight: 8,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  height: 24,
  borderRadius: 12,
  "& .MuiChip-label": {
    fontSize: "0.75rem",
    padding: "0 8px",
  },
}));

const StyledPopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 320,
  maxHeight: "80vh",
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.divider,
    borderRadius: 3,
  },
}));

const MenuProps: SelectProps["MenuProps"] = {
  PaperProps: {
    style: {
      maxHeight: 250,
    },
    elevation: 2,
  },
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
};



const classTypeOptions = [
  "In Person",
  "Hybrid",
  "Synchronous Online",
  "Asynchronous Online",
];

const enrollmentStatusOptions = ["Open", "Waitlisted", "Closed"];

interface FilterDropdownProps {
  sortBy: string;
  selectedClassTypes: string[];
  selectedEnrollmentStatuses: string[];
  onSortChange: (value: string) => void;
  onClassTypesChange: (value: string[]) => void;
  onEnrollmentStatusesChange: (value: string[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  sortBy,
  selectedClassTypes,
  selectedEnrollmentStatuses,
  onSortChange,
  onClassTypesChange,
  onEnrollmentStatusesChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  const getButtonLabel = () => {
    const activeFilters =
      selectedClassTypes.length + selectedEnrollmentStatuses.length;
    return `Filters ${activeFilters > 0 ? `(${activeFilters})` : ""}`;
  };

  return (
    <>
      <StyledFilterButton
        aria-describedby={id}
        onClick={handleClick}
        variant="outlined"
        startIcon={<FilterAltIcon />}
        endIcon={<StyledExpandIcon expanded={open} />}
        disableRipple
      >
        {getButtonLabel()}
      </StyledFilterButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            elevation: 2,
            sx: { mt: 1 },
          },
        }}
      >
        <StyledPopoverContent>
          <StyledFormControl>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Sort by
            </Typography>
            <Select
              size="small"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              MenuProps={MenuProps}
            >
              <MenuItem value="GPA">GPA (High to Low)</MenuItem>
              <MenuItem value="NAME">Title (A-Z)</MenuItem>
              <MenuItem value="CODE">Code (A-Z)</MenuItem>
            </Select>
          </StyledFormControl>

          <StyledFormControl>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Class Type
            </Typography>
            <Select
              multiple
              size="small"
              value={selectedClassTypes}
              onChange={(e) => onClassTypesChange(e.target.value as string[])}
              input={<OutlinedInput />}
              displayEmpty
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return <Typography color="text.secondary">All</Typography>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <StyledChip key={value} label={value} />
                    ))}
                  </Box>
                );
              }}
              MenuProps={MenuProps}
            >
              {classTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={selectedClassTypes.indexOf(option) > -1}
                    sx={{ padding: 0.5 }}
                  />
                  <ListItemText primary={option} sx={{ ml: 1 }} />
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <StyledFormControl>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Enrollment Status
            </Typography>
            <Select
              multiple
              size="small"
              value={selectedEnrollmentStatuses}
              onChange={(e) =>
                onEnrollmentStatusesChange(e.target.value as string[])
              }
              input={<OutlinedInput />}
              displayEmpty
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return <Typography color="text.secondary">All</Typography>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <StyledChip key={value} label={value} />
                    ))}
                  </Box>
                );
              }}
              MenuProps={MenuProps}
            >
              {enrollmentStatusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={selectedEnrollmentStatuses.indexOf(option) > -1}
                    sx={{ padding: 0.5 }}
                  />
                  <ListItemText primary={option} sx={{ ml: 1 }} />
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </StyledPopoverContent>
      </Popover>
    </>
  );
};

export default FilterDropdown;
