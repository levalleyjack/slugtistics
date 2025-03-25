import {
  TextField,
  InputAdornment,
  Popper,
  Paper,
  Typography,
  CircularProgress,
  ClickAwayListener,
  styled,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EqualizerIcon from "@mui/icons-material/Equalizer";

import React, { useState, useMemo, useRef } from "react";
import {
  COLORS,
  Course,
  DifficultyChip,
  getLetterGrade,
  getStatusColor,
  GlobalSearchDropdownProps,
  GradeChip,
  RatingChip,
  StyledExpandIcon,
} from "../Constants";
import StarIcon from "@mui/icons-material/Star";
import StatusIcon from "./StatusIcon";
import ClearIcon from "@mui/icons-material/Clear";

const StyledPopper = styled(Popper)(({ theme }) => ({
  width: "100%",
  zIndex: 10,
  position: "fixed",
}));

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));
const StyledPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxHeight: "calc(100dvh - 150px)",
  border: `1px solid ${theme.palette.divider}`,
  borderTop: "none",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: "8px",
  borderBottomRightRadius: "8px",
  overflowY: "auto",
  boxShadow: theme.shadows[8],
}));
const EndAdornment = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.active, 0.04),
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    cursor: "pointer",
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: "0.75rem",
}));

const NoResults = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const SearchMetrics = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50],
  fontSize: "0.875rem",
  fontWeight: 500,
  position: "sticky",
  zIndex: 1,
  top: 0,
}));

