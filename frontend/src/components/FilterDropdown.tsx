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
  IconButton,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { StyledExpandIcon } from "../Constants";
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
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
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
    marginRight: theme.spacing(3),
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  height: 24,
  borderRadius: 4,
  "& .MuiChip-label": {
    fontSize: "0.75rem",
    padding: "0 8px",
  },
}));

const StyledPopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "8px",
  width: 320,
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.divider,
    borderRadius: 3,
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: "100%",
  "& .MuiToggleButtonGroup-grouped": {
    borderRadius: "8px",
    flex: 1,
    border: `1px solid ${theme.palette.divider}`,
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
    "&:first-of-type": {},
  },
}));

const MenuProps: SelectProps["MenuProps"] = {
  PaperProps: {
    style: {
      borderRadius: "12px",
      maxHeight: 300,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.08)",
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
}));
const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: "4px",
  "& .MuiSvgIcon-root": {
    fontSize: 20,
  },
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },
}));
const classTypeOptions = [
  "In Person",
  "Hybrid",
  "Synchronous Online",
  "Asynchronous Online",
];

const enrollmentStatusOptions = ["Open", "Wait List", "Closed"];

interface FilterDropdownProps {
  codes: string[];
  selectedSubjects: string[];
  GEs: string[];
  sortBy: string;
  selectedGEs: string[];
  selectedClassTypes: string[];
  selectedEnrollmentStatuses: string[];
  onSortBy: (value: string) => void;
  onSelectedSubjectsChange: (value: string[]) => void;
  onClassTypesChange: (value: string[]) => void;
  onEnrollmentStatusesChange: (value: string[]) => void;
  onSelectedGEs: (value: string[]) => void;
  currentSort?: string;
}

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  const handleChipDelete = (
    selectedItems: string[],
    setSeletedItems: any,
    event: React.MouseEvent,
    value: string
  ) => {
    event.stopPropagation();
    const updatedSelection = selectedItems.filter((item) => item !== value);
    setSeletedItems(updatedSelection);
  };

  const getButtonLabel = () => {
    const totalFilters =
      selectedSubjects.length +
      selectedClassTypes.length +
      selectedEnrollmentStatuses.length +
      (GEs.length > 1 ? selectedGEs.length : 0);
    return `Filters ${totalFilters > 0 ? `(${totalFilters})` : ""}`;
  };

  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    newSort: string | null
  ) => {
    if (newSort !== null && onSortBy) {
      onSortBy(newSort);
    }
  };

  const renderFilterHeader = (
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
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex" }}>
        <Tooltip title="Select All">
          <IconButton
            size="small"
            onClick={() => onSelectedItems(allItems)}
            sx={{ p: 0.5, borderRadius: "8px" }}
          >
            <SelectAllIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {selectedItems.length > 0 && (
          <Tooltip title="Clear">
            <IconButton
              size="small"
              onClick={() => onSelectedItems([])}
              sx={{ p: 0.5, borderRadius: "8px" }}
            >
              <DeleteForeverIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <StyledFilterButton
          aria-describedby={id}
          onClick={handleClick}
          variant="outlined"
          startIcon={<FilterAltIcon />}
          endIcon={<StyledExpandIcon expanded={open} />}
        >
          {getButtonLabel()}
        </StyledFilterButton>
      </Box>

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
            sx: { mt: 1, borderRadius: "8px" },
          },
        }}
      >
        <StyledPopoverContent>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
            >
              Sort By
            </Typography>
            <StyledToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={handleSortChange}
              aria-label="sort order"
              size="small"
            >
              <Tooltip title="Default (GPA and Ratings)">
                <ToggleButton
                  value="DEFAULT"
                  aria-label="default order (gpa + ratings)"
                >
                  <TuneIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="GPA">
                <ToggleButton value="GPA" aria-label="default order (gpa)">
                  <EqualizerIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Instructor Ratings">
                <ToggleButton
                  value="INSTRUCTOR"
                  aria-label="order by instructor ratings"
                >
                  <StarIcon />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Alphabetical">
                <ToggleButton
                  value="ALPHANUMERIC"
                  aria-label="alphanumeric order"
                >
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
              displayEmpty
              sx={{ borderRadius: "8px" }}
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return <Typography color="text.secondary">All</Typography>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <StyledChip
                        key={value}
                        label={value}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDelete={(event) =>
                          handleChipDelete(
                            selectedEnrollmentStatuses,
                            onEnrollmentStatusesChange,
                            event,
                            value
                          )
                        }
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={MenuProps}
            >
              {enrollmentStatusOptions.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} sx={{ ml: 1 }} />
                  {selectedEnrollmentStatuses.includes(option) && (
                    <CheckIcon
                      sx={{
                        fontSize: 18,
                        color: "primary.main",
                        marginLeft: "auto",
                      }}
                    />
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
              sx={{ borderRadius: "8px" }}
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
                      <StyledChip
                        key={value}
                        label={value}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDelete={(event) =>
                          handleChipDelete(
                            selectedClassTypes,
                            onClassTypesChange,
                            event,
                            value
                          )
                        }
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={MenuProps}
            >
              {classTypeOptions.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} sx={{ ml: 1 }} />
                  {selectedClassTypes.includes(option) && (
                    <CheckIcon
                      sx={{
                        fontSize: 18,
                        color: "primary.main",
                        marginLeft: "auto",
                      }}
                    />
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
              size="small"
              value={selectedSubjects}
              onChange={(e) =>
                onSelectedSubjectsChange(e.target.value as string[])
              }
              sx={{ borderRadius: "8px" }}
              input={<OutlinedInput />}
              displayEmpty
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return <Typography color="text.secondary">All</Typography>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <StyledChip
                        key={value}
                        label={value}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDelete={(event) =>
                          handleChipDelete(
                            selectedSubjects,
                            onSelectedSubjectsChange,
                            event,
                            value
                          )
                        }
                      />
                    ))}
                  </Box>
                );
              }}
              MenuProps={MenuProps}
            >
              {codes?.map((option) => (
                <StyledMenuItem key={option} value={option}>
                  <ListItemText primary={option} sx={{ ml: 1 }} />
                  {selectedSubjects.includes(option) && (
                    <CheckIcon
                      sx={{
                        fontSize: 18,
                        color: "primary.main",
                        marginLeft: "auto",
                      }}
                    />
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
                size="small"
                sx={{ borderRadius: "8px" }}
                value={selectedGEs}
                onChange={(e) => onSelectedGEs(e.target.value as string[])}
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(selected) => {
                  if ((selected as string[]).length === 0) {
                    return <Typography color="text.secondary">None</Typography>;
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <StyledChip
                          key={value}
                          label={value}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDelete={(event) =>
                            handleChipDelete(
                              selectedGEs,
                              onSelectedGEs,
                              event,
                              value
                            )
                          }
                        />
                      ))}
                    </Box>
                  );
                }}
                MenuProps={MenuProps}
              >
                {GEs?.map((option) => (
                  <StyledMenuItem key={option} value={option}>
                    <ListItemText primary={option} sx={{ ml: 1 }} />
                    {selectedGEs.includes(option) && (
                      <CheckIcon
                        sx={{
                          fontSize: 18,
                          color: "primary.main",
                          marginLeft: "auto",
                        }}
                      />
                    )}
                  </StyledMenuItem>
                ))}
              </Select>
            </StyledFormControl>
          )}
        </StyledPopoverContent>
      </Popover>
    </>
  );
};

export default FilterDropdown;
