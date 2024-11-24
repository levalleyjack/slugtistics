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
  ListItemSecondaryAction,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState, useMemo, useRef } from "react";
import { COLORS, Course } from "../Colors";

const StyledPopper = styled(Popper)(({ theme }) => ({
  width: 400,
  zIndex: 1301,
  marginTop: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    maxWidth: "calc(100vw - 32px)",
  },
}));
const SearchContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  width: "100%",
}));

const LastUpdatedText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50],
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  textAlign: 'right'
}));
const SearchWrapper = styled("div")({
  position: "relative",
  width: "100%",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  maxHeight: "calc(100vh - 200px)",
  overflowY: "auto",
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
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
}));

const SectionDivider = styled("div")(({ theme }) => ({
  height: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

interface Props {
  courses: Record<string, Course[]>;
  onCourseSelect: (category: string, courseId: string) => void;
  selectedGE: string;
  lastUpdated: string;
}

const GlobalSearch = ({
  courses,
  onCourseSelect,
  selectedGE,
  lastUpdated,
}: Props) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const allCourses = useMemo(() => {
    if (!courses) return [];

    return Object.entries(courses).flatMap(([category, categoryCourses]) =>
      categoryCourses.map((course) => ({
        ...course,
        category,
        searchableText:
          `${course.subject} ${course.catalog_num} ${course.name} ${course.instructor} ${category}`.toLowerCase(),
      }))
    );
  }, [courses]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];

    const searchTerms = search.toLowerCase().split(" ");

    return allCourses
      .filter((course) =>
        searchTerms.every((term) => course.searchableText.includes(term))
      )
      .slice(0, 20);
  }, [search, allCourses]);

  const { selectedGECourses, otherCourses } = useMemo(() => {
    return searchResults.reduce(
      (acc, course) => {
        if (course.category === selectedGE) {
          acc.selectedGECourses.push(course);
        } else {
          acc.otherCourses.push(course);
        }
        return acc;
      },
      { selectedGECourses: [], otherCourses: [] }
    );
  }, [searchResults, selectedGE]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setIsSearching(true);
    setIsOpen(true);

    setTimeout(() => setIsSearching(false), 300);
  };

  const handleCourseClick = (category: string, courseId: string) => {
    onCourseSelect(category, courseId);
    setIsOpen(false);
    setSearch("");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return theme.palette.success.main;
      case "closed":
        return theme.palette.error.main;
      case "waitlist":
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  const CourseListItem = ({ course }: { course: Course }) => (
    <StyledListItem
      onClick={() => handleCourseClick(course.ge_category, course.unique_id)}
      divider
      secondaryAction={<CategoryChip label={course.ge_category} size="small" />}
    >
      <ListItemText
        primary={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography variant="subtitle2" component="span">
              {`${course.subject} ${course.catalog_num}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: getStatusColor(course.class_status),
                fontWeight: 500,
              }}
            >
              • {course.class_status}
            </Typography>
          </div>
        }
        secondary={
          <>
            <Typography variant="body2" color="textPrimary">
              {course.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
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
              label="Search courses across all categories..."
              placeholder="THEA 151A, Keiko Yukawa"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SearchIcon color="action" />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: COLORS.GRAY_50,
                  transition: "background-color 0.2s",
                  height: "40px",
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
            ]}
          >
            <StyledPaper elevation={8}>
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
                        Found {selectedGECourses.length} courses in {selectedGE}
                      </SearchMetrics>
                      <List disablePadding>
                        {selectedGECourses.map((course: Course) => (
                          <CourseListItem
                            key={`${course.unique_id}`}
                            course={course}
                          />
                        ))}
                      </List>
                    </>
                  )}

                  {otherCourses.length > 0 && (
                    <>
                      {selectedGECourses.length > 0 && <SectionDivider />}
                      <SearchMetrics color="textSecondary">
                        Found {otherCourses.length} courses in other categories
                      </SearchMetrics>
                      <List disablePadding>
                        {otherCourses.map((course: Course) => (
                          <CourseListItem
                            key={`${course.unique_id}`}
                            course={course}
                          />
                        ))}
                      </List>
                    </>
                  )}
                  <LastUpdatedText>
                    {lastUpdated}
                  </LastUpdatedText>
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