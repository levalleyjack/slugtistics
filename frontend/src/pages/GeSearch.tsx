import {
  Typography,
  IconButton,
  Theme,
  TextField,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  Button,
} from "@material-ui/core";
import SearchIcon from "@mui/icons-material/Search";
import { makeStyles } from "@material-ui/core/styles";
import { COLORS, Course } from "../Colors.tsx";
import React, { useState, useCallback } from "react";
import { useMediaQuery } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCourses, fetchLastUpdate } from "./GetGEData.tsx";
import { CourseCard } from "./CourseCard.tsx";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Sort } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { CategorySidebar } from "./CategorySideBar.tsx";

const filterBySort = (
  sortBy: string,
  filterBy: string,
  courses: Course[],
  courseGPAs: Record<string, number>
) => {
  const filteredCourses =
    filterBy !== "All"
      ? courses?.filter(
          (course) => course.class_type.toLowerCase() === filterBy.toLowerCase()
        )
      : courses;

  if (sortBy === "GPA") {
    return filteredCourses?.sort(
      (a, b) => courseGPAs[b.code] - courseGPAs[a.code]
    );
  } else if (sortBy === "NAME") {
    return filteredCourses?.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "CODE") {
    return filteredCourses?.sort((a, b) => a.code - b.code);
  }
  return filteredCourses;
};

