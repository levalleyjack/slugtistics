import {
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  useTheme,
  styled,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { COLORS, Course } from "../Colors";
import React, { useState, useCallback, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@tanstack/react-query";
import { useCourseData } from "./GetGEData";
import { CourseCard } from "./CourseCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Sort } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { CategorySidebar } from "./CategorySideBar";
import { fetchLastUpdate } from "./FetchLastUpdate";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  backgroundColor: COLORS.GRAY_50,
  height: "90vh",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    height: "100vh",
  },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 1000,
  backgroundColor: COLORS.WHITE,
  "&:hover": {
    backgroundColor: COLORS.GRAY_50,
  },
}));

const GeContainer = styled("div")(({ theme }) => ({
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
}));

const CategoryContainer = styled("div")({
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
});

const CourseContainer = styled("div")(({ theme }) => ({
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: COLORS.WHITE,
  [theme.breakpoints.down("sm")]: {
    height: "calc(100% - 60px)",
  },
}));

const HeaderContainer = styled("div")(({ theme }) => ({
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
}));

const CourseListWrapper = styled("div")(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: COLORS.GRAY_50,
  },
  "&::-webkit-scrollbar-thumb": {
    background: COLORS.GRAY_400,
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: COLORS.GRAY_400,
  },
}));

const CourseList = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const SearchSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  marginRight: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginRight: 0,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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
}));

const ControlsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "space-between",
  },
}));

const ExpandButton = styled(Button)(({ theme }) => ({
  height: 36,
  backgroundColor: COLORS.GRAY_50,
  "&:hover": {
    backgroundColor: COLORS.WHITE,
  },
  [theme.breakpoints.down("sm")]: {
    flex: 1,
  },
}));

const StyledSelect = styled(Select<string>)(({ theme }) => ({
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
}));

const CenterContent = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
});

const NoResults = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: COLORS.GRAY_400,
}));

const filterBySort = (sortBy: string, filterBy: string, courses: Course[]) => {
  const filteredCourses =
    filterBy !== "All"
      ? courses?.filter(
          (course) => course.class_type.toLowerCase() === filterBy.toLowerCase()
        )
      : courses;

  if (sortBy === "GPA") {
    return filteredCourses?.sort((a, b) => {
      if (b.average_gpa === "N/A") return -1;
      if (a.average_gpa === "N/A") return 1;
      return parseFloat(b.average_gpa) - parseFloat(a.average_gpa);
    });
  } else if (sortBy === "NAME") {
    return filteredCourses?.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "CODE") {
    return filteredCourses?.sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true })
    );
  }

  return filteredCourses;
};

const GeSearch = () => {
  const theme = useTheme();
  const [selectedGE, setSelectedGE] = useState("CC");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("GPA");
  const [filterBy, setFilterBy] = useState("All");
  const [expandedCodesMap, setExpandedCodesMap] = useState<Map<string, boolean>>(new Map());
  const isAllExpanded = React.useRef(false);


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: courses, isLoading } = useCourseData(selectedGE);

  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 300000,
    refetchIntervalInBackground: true,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredCourses = useMemo(
    () =>
      filterBySort(
        sortBy,
        filterBy,
        courses?.filter((course: Course) => {
          if (search === "") return true;
          const searchLower = search.toLowerCase();
          return (
            course.name.toLowerCase().includes(searchLower) ||
            course.code.toLowerCase().includes(searchLower) ||
            course.instructor.toLowerCase().includes(searchLower)
          );
        })
      ),
    [sortBy, filterBy, courses, search]
  );

  const handleExpandCard = useCallback((courseCode: string) => {
    setExpandedCodesMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(courseCode, !prevMap.get(courseCode));
      return newMap;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    isAllExpanded.current = !isAllExpanded.current;
    setExpandedCodesMap(prevMap => {
      const newMap = new Map();
      filteredCourses?.forEach(course => {
        newMap.set(course.code, isAllExpanded.current);
      });
      return newMap;
    });
  }, [filteredCourses]);

  const courseList = useMemo(() => (
    <CourseList>
      {filteredCourses?.map((course) => (
        <CourseCard
          key={course.code}
          course={course}
          isSmallScreen={isSmallScreen}
          expanded={!!expandedCodesMap.get(course.code)}
          onExpandChange={() => handleExpandCard(course.code)}
        />
      ))}
    </CourseList>
  ), [filteredCourses, isSmallScreen, expandedCodesMap, handleExpandCard]);

  return (
    <Root>
      {isSmallScreen && (
        <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </MenuButton>
      )}

      <GeContainer
        sx={{
          display: isSmallScreen && !mobileMenuOpen ? "none" : "block",
        }}
      >
        <CategoryContainer>
          <CategorySidebar
            selectedCategory={selectedGE}
            onCategorySelect={(categoryId) => setSelectedGE(categoryId)}
          />
        </CategoryContainer>
      </GeContainer>

      <CourseContainer
        sx={{
          display: isSmallScreen && mobileMenuOpen ? "none" : "flex",
        }}
      >
        <HeaderContainer>
          <SearchSection>
            <StyledTextField
              onChange={(e) => {
                setSearch(e.target.value);
                setExpandedCodesMap(new Map());
                isAllExpanded.current = false;
              }}
              value={search}
              label="Search anything..."
              placeholder="THEA 151A, Keiko Yukawa"
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
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", mt: 0.5, fontSize: "0.75rem" }}
            >
              {lastUpdated ?? "Loading..."}
            </Typography>
          </SearchSection>

          <ControlsContainer>
            <ExpandButton
              variant="outlined"
              color="primary"
              onClick={handleExpandAll}
              startIcon={isAllExpanded.current ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              <Typography variant={isSmallScreen ? "body2" : "subtitle2"}>
                {isAllExpanded.current ? "Collapse" : "Expand"}{" "}
                {!isSmallScreen && "All"}
              </Typography>
            </ExpandButton>
            <StyledSelect
              value={sortBy}
              onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
              variant="outlined"
              startAdornment={<Sort />}
            >
              <MenuItem value="GPA">GPA</MenuItem>
              <MenuItem value="NAME">Title</MenuItem>
              <MenuItem value="CODE">Code</MenuItem>
            </StyledSelect>
            <StyledSelect
              value={filterBy}
              onChange={(e: SelectChangeEvent) => setFilterBy(e.target.value)}
              variant="outlined"
              startAdornment={<FilterAltIcon />}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="In Person">In Person</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Synchronous Online">Synchronous Online</MenuItem>
              <MenuItem value="Asynchronous Online">Asynchronous Online</MenuItem>
            </StyledSelect>
          </ControlsContainer>
        </HeaderContainer>

        {isLoading ? (
          <CenterContent>
            <CircularProgress color="inherit" disableShrink />
          </CenterContent>
        ) : filteredCourses?.length === 0 ? (
          <CenterContent>
            <NoResults color="textSecondary">
              {search ? "No matching courses found " : "No courses available "}
              <SentimentDissatisfiedIcon
                sx={{ ml: 1, color: COLORS.GRAY_400 }}
              />
            </NoResults>
          </CenterContent>
        ) : (
          <CourseListWrapper>{courseList}</CourseListWrapper>
        )}
      </CourseContainer>
    </Root>
  );
};

export default GeSearch;
