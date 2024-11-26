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
  "& .MuiButton-startIcon": {
    marginRight: 8,
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
      borderRadius: "8px",
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

const enrollmentStatusOptions = ["Open", "Wait List", "Closed"];

interface FilterDropdownProps {
  codes: string[];
  selectedSubjects: string[];
  GEs: string[];
  selectedGEs: string[];

  selectedClassTypes: string[];
  selectedEnrollmentStatuses: string[];
  onSelectedSubjectsChange: (value: string[]) => void;
  onClassTypesChange: (value: string[]) => void;
  onEnrollmentStatusesChange: (value: string[]) => void;
  onSelectedGEs: (value: string[]) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  codes,
  GEs,
  selectedGEs,
  selectedSubjects,
  selectedClassTypes,
  selectedEnrollmentStatuses,
  onSelectedSubjectsChange,
  onClassTypesChange,
  onEnrollmentStatusesChange,
  onSelectedGEs,
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
            sx: { mt: 1, borderRadius: "8px" },
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
              sx={{ borderRadius: "8px" }}
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return <Typography color="text.secondary">All</Typography>;
                }
                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      alignItems: "center",
                    }}
                  >
                    {(selected as string[]).map((value) => (
                      <StyledChip
                        key={value}
                        onMouseDown={(e) => e.stopPropagation()}
                        label={value}
                        onClick={(event) =>
                          handleChipDelete(
                            selectedEnrollmentStatuses,
                            onEnrollmentStatusesChange,
                            event,
                            value
                          )
                        }
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
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={selectedEnrollmentStatuses.indexOf(option) > -1}
                    sx={{ padding: 0.5, borderRadius: "8px" }}
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
              Class Type
            </Typography>
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
                        onClick={(event) =>
                          handleChipDelete(
                            selectedClassTypes,
                            onClassTypesChange,
                            event,
                            value
                          )
                        }
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
              Subjects
            </Typography>
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
                        onClick={(event) =>
                          handleChipDelete(
                            selectedSubjects,
                            onSelectedSubjectsChange,
                            event,
                            value
                          )
                        }
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
                <MenuItem key={option} value={option}>
                  <Checkbox
                    checked={selectedSubjects?.indexOf(option) > -1}
                    sx={{ padding: 0.5 }}
                  />
                  <ListItemText primary={option} sx={{ ml: 1 }} />
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
          {GEs?.length > 1 && (
            <StyledFormControl>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                GEs
              </Typography>
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
                    return <Typography color="text.secondary">All</Typography>;
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <StyledChip
                          key={value}
                          label={value}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(event) =>
                            handleChipDelete(
                              selectedGEs,
                              onSelectedGEs,
                              event,
                              value
                            )
                          }
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
                  <MenuItem key={option} value={option}>
                    <Checkbox
                      checked={selectedGEs?.indexOf(option) > -1}
                      sx={{ padding: 0.5 }}
                    />
                    <ListItemText primary={option} sx={{ ml: 1 }} />
                  </MenuItem>
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