const GeSearch = () => {
  const classes = useStyles();
  const [selectedGE, setSelectedGE] = useState("CC");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("GPA");
  const [filterBy, setFilterBy] = useState("All");
  const [courseGPAs, setCourseGPAs] = useState({});
  const [expandAll, setExpandAll] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const {
    data: courses,
    isLoading,
    refetch: refetchCourse,
  } = useQuery({
    queryKey: ["courses", selectedGE],
    queryFn: () => fetchCourses(selectedGE),
    enabled: !!selectedGE,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });

  const handleGPALoaded = useCallback((courseCode, gpa) => {
    setCourseGPAs((prev) => ({
      ...prev,
      [courseCode]: gpa === "N/A" ? -1 : parseFloat(gpa),
    }));
  }, []);

  const filteredCourses: Course[] = filterBySort(
    sortBy,
    filterBy,
    courses?.filter((course) => {
      if (search === "") return true;
      return (
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.code.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase())
      );
    }),
    courseGPAs
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleExpandCard = (courseCode) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseCode)) {
        newSet.delete(courseCode);
      } else {
        newSet.add(courseCode);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    setExpandAll(!expandAll);
    if (!expandAll) {
      setExpandedCards(new Set(filteredCourses?.map((course) => course.code)));
    } else {
      setExpandedCards(new Set());
    }
  };

  return (
    <div className={classes.root}>
      {isSmallScreen && (
        <IconButton
          className={classes.menuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <div
        className={`${classes.geContainer} ${
          isSmallScreen && !mobileMenuOpen ? classes.hiddenMobile : ""
        }`}
      >
        <div className={classes.categoryContainer}>
          {
            <CategorySidebar
              selectedCategory={selectedGE}
              onCategorySelect={(categoryId) => setSelectedGE(categoryId)}
            />
          }
        </div>
      </div>

      <div
        className={`${classes.courseContainer} ${
          isSmallScreen && mobileMenuOpen ? classes.hiddenMobile : ""
        }`}
      >
        <div className={classes.headerContainer}>
          <div className={classes.searchSection}>
            <TextField
              className={classes.searchField}
              onChange={handleSearchChange}
              value={search}
              label="Search anything..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                className: classes.searchInput,
              }}
            />
            <Typography variant="caption" className={classes.lastUpdated}>
              {lastUpdated ?? "Loading..."}
            </Typography>
          </div>

          <div className={classes.controlsContainer}>
            <Button
              variant="outlined"
              color="primary"
              className={classes.expandButton}
              onClick={handleExpandAll}
              startIcon={expandAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              <Typography variant={isSmallScreen ? "body2" : "subtitle2"}>
                {expandAll ? "Collapse All" : "Expand All"}
              </Typography>
            </Button>
            <Select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className={classes.sortSelect}
              variant="outlined"
              startAdornment={<Sort />}
            >
              <MenuItem value="GPA">GPA</MenuItem>
              <MenuItem value="NAME">Title</MenuItem>
              <MenuItem value="CODE">Code</MenuItem>
            </Select>
            <Select
              value={filterBy}
              onChange={(e: any) => setFilterBy(e.target.value)}
              className={classes.sortSelect}
              variant="outlined"
              startAdornment={<FilterAltIcon />}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="In Person">In Person</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Synchronous Online">Synchronous Online</MenuItem>
              <MenuItem value="Asynchronous Online">
                Asynchronous Online
              </MenuItem>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className={classes.centerContent}>
            <CircularProgress color="inherit" disableShrink />
          </div>
        ) : filteredCourses?.length === 0 ? (
          <div className={classes.centerContent}>
            <Typography color="textSecondary" className={classes.noResults}>
              {search ? "No matching courses found " : "No courses available "}
              <SentimentDissatisfiedIcon className={classes.noResultsIcon} />
            </Typography>
          </div>
        ) : (
          <div className={classes.courseListWrapper}>
            <div className={classes.courseList}>
              {filteredCourses?.map((course) => (
                <div key={course.id}>
                  <CourseCard
                    course={course}
                    isSmallScreen={isSmallScreen}
                    onGPALoaded={handleGPALoaded}
                    expanded={expandedCards.has(course.code)}
                    onExpandChange={handleExpandCard}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: COLORS.GRAY_50,
    height: "90vh",
    position: "relative",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      height: "100vh",
    },
  },
  menuButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1000,
    backgroundColor: COLORS.WHITE,
    "&:hover": {
      backgroundColor: COLORS.GRAY_50,
    },
  },
  geContainer: {
    width: "350px",
    height: "100%",
    borderRight: `1px solid ${COLORS.GRAY_100}`,
    backgroundColor: COLORS.WHITE,
    [theme.breakpoints.down("md")]: {
      width: "250px",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "auto",
      borderRight: "none",
      borderBottom: `1px solid ${COLORS.GRAY_100}`,
    },
  },
  categoryContainer: {
    height: "100%",
    backgroundColor: COLORS.WHITE,
    display: "flex",
    flexDirection: "column",
    overflowY: "scroll",
    msOverflowStyle: "none", 
    scrollbarWidth: "none", 
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  courseContainer: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: COLORS.WHITE,
    [theme.breakpoints.down("sm")]: {
      height: "calc(100% - 60px)", 
    },
  },
  headerContainer: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${COLORS.GRAY_50}`,
    backgroundColor: COLORS.WHITE,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      flexDirection: "column",
      gap: theme.spacing(2),
    },
  },
  courseListWrapper: {
    flex: 1,
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: COLORS.GRAY_50,
    },
    "&::-webkit-scrollbar-thumb": {
      background: COLORS.GRAY_300,
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: COLORS.GRAY_400,
    },
  },
  courseList: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  searchSection: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginRight: 0,
    },
  },
  searchField: {
    width: "100%",
    maxWidth: 400,
    "& .MuiOutlinedInput-root": {
      backgroundColor: COLORS.GRAY_50,
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: COLORS.WHITE,
      },
      "&.Mui-focused": {
        backgroundColor: COLORS.WHITE,
      },
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: "none",
    },
  },
  searchInput: {
    "&::placeholder": {
      color: COLORS.GRAY_400,
    },
  },
  lastUpdated: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    fontSize: "0.75rem",
  },
  controlsContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      justifyContent: "space-between",
    },
  },
  expandButton: {
    height: 36,
    backgroundColor: COLORS.GRAY_50,
    "&:hover": {
      backgroundColor: COLORS.WHITE,
    },
    [theme.breakpoints.down("sm")]: {
      flex: 1,
    },
  },
  sortSelect: {
    minWidth: 140,
    backgroundColor: COLORS.GRAY_50,
    "& .MuiOutlinedInput-input": {
      paddingTop: 8,
      paddingBottom: 8,
    },
    "& .MuiSelect-select:focus": {
      backgroundColor: "transparent",
    },
    [theme.breakpoints.down("sm")]: {
      flex: 1,
    },
  },
  centerContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },

  noResults: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: COLORS.GRAY_400,
  },
  hiddenMobile: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  noResultsIcon: {
    marginLeft: theme.spacing(1),
    color: COLORS.GRAY_400,
  },
}));

export default GeSearch;
