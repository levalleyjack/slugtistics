import React, { useState, useRef, useCallback } from "react";
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
  ListItemText,
  styled,
  alpha,
  SelectProps,
  IconButton,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LockIcon from "@mui/icons-material/Lock";
import ComputerIcon from "@mui/icons-material/Computer";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import { classTypeOptions, enrollmentStatusOptions, FilterDropdownProps, StyledExpandIcon } from "../Constants";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    backgroundColor: "white",

    borderRadius: "8px",
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
  borderRadius: "8px",
  padding: "6px 16px",
  height: "36px",
  textTransform: "none",
  borderColor: theme.palette.divider,
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main,
  },
  [theme.breakpoints.down("sm")]: {
    marginRight: theme.spacing(1),
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  height: 24,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  "& .MuiChip-label": {
    fontSize: "0.75rem",
    padding: "0 8px",
  },
  "& .MuiChip-deleteIcon": {
    fontSize: "16px",
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.error.main,
    },
  },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  "& .MuiPopover-paper": {
    overflow: "visible",
    backgroundColor: "transparent",
    borderRadius:"8px"
  },
}));

const StyledPopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  width: 320,
  maxHeight: "calc(100vh - 100px)",
  overflow: "auto",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(theme.palette.divider, 0.8),
    borderRadius: 3,
  },
  "& .MuiTypography-root": {
    textShadow: "0 0 1px rgba(255, 255, 255, 0.5)",
  },
  [theme.breakpoints.down("sm")]: {
    width: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 80px)",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: "100%",
  "& .MuiToggleButtonGroup-grouped": {
    borderRadius: "8px",
    flex: 1,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "white",
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing(1),
      borderLeft: `1px solid ${theme.palette.divider}`,
    },
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  margin: "4px 8px",
  borderRadius: "8px",
  padding: "8px 12px",
  minHeight: "36px",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
}));

const MenuProps: SelectProps["MenuProps"] = {
  PaperProps: {
    style: {
      borderRadius: "8px",
      maxHeight: 300,
    },
    elevation: 3,
  },
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  variant: "menu",
};




