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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState, useMemo, useRef } from "react";
import {
  COLORS,
  Course,
  getStatusColor,
  GlobalSearchDropdownProps,
} from "../Constants";
import StatusIcon from "./StatusIcon";

const StyledPopper = styled(Popper)(({ theme }) => ({
  width: 400,
  zIndex: 1301,
  marginTop: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    position: "fixed",
    left: "0 !important",
    right: 0,
    bottom: 0,
    maxHeight: "50vh", // Ensure it takes up at most half the viewport height
    marginTop: 0
  }
}));

const LastUpdatedText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50],
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  textAlign: "right",
}));

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  [theme.breakpoints.down("sm")]: {},
}));
const StyledPaper = styled(Paper)(({ theme }) => ({
  maxHeight: "calc(100dvh - 150px)",
  overflowY: "auto",
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  [theme.breakpoints.down("sm")]: {
    maxHeight: "50vh",
    borderRadius: "16px 16px 0 0",
  }
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
  isSmallScreen,
}: GlobalSearchDropdownProps) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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
            courseName.startsWith(searchInput) ||
            courseCode.startsWith(searchInput)
          );
        })
        .slice(0, 20);
    }

    const courseCodeMatch = searchInput.match(/^([a-zA-Z]+)\s*(\d+)?$/);

    if (courseCodeMatch) {
      const [_, subject, number] = courseCodeMatch;

      return allCourses.filter((course) => {
        const courseSubject = course.subject.toLowerCase();
        const courseCatalogNum = course.catalog_num.toLowerCase();

        if (subject && number) {
          return (
            courseSubject.startsWith(subject.toLowerCase()) &&
            courseCatalogNum.startsWith(number)
          );
        }
        return courseSubject.startsWith(subject.toLowerCase());
      });
    }

    return allCourses
      .filter((course) => {
        const courseName = course.name.toLowerCase();
        const courseCode =
          `${course.subject} ${course.catalog_num}`.toLowerCase();

        return (
          matchesInstructor(course.instructor) ||
          courseCode.startsWith(searchInput) ||
          courseName.startsWith(searchInput)
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
    setIsSearching(true);
    setIsOpen(true);
    setTimeout(() => setIsSearching(false), 500);
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

  const CourseListItem = ({ course }: { course: Course }) => (
    <StyledListItem
      onClick={() => handleCourseClick(course)}
      divider
      secondaryAction={
        (course.ge || course.ge_category) &&
        course.ge !== "AnyGE" &&
        course.ge_category !== "AnyGE" ? (
          <CategoryChip label={course.ge || course.ge_category} size="small" />
        ) : null
      }
    >
      <ListItemText
        primary={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography variant="subtitle2" component="span">
              {`${course.subject} ${course.catalog_num}`}
            </Typography>
            <StatusIcon status={course.class_status} />
            <Typography
              variant="caption"
              sx={{
                color: getStatusColor(course.class_status),
                fontWeight: 500,
              }}
            >
              {course.class_status}
            </Typography>
          </div>
        }
        secondary={
          <>
            <Typography variant="body2" color="textPrimary" component="div">
              {course.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" component="div">
              {course.instructor} • {course.class_type}
            </Typography>
          </>
        }
      />
    </StyledListItem>
  );
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
                        {isSearching ? (
                          <CircularProgress
                            size={20}
                            thickness={2}
                            color="inherit"
                          />
                        ) : (
                          <SearchIcon color="action" />
                        )}
                      </Box>
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
                  height: 36,
                  "&:hover": {
                    backgroundColor: COLORS.WHITE,
                  },
                  "&.Mui-focused": {
                    backgroundColor: COLORS.WHITE,
                  },
                },
                "& .MuiInputLabel-root": {
                  transform: "translate(14px, 8px) scale(1)",
                  "&.MuiInputLabel-shrink": {
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
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
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  boundary: window,
                  altAxis: true,
                  padding: 8,
                },
              },
              {
                name: "flip",
                enabled: true,
              },
            ]}
          >
            <StyledPaper elevation={1}>
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
                      <SearchMetrics color="textSecondary">
                        <Box
                          sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            Found {selectedGECourses.length} course
                            {selectedGECourses.length === 1 ? "" : "s"} in{" "}
                            {selectedGE}
                          </Typography>
                          <Typography
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
                      <SearchMetrics color="textSecondary">
                        Found {otherCourses.length} course
                        {`${otherCourses.length === 1 ? "" : "s"} ${
                          selectedGE ? "in other categories" : ""
                        }`}
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
