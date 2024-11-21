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
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
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
  height: "93vh",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    height: "90vh",
  },
}));
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(9),
  left: theme.spacing(1),
  zIndex: 1100,
  backgroundColor: COLORS.WHITE,
  boxShadow: theme.shadows[2],
  "&:hover": {
    backgroundColor: COLORS.GRAY_50,
  },
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));
const GeContainer = styled('div')(({ theme }) => ({
  width: "300px",
  marginRight: "40px",
  height: "100%",
  backgroundColor: COLORS.WHITE,
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  borderRight: `1px solid ${COLORS.GRAY_100}`,
  [theme.breakpoints.down("md")]: {
    width: "280px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "240px",
  },
}));


const CategoryContainer = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor: COLORS.WHITE,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: COLORS.GRAY_50,
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: COLORS.GRAY_300,
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: COLORS.GRAY_400,
    },
  },
  scrollbarWidth: "thin",
  scrollbarColor: `${COLORS.GRAY_300} ${COLORS.GRAY_50}`,
}));
const CourseContainer = styled("div")(({ theme }) => ({
  flex: 1,
  borderLeft: `1px solid ${theme.palette.divider}`,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: COLORS.WHITE,
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
  [theme.breakpoints.down("sm")]: {
    height: "100%",
  },
}));
const HeaderContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: COLORS.WHITE,
  flexWrap: "wrap",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

const CourseListWrapper = styled("div")(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  width: "100%",
  minHeight: 0,
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
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
}));
const SearchSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  marginRight: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: "auto",
    marginLeft: "12%",
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing(1),
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
    minWidth: "120px",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
}));