const GlobalSearch = ({
  courses,
  onCourseSelect,
  selectedGE,
  lastUpdated,
  disabled = false,
}: GlobalSearchDropdownProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const allCourses = useMemo(() => {
    if (!courses) return [];

    if (Array.isArray(courses)) {
      return courses;
    }

    return Object.entries(courses).flatMap(([category, categoryCourses]) =>
      categoryCourses.map((course) => ({
        ...course,
        category,
      }))
    );
  }, [courses]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];

    const searchInput = search.toLowerCase().trim();
    const searchTerms = searchInput.split(" ");

    const normalizeInstructorName = (name: string) => {
      const parts = name.toLowerCase().split(" ");
      return {
        firstName: parts[0],
        lastName: parts[parts.length - 1],
        fullName: name.toLowerCase(),
        firstInitial: parts[0].charAt(0),
        parts: parts,
      };
    };

    const matchesInstructor = (instructor: string) => {
      const normalizedInstructor = normalizeInstructorName(instructor);

      if (searchTerms.length === 1) {
        return normalizedInstructor.parts.some((part) =>
          part.startsWith(searchInput)
        );
      }

      if (
        searchTerms.length === 2 &&
        normalizedInstructor.firstInitial === searchTerms[0] &&
        normalizedInstructor.lastName.includes(searchTerms[1])
      ) {
        return true;
      }

      return searchTerms.every((term) =>
        normalizedInstructor.parts.some((part) => part.startsWith(term))
      );
    };

    const containsNumbers = /\d/.test(searchInput);

    if (!containsNumbers) {
      return allCourses
        .filter((course) => {
          const courseName = course.name.toLowerCase();
          const courseCode =
            `${course.subject} ${course.catalog_num}`.toLowerCase();

          return (
            matchesInstructor(course.instructor) ||
            courseName.includes(searchInput) ||
            courseCode.startsWith(searchInput)
          );
        })
        .slice(0, 20);
    }

    const courseCodeMatch = searchInput.match(/^([a-zA-Z]+)\s*(\d+)?$/);

    if (courseCodeMatch) {
      const [_, subject, number] = courseCodeMatch;

      return allCourses
        .filter((course) => {
          const courseSubject = course.subject.toLowerCase();
          const courseCatalogNum = course.catalog_num.toLowerCase();

          if (subject && number) {
            return (
              courseSubject.startsWith(subject.toLowerCase()) &&
              courseCatalogNum.startsWith(number)
            );
          }
          return courseSubject.startsWith(subject.toLowerCase());
        })
        .slice(0, 20);
    }

    return allCourses
      .filter((course) => {
        const courseName = course.name.toLowerCase();
        const courseCode =
          `${course.subject} ${course.catalog_num}`.toLowerCase();

        return (
          matchesInstructor(course.instructor) ||
          courseCode.startsWith(searchInput) ||
          courseName.includes(searchInput)
        );
      })
      .slice(0, 20);
  }, [search, allCourses]);

  const { selectedGECourses, otherCourses } = useMemo(() => {
    if (!selectedGE) {
      return {
        selectedGECourses: [] as Course[],
        otherCourses: searchResults,
      };
    }

    return searchResults.reduce(
      (acc, course) => {
        const courseGE = course.ge_category;
        if (courseGE === selectedGE) {
          acc.selectedGECourses.push(course);
        } else {
          acc.otherCourses.push(course);
        }
        return acc;
      },
      { selectedGECourses: [] as Course[], otherCourses: [] as Course[] }
    );
  }, [searchResults, selectedGE]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setIsOpen(true);
  };

  const handleCourseClick = (course: Course) => {
    onCourseSelect(
      course,
      course.id,
      selectedGE ? course.ge_category : undefined
    );
    setIsOpen(false);
    setSearch("");
  };
  const handleClear = () => {
    setSearch("");
    setIsOpen(false);
  };
  if (disabled && isOpen) {
    setIsOpen(false);
  }

  const toggleExpand = () => {
    setIsOpen(!isOpen);
  };
  const CourseListItem = ({ course }: { course: Course }) => {
    const { instructor_ratings: rmpData } = course;
    return (
      <StyledListItem
        onClick={() => handleCourseClick(course)}
        divider
        secondaryAction={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {course.gpa && (
              <Tooltip title={`Average GPA: ${course.gpa}`}>
                <GradeChip
                  grade={Number(course.gpa)}
                  label={`${getLetterGrade(course.gpa)}`}
                  size="small"
                  sx={{
                    height: "25px",
                    fontSize: "0.7rem",
                  }}
                  interactive={0}
                />
              </Tooltip>
            )}

            {course.ge &&
              course.ge !== "AnyGE" &&
              course.ge_category !== "AnyGE" && (
                <CategoryChip
                  label={course.ge || course.ge_category}
                  size="small"
                />
              )}
          </div>
        }
      >
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle2" component="span">
                {`${course.subject} ${course.catalog_num}`}
              </Typography>
              <StatusIcon status={course.class_status} />
            </Box>
          }
          secondary={
            <>
              <Typography variant="body2" color="textPrimary" component="span">
                {course.name}
              </Typography>
              <div style={{ flexDirection: "column" }}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  component="div"
                  sx={{ mt: 0.5 }}
                >
                  {course.instructor} • {course.class_type}
                </Typography>
                {rmpData && (
                  <div style={{ flexDirection: "row" }}>
                    <RatingChip
                      icon={<StarIcon color="inherit" fontSize="small" />}
                      label={`${rmpData.avg_rating?.toFixed(1) || "N/A"}/5`}
                      size="small"
                      sx={{
                        border: `1px solid ${
                          rmpData.avg_rating >= 4
                            ? theme.palette.success.dark
                            : rmpData.avg_rating >= 3
                            ? theme.palette.warning.dark
                            : theme.palette.error.dark
                        }`,
                        color:
                          rmpData.avg_rating >= 4
                            ? theme.palette.success.main
                            : rmpData.avg_rating >= 3
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                        backgroundColor: "white",
                        fontSize: "0.7rem",
                        marginRight: "4px",
                      }}
                    />
                    <DifficultyChip
                      label={`${
                        rmpData.difficulty_level?.toFixed(1) || "N/A"
                      }/5 difficulty`}
                      size="small"
                      variant="outlined"
                      difficulty={rmpData.difficulty_level}
                      sx={{ fontSize: "0.7rem" }}
                    />
                  </div>
                )}
              </div>
            </>
          }
        />
      </StyledListItem>
    );
  };
  return (
    <SearchWrapper>
      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
        <div>
          <div ref={anchorRef}>
            <TextField
              fullWidth
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setIsOpen(true)}
              placeholder="Search for classes"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ width: 32 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                        }}
                      >
                        <SearchIcon color="action" />
                      </Box>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <EndAdornment>
                        {search && (
                          <StyledIconButton
                            onClick={handleClear}
                            size="small"
                            aria-label="clear search"
                          >
                            <ClearIcon fontSize="small" />
                          </StyledIconButton>
                        )}
                        {search && (
                          <StyledIconButton
                            onClick={toggleExpand}
                            size="small"
                            aria-label={
                              isOpen ? "collapse results" : "expand results"
                            }
                          >
                            <StyledExpandIcon
                              expanded={isOpen}
                              fontSize="small"
                            />
                          </StyledIconButton>
                        )}
                      </EndAdornment>
                    </InputAdornment>
                  ),
                  style: {
                    borderRadius: "8px",
                  },
                },
              }}
              sx={{
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: COLORS.GRAY_50,
                  transition: "background-color 0.2s",
                  borderRadius:
                    isOpen && search.length > 0
                      ? "8px 8px 0 0 !important"
                      : "8px",
                  height: 36,
                },
              }}
            />
          </div>
          <StyledPopper
            open={isOpen && search.length > 0}
            anchorEl={anchorRef.current}
            placement="bottom-start"
            modifiers={[
              {
                name: "matchWidth",
                enabled: true,
                phase: "beforeWrite",
                requires: ["computeStyles"],
                fn: ({ state }) => {
                  state.styles.popper.width = `${state.rects.reference.width}px`;
                },
                effect: ({ state }) => {
                  const width =
                    state.elements.reference.getBoundingClientRect().width;
                  state.elements.popper.style.width = `${width}px`;
                },
              },
            ]}
          >
            <StyledPaper elevation={0}>
              {searchResults.length === 0 ? (
                <NoResults>
                  <Typography color="textSecondary">
                    No courses found matching "{search}"
                  </Typography>
                </NoResults>
              ) : (
                <>
                  {selectedGECourses.length > 0 && (
                    <>
                      <SearchMetrics>
                        <Box
                          sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography component="span" variant="body2">
                            Found {selectedGECourses.length} course
                            {selectedGECourses.length === 1 ? "" : "s"} in{" "}
                            {selectedGE}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ marginLeft: "auto" }}
                          >
                            {lastUpdated}
                          </Typography>
                        </Box>
                      </SearchMetrics>
                      <List disablePadding>
                        {selectedGECourses.map((course: Course) => (
                          <CourseListItem key={course.id} course={course} />
                        ))}
                      </List>
                    </>
                  )}

                  {otherCourses.length > 0 && (
                    <>
                      <SearchMetrics>
                        <Box
                          sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography component="span" variant="body2">
                            Found {otherCourses.length} course
                            {`${otherCourses.length === 1 ? "" : "s"} ${
                              selectedGE ? "in other categories" : ""
                            }`}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ marginLeft: "auto" }}
                          >
                            {lastUpdated}
                          </Typography>
                        </Box>
                      </SearchMetrics>
                      <List disablePadding>
                        {otherCourses.map((course: Course) => (
                          <CourseListItem key={course.id} course={course} />
                        ))}
                      </List>
                    </>
                  )}
                </>
              )}
            </StyledPaper>
          </StyledPopper>
        </div>
      </ClickAwayListener>
    </SearchWrapper>
  );
};

export default GlobalSearch;