const FilterDropdown: React.FC<FilterDropdownProps> = ({
  codes,
  GEs,
  sortBy,
  selectedGEs,
  selectedSubjects,
  selectedClassTypes,
  selectedEnrollmentStatuses,
  onSortBy,
  onSelectedSubjectsChange,
  onClassTypesChange,
  onEnrollmentStatusesChange,
  onSelectedGEs,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleChipDelete = useCallback(
    (
      selectedItems: string[],
      setSelectedItems: (items: string[]) => void,
      event: React.MouseEvent,
      value: string
    ) => {
      event.stopPropagation();
      setSelectedItems(selectedItems.filter((item) => item !== value));
    },
    []
  );

  const getButtonLabel = useCallback(() => {
    const totalFilters =
      selectedSubjects.length +
      selectedClassTypes.length +
      selectedEnrollmentStatuses.length +
      (GEs.length > 1 ? selectedGEs.length : 0);
    return `Filters ${totalFilters > 0 ? `(${totalFilters})` : ""}`;
  }, [
    selectedSubjects,
    selectedClassTypes,
    selectedEnrollmentStatuses,
    selectedGEs,
    GEs,
  ]);

  const handleSortChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newSort: string | null) => {
      if (newSort !== null && onSortBy) {
        onSortBy(newSort);
      }
    },
    [onSortBy]
  );

  const renderFilterHeader = useCallback(
    (
      title: string,
      selectedItems: string[],
      onSelectedItems: (value: string[]) => void,
      allItems: string[],
      icon: React.ReactElement
    ) => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Select All">
            <IconButton
              size="small"
              onClick={() => onSelectedItems(allItems)}
              sx={{ borderRadius: "8px" }}
            >
              <SelectAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {selectedItems.length > 0 && (
            <Tooltip title="Clear">
              <IconButton
                size="small"
                onClick={() => onSelectedItems([])}
                sx={{ borderRadius: "8px" }}
              >
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    ),
    []
  );

  const renderSelectContent = useCallback(
    (selected: string[], onDelete: (value: string[]) => void) => {
      
      if (!selected || selected.length === 0) {
        return <Typography>All</Typography>;
      }
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {selected.map((value) => (
            <StyledChip
              key={value}
              label={value}
              onMouseDown={(e) => e.stopPropagation()}
              onDelete={(event) => handleChipDelete(selected, onDelete, event, value)}
            />
          ))}
        </Box>
      );
    },
    []
  );
  

  return (
    <>
      <StyledFilterButton
        aria-describedby={id}
        onClick={handleClick}
        variant="outlined"
        startIcon={<FilterAltIcon />}
        endIcon={<StyledExpandIcon expanded={open} />}
      >
        {getButtonLabel()}
      </StyledFilterButton>

      <StyledPopover
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
        elevation={1}
      >
        <StyledPopoverContent >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Sort By
            </Typography>
            <StyledToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={handleSortChange}
              size="small"
            >
              <ToggleButton value="DEFAULT">
                <TuneIcon />
              </ToggleButton>
              <ToggleButton value="GPA">
                <EqualizerIcon />
              </ToggleButton>
              <ToggleButton value="INSTRUCTOR">
                <StarIcon />
              </ToggleButton>
              <ToggleButton value="ALPHANUMERIC">
                <SortByAlphaIcon />
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 2 }} />

          <StyledFormControl>
            {renderFilterHeader(
              "Enrollment Status",
              selectedEnrollmentStatuses,
              onEnrollmentStatusesChange,
              enrollmentStatusOptions,
              <LockIcon />
            )}
            <Select
              multiple
              size="small"
              value={selectedEnrollmentStatuses}
              onChange={(e) =>
                onEnrollmentStatusesChange(e.target.value as string[])
              }
              input={<OutlinedInput />}
              label="All"
              renderValue={(selected) =>
                renderSelectContent(
                  selected as string[],
                  onEnrollmentStatusesChange
                )
              }
              MenuProps={MenuProps}
            >
              {enrollmentStatusOptions.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} />
                  {selectedEnrollmentStatuses.includes(option) && (
                    <CheckIcon sx={{ ml: 1 }} />
                  )}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <StyledFormControl>
            {renderFilterHeader(
              "Class Type",
              selectedClassTypes,
              onClassTypesChange,
              classTypeOptions,
              <ComputerIcon />
            )}
            <Select
              multiple
              size="small"
              label="All"

              value={selectedClassTypes}
              onChange={(e) => onClassTypesChange(e.target.value as string[])}
              input={<OutlinedInput />}
              renderValue={(selected) =>
                renderSelectContent(selected as string[], onClassTypesChange)
              }
              MenuProps={MenuProps}
            >
              {classTypeOptions.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} />
                  {selectedClassTypes.includes(option) && (
                    <CheckIcon sx={{ ml: 1 }} />
                  )}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <StyledFormControl>
            {renderFilterHeader(
              "Subjects",
              selectedSubjects,
              onSelectedSubjectsChange,
              codes,
              <CategoryIcon />
            )}
            <Select
              multiple
              label="All"

              size="small"
              value={selectedSubjects}
              onChange={(e) =>
                onSelectedSubjectsChange(e.target.value as string[])
              }
              input={<OutlinedInput />}
              renderValue={(selected) =>
                renderSelectContent(
                  selected as string[],
                  onSelectedSubjectsChange
                )
              }
              MenuProps={MenuProps}
            >
              {codes?.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} />
                  {selectedSubjects.includes(option) && (
                    <CheckIcon sx={{ ml: 1 }} />
                  )}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>

          {GEs?.length > 1 && (
            <StyledFormControl>
              {renderFilterHeader(
                "GEs",
                selectedGEs,
                onSelectedGEs,
                GEs,
                <SchoolIcon />
              )}
              <Select
                multiple
                label="All"

                size="small"
                value={selectedGEs}
                onChange={(e) => onSelectedGEs(e.target.value as string[])}
                input={<OutlinedInput />}
                renderValue={(selected) =>
                  renderSelectContent(selected as string[], onSelectedGEs)
                }
                MenuProps={MenuProps}
              >
                {GEs?.map((option) => (
                  <StyledMenuItem key={option} value={option}>
                    <ListItemText primary={option} />
                    {selectedGEs.includes(option) && (
                      <CheckIcon sx={{ ml: 1 }} />
                    )}
                  </StyledMenuItem>
                ))}
              </Select>
            </StyledFormControl>
          )}
        </StyledPopoverContent>
      </StyledPopover>
    </>
  );
};

export default FilterDropdown;