const StyledSelect = styled(Select<string>)(({ theme }) => ({
  minWidth: "120px",
  backgroundColor: COLORS.GRAY_50,
  "& .MuiOutlinedInput-input": {
    paddingTop: 8,
    paddingBottom: 8,
  },
  "& .MuiSelect-select:focus": {
    backgroundColor: "transparent",
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

const filterCourses = (courses: Course[], search: string) => {
  if (!search) return courses;
  const searchLower = search.toLowerCase();
  return courses.filter(
    (course: Course) =>
      course.name.toLowerCase().includes(searchLower) ||
      course.code.toLowerCase().includes(searchLower) ||
      course.instructor.toLowerCase().includes(searchLower)
  );
};

const filterBySort = (
  sortBy: string,
  filterBy: string,
  currentCourses: Course[]
): Course[] => {
  if (!currentCourses) return [];

  const filteredCourses =
    filterBy === "All"
      ? currentCourses
      : currentCourses.filter(
          (course) => course.class_type.toLowerCase() === filterBy.toLowerCase()
        );

  const sortedCourses = [...filteredCourses];

  switch (sortBy) {
    case "GPA":
      sortedCourses.sort((a, b) => {
        if (b.gpa === "N/A") return -1;
        if (a.gpa === "N/A") return 1;
        return parseFloat(b.gpa) - parseFloat(a.gpa);
      });
      break;
    case "NAME":
      sortedCourses.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "CODE":
      sortedCourses.sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { numeric: true })
      );
      break;
  }

  return sortedCourses;
};

const GeSearch = () => {
  const theme = useTheme();
  const [selectedGE, setSelectedGE] = useState("CC");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("GPA");
  const [filterBy, setFilterBy] = useState("All");
  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());
  const isAllExpanded = React.useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { data: courses, isLoading: isFetchLoading } = useCourseData();

  const currentCourses = useMemo(
    () =>
      selectedGE !== "AnyGE"
        ? courses?.[selectedGE] || []
        : Object.values(courses || {}).flat(),
    [selectedGE, courses]
  );

  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 300000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const filteredCourses = useMemo(() => {
    const searchFiltered = filterCourses(currentCourses, search);
    return filterBySort(sortBy, filterBy, searchFiltered);
  }, [currentCourses, search, sortBy, filterBy]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedGE(categoryId);
    setExpandedCodesMap(new Map());
    isAllExpanded.current = false;
  }, []);

  const handleExpandCard = useCallback((courseCode: string) => {
    setExpandedCodesMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(courseCode, !prevMap.get(courseCode));
      return newMap;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    isAllExpanded.current = !isAllExpanded.current;
    setExpandedCodesMap(
      new Map(
        currentCourses?.map((course) => [course.id, isAllExpanded.current]) ||
          []
      )
    );
  }, [currentCourses]);

  const courseList = useMemo(
    () => (
      <CourseList>
        {filteredCourses?.map((course) => (
          <CourseCard
            key={`${course.id}`}
            course={course}
            isSmallScreen={isSmallScreen}
            expanded={!!expandedCodesMap.get(course.id)}
            onExpandChange={() => handleExpandCard(course.id)}
          />
        ))}
      </CourseList>
    ),
    [filteredCourses, isSmallScreen, expandedCodesMap, handleExpandCard]
  );

  return (
    <Root>
      <MenuButton
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Categories"
      >
        <MenuIcon />
      </MenuButton>

      {isSmallScreen || isMediumScreen ? (
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
            },
          }}
        >
          <DrawerHeader>
            <Typography variant="subtitle1" fontWeight="medium">
              Categories
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DrawerHeader>
          <CategoryContainer>
            <CategorySidebar
              selectedCategory={selectedGE}
              onCategorySelect={handleCategorySelect}
            />
          </CategoryContainer>
        </Drawer>
      ) : (
        <GeContainer>
          <CategoryContainer>
            <CategorySidebar
              selectedCategory={selectedGE}
              onCategorySelect={handleCategorySelect}
            />
          </CategoryContainer>
        </GeContainer>
      )}

      <Dialog
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Filter and Sort
          <IconButton
            aria-label="close"
            onClick={() => setMobileFilterOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ControlsContainer sx={{ flexDirection: "column", gap: 2 }}>
            <StyledSelect
              fullWidth
              value={sortBy}
              onChange={(e: SelectChangeEvent) => {
                setSortBy(e.target.value);
                setMobileFilterOpen(false);
              }}
              startAdornment={<Sort />}
            >
              <MenuItem value="GPA">GPA (High to Low)</MenuItem>
              <MenuItem value="NAME">Title (A-Z)</MenuItem>
              <MenuItem value="CODE">Code (A-Z)</MenuItem>
            </StyledSelect>
            <StyledSelect
              fullWidth
              value={filterBy}
              onChange={(e: SelectChangeEvent) => {
                setFilterBy(e.target.value);
                setMobileFilterOpen(false);
              }}
              startAdornment={<FilterAltIcon />}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="In Person">In Person</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Synchronous Online">Synchronous Online</MenuItem>
              <MenuItem value="Asynchronous Online">
                Asynchronous Online
              </MenuItem>
            </StyledSelect>
          </ControlsContainer>
        </DialogContent>
      </Dialog>
      <CourseContainer>
        <HeaderContainer>
          <SearchSection>
            <StyledTextField
              onChange={(e) => handleSearchChange(e)}
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
              sx={{
                color: "text.secondary",
                mt: 0.5,
                fontSize: "0.75rem",
                display: isSmallScreen ? "none" : "block",
              }}
              
            >
              {lastUpdated ?? "Loading..."}
            </Typography>
          </SearchSection>

          <ControlsContainer>
            {isSmallScreen ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setMobileFilterOpen(true)}
                  startIcon={<FilterAltIcon />}
                  sx={{
                    marginLeft: theme.spacing(1),
                    marginRight: theme.spacing(2),
                  }}
                  fullWidth
                >
                  Filter & Sort
                </Button>
                <ExpandButton
                  variant="outlined"
                  color="primary"
                  onClick={handleExpandAll}
                  startIcon={
                    isAllExpanded.current ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )
                  }
                  fullWidth
                >
                  {isAllExpanded.current ? "Collapse" : "Expand"}
                </ExpandButton>
              </>
            ) : (
              <>
                <ExpandButton
                  variant="outlined"
                  color="primary"
                  onClick={handleExpandAll}
                  startIcon={
                    isAllExpanded.current ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )
                  }
                >
                  {isAllExpanded.current ? "Collapse" : "Expand"}{" "}
                  {isMediumScreen ? "" : "All"}
                </ExpandButton>
                <StyledSelect
                  value={sortBy}
                  onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                  startAdornment={<Sort />}
                >
                  <MenuItem value="GPA">GPA (High to Low)</MenuItem>
                  <MenuItem value="NAME">Title (A-Z)</MenuItem>
                  <MenuItem value="CODE">Code (A-Z)</MenuItem>
                </StyledSelect>
                <StyledSelect
                  value={filterBy}
                  onChange={(e: SelectChangeEvent) =>
                    setFilterBy(e.target.value)
                  }
                  startAdornment={<FilterAltIcon />}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="In Person">In Person</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                  <MenuItem value="Synchronous Online">
                    Synchronous Online
                  </MenuItem>
                  <MenuItem value="Asynchronous Online">
                    Asynchronous Online
                  </MenuItem>
                </StyledSelect>
              </>
            )}
          </ControlsContainer>
        </HeaderContainer>

        {isFetchLoading ? (
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
