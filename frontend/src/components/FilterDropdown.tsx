import React, { useState, useCallback } from "react";
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
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LockIcon from "@mui/icons-material/Lock";
import ComputerIcon from "@mui/icons-material/Computer";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import CategoryIcon from "@mui/icons-material/Category";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  careersOptions,
  classTypeOptions,
  enrollmentStatusOptions,
  FilterDropdownProps,
  prereqOptions,
  StyledExpandIcon,
} from "../Constants";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    backgroundColor: "white",
    borderRadius: "4px",
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
  marginRight: theme.spacing(2),
  textTransform: "none",
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  [theme.breakpoints.down("sm")]: {
    ".MuiButton-startIcon, .MuiButton-endIcon": {
      margin: 0, // Remove margin for small screens
    },
  },
  transition: "all 0.2s ease-in-out",
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
  [theme.breakpoints.down("sm")]: {
    "& .MuiPopover-paper": {
      overflow: "visible",
    },
    backgroundColor: alpha(theme.palette.action.disabledBackground, 0.5),
  },
  "& .MuiPopover-paper": {
    borderRadius: "8px",

    backgroundColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      width: "calc(100dvw - 32px)",
      height: `calc(100dvh - 64px)`,
      position: "fixed",
      top: "64px !important",
      left: "0px !important",
      bottom: "0 !important",
      transform: "none !important",
      margin: 0,
      maxWidth: "100%",
      maxHeight: "none",
    },
  },
}));
const StyledPopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: 0,
  width: 320,
  overflow: "auto",

  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    height: "100%",
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
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
  minHeight: "44px",
  color: theme.palette.text.secondary,
  gap: "8px",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main, 
  },
  "&.Mui-selected": {
    color: theme.palette.text.primary, 
    "& .MuiSvgIcon-root": {
      color: theme.palette.primary.main, 
    },
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
  
}));
const MenuProps: SelectProps["MenuProps"] = {
  PaperProps: {
    style: {
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
  selectedCareers,
  selectedPrereqs,
  onSortBy,
  onSelectedSubjectsChange,
  onClassTypesChange,
  onEnrollmentStatusesChange,
  onSelectedGEs,
  onSelectedCareersChange,
  onSelectedPrereqsChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
      (GEs?.length > 1 ? selectedGEs.length : 0) +
      selectedCareers.length +
      selectedPrereqs.length;
    return `${isMobile ? "" : "Filters"} ${
      totalFilters > 0 ? `(${totalFilters})` : ""
    }`;
  }, [
    selectedSubjects,
    selectedClassTypes,
    selectedEnrollmentStatuses,
    selectedGEs,
    GEs,
    selectedCareers,
    selectedPrereqs,
    isMobile,
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
              onDelete={(event) =>
                handleChipDelete(selected, onDelete, event, value)
              }
            />
          ))}
        </Box>
      );
    },
    [handleChipDelete]
  );

  return (
    <>
      <StyledFilterButton
        onClick={handleClick}
        variant="outlined"
        startIcon={<FilterAltIcon />}
        endIcon={<StyledExpandIcon expanded={open} />}
      >
        {getButtonLabel()}
      </StyledFilterButton>

      <StyledPopover
        transitionDuration={{ enter: 200, exit: isMobile ? 150 : 200 }}
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
          root: {
            slotProps: {
              backdrop: {
                open: true,
              },
            },
          },
        }}
        elevation={4}
      >
        <StyledPopoverContent>
          {isMobile && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  position: "sticky",
                  top: -8,
                  backgroundColor: "white",
                  zIndex: 1,
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filters
                </Typography>
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{
                    borderRadius: "8px",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </>
          )}

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
              <Tooltip title="Default (Ratings & GPA)">
                <ToggleButton value="DEFAULT">
                  <TuneIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="GPA">
                <ToggleButton value="GPA">
                  <EqualizerIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Ratings">
                <ToggleButton value="INSTRUCTOR">
                  <StarIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="A-Z">
                <ToggleButton value="ALPHANUMERIC">
                  <SortByAlphaIcon />
                </ToggleButton>
              </Tooltip>
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

          <StyledFormControl>
            {renderFilterHeader(
              "Career Type",
              selectedCareers,
              onSelectedCareersChange,
              careersOptions,
              <WorkspacePremiumIcon />
            )}
            <Select
              multiple
              size="small"
              value={selectedCareers}
              onChange={(e) =>
                onSelectedCareersChange(e.target.value as string[])
              }
              input={<OutlinedInput />}
              renderValue={(selected) =>
                renderSelectContent(
                  selected as string[],
                  onSelectedCareersChange
                )
              }
              MenuProps={MenuProps}
            >
              {careersOptions.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} />
                  {selectedCareers.includes(option) && (
                    <CheckIcon sx={{ ml: 1 }} />
                  )}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <StyledFormControl sx={GEs.length < 2 ? { mb: "32px" } : {}}>
            {renderFilterHeader(
              "Prerequisites",
              selectedPrereqs,
              onSelectedPrereqsChange,
              prereqOptions,
              <AssignmentLateIcon />
            )}
            <Select
              multiple
              size="small"
              value={selectedPrereqs}
              onChange={(e) =>
                onSelectedPrereqsChange(e.target.value as string[])
              }
              input={<OutlinedInput />}
              renderValue={(selected) =>
                renderSelectContent(
                  selected as string[],
                  onSelectedPrereqsChange
                )
              }
              MenuProps={MenuProps}
            >
              {prereqOptions.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} />
                  {selectedPrereqs.includes(option) && (
                    <CheckIcon sx={{ ml: 1 }} />
                  )}
                </StyledMenuItem>
              ))}
            </Select>
          </StyledFormControl>

          {GEs?.length > 1 && (
            <StyledFormControl sx={{ mb: "32px" }}>
              {renderFilterHeader(
                "GEs",
                selectedGEs,
                onSelectedGEs,
                GEs,
                <SchoolIcon />
              )}
              <Select
                multiple
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
