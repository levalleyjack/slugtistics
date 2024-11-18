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
  useTheme,
  useMediaQuery,
} from "@mui/material"; // No need for @mui/styles
import SearchIcon from "@mui/icons-material/Search";
import { COLORS, Course } from "../Colors";
import React, { useState, useCallback } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCourses, fetchLastUpdate } from "./GetGEData";
import { CourseCard } from "./CourseCard.js";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Sort } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { CategorySidebar } from "./CategorySideBar";

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
    return filteredCourses?.sort((a, b) => Number(a.code) - Number(b.code));
  }
  return filteredCourses;
};

const GeSearch = () => {
  const theme = useTheme(); // Use theme directly here
  const [selectedGE, setSelectedGE] = useState("CC");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("GPA");
  const [filterBy, setFilterBy] = useState("All");
  const [courseGPAs, setCourseGPAs] = useState({});
  const [expandAll, setExpandAll] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

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
    courses?.filter((course:any) => {
      if (search === "") return true;
      return (
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.code.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase())
      );
    }),
    courseGPAs
  );

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value);
  };

  const handleExpandCard = (courseCode: any) => {
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
    <div style={{ display: "flex", backgroundColor: COLORS.GRAY_50, height: "90vh", position: "relative", overflow: "hidden", flexDirection: isSmallScreen ? "column" : "row" }}>
      {isSmallScreen && (
        <IconButton
          style={{ position: "absolute", top: theme.spacing(1), right: theme.spacing(1), zIndex: 1000, backgroundColor: COLORS.WHITE }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <div
        style={{
          width: "350px",
          height: "100%",
          borderRight: `1px solid ${COLORS.GRAY_100}`,
          backgroundColor: COLORS.WHITE,
          display: isSmallScreen && !mobileMenuOpen ? "none" : "block",
        }}
      >
        <CategorySidebar
          selectedCategory={selectedGE}
          onCategorySelect={(categoryId: any) => setSelectedGE(categoryId)}
        />
      </div>

      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.WHITE,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: theme.spacing(2, 3), borderBottom: `1px solid ${COLORS.GRAY_50}`, backgroundColor: COLORS.WHITE }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, marginRight: theme.spacing(2) }}>
            <TextField
              style={{ width: "100%", maxWidth: 400 }}
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
              }}
            />
            <Typography variant="caption" style={{ color: theme.palette.text.secondary, marginTop: theme.spacing(0.5), fontSize: "0.75rem" }}>
              {lastUpdated ?? "Loading..."}
            </Typography>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing(2) }}>
            <Button
              variant="outlined"
              color="primary"
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
              style={{ minWidth: 140, backgroundColor: COLORS.GRAY_50 }}
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
              style={{ minWidth: 140, backgroundColor: COLORS.GRAY_50 }}
              variant="outlined"
              startAdornment={<FilterAltIcon />}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="In Person">In Person</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Synchronous Online">Synchronous Online</MenuItem>
              <MenuItem value="Asynchronous Online">Asynchronous Online</MenuItem>
            </Select>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: theme.spacing(2) }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
              <CircularProgress />
            </div>
          ) : filteredCourses?.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: theme.spacing(4) }}>
              <SentimentDissatisfiedIcon style={{ fontSize: 50 }} />
              <Typography style={{ fontSize: "1.25rem", color: theme.palette.text.secondary }}>
                No courses match your search
              </Typography>
            </div>
          ) : (
            filteredCourses?.map((course, index) => (
              <CourseCard
                key={course.code}
                course={course}
                expanded={expandedCards.has(course.code)}
                onExpandChange={(e) => handleExpandCard(e)}
                onGPALoaded={handleGPALoaded}
                isSmallScreen={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GeSearch;
