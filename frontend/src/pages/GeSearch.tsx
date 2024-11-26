import {
  Typography,
  IconButton,
  CircularProgress,
  Button,
  useTheme,
  styled,
  Drawer,
  Grid2,
} from "@mui/material";
import { COLORS, Course, StyledExpandIcon } from "../Colors";
import React, { useState, useCallback, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCourseData } from "./GetGEData";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { CategorySidebar } from "./CategorySideBar";
import { fetchLastUpdate } from "./FetchLastUpdate";
import FilterDropdown from "./FilterDropdown";
import GlobalSearch from "./GlobalSearchDropdownList";
import { DynamicCourseList } from "./VirtualizedCourseList";
import { useQuery } from "@tanstack/react-query";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  backgroundColor: COLORS.GRAY_50,
  height: "calc(100dvh - 64px)",

  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    height: "calc(100dvh - 64px)",
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
  top: theme.spacing(8.5),
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
const GeContainer = styled("div")(({ theme }) => ({
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
  height: "36px",
  borderRadius: "8px",
  backgroundColor: COLORS.GRAY_50,
  "&:hover": {
    backgroundColor: COLORS.WHITE,
  },
  [theme.breakpoints.down("sm")]: {
    flex: 1,
    minWidth: "120px",
    marginLeft: theme.spacing(1),
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
      (course.subject + " " + course.catalog_num)
        .toLowerCase()
        .includes(searchLower) ||
      course.instructor.toLowerCase().includes(searchLower)
  );
};

const filterBySort = (
  selectedSubjects: string[],
  selectedClassTypes: string[],
  selectedEnrollmentStatuses: string[],
  currentCourses: Course[],
  selectedGEs: string[]
): Course[] => {
  if (!currentCourses || currentCourses.length === 0) return [];

  const filteredCourses = currentCourses.filter((course) => {
    const matchSubject =
      selectedSubjects.length === 0 ||
      selectedSubjects.includes(course.subject);

    const matchType =
      selectedClassTypes.length === 0 ||
      selectedClassTypes.includes(course.class_type);

    const matchStatus =
      selectedEnrollmentStatuses.length === 0 ||
      selectedEnrollmentStatuses.includes(course.class_status);

    const matchGEs =
      selectedGEs.length === 0 || selectedGEs.includes(course.ge);

    return matchSubject && matchType && matchStatus && matchGEs;
  });

  return filteredCourses.sort((a, b) => {
    const gpaA = a.gpa === null ? -Infinity : parseFloat(a.gpa);
    const gpaB = b.gpa === null ? -Infinity : parseFloat(b.gpa);
    return gpaB - gpaA;
  });
};
const GeSearch = () => {
  const theme = useTheme();
  const [selectedGE, setSelectedGE] = useState("AnyGE");
  const [search, setSearch] = useState("");
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const [selectedEnrollmentStatuses, setSelectedEnrollmentStatuses] = useState<
    string[]
  >([]);
  const [selectedGEs, setSelectedGEs] = useState<string[]>([]);

  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 300000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [scrollToCourseId, setScrollToCourseId] = useState<
    string | undefined
  >();

  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());
  const isAllExpanded = React.useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { data: courses, isLoading: isFetchLoading } = useCourseData();

  const currentCourses = courses?.[selectedGE];
  const handleGlobalCourseSelect = (category: string, courseId: string) => {
    handleClearFilters();
    setSelectedGE(category);
    setScrollToCourseId(courseId);
    handleExpandCard(courseId, true);
  };
  const filteredCourses = useMemo(() => {
    const searchFiltered = filterCourses(currentCourses, search);
    return filterBySort(
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      searchFiltered,
      selectedGEs
    );
  }, [
    currentCourses,
    search,
    selectedSubjects,
    selectedClassTypes,
    selectedEnrollmentStatuses,
    selectedGEs,
  ]);

  const handleClearFilters = () => {
    setSelectedEnrollmentStatuses([]);
    setSelectedSubjects([]);
    setSelectedClassTypes([]);
  };

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedGE(categoryId);
    setExpandedCodesMap(new Map());
    isAllExpanded.current = false;
  }, []);

  const handleExpandCard = useCallback(
    (courseCode: string, state?: boolean) => {
      setExpandedCodesMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(courseCode, state ?? !prevMap.get(courseCode));
        return newMap;
      });
    },
    []
  );

  const handleExpandAll = useCallback(() => {
    isAllExpanded.current = !isAllExpanded.current;
    setExpandedCodesMap(
      new Map(
        currentCourses?.map((course) => [
          course.unique_id,
          isAllExpanded.current,
        ]) || []
      )
    );
  }, [currentCourses]);
  const codes = [
    ...new Set(currentCourses?.map((course) => course.subject)),
  ].sort();
  const GEs = [...new Set(currentCourses?.map((course) => course.ge))].sort();

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
              <ArrowBackIcon />
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

      <CourseContainer>
        <HeaderContainer>
          <SearchSection>
            <GlobalSearch
              courses={courses}
              onCourseSelect={handleGlobalCourseSelect}
              selectedGE={selectedGE}
              lastUpdated={lastUpdated ?? "None"}
              isSmallScreen={isSmallScreen}
            />
          </SearchSection>

          <ControlsContainer>
            {isSmallScreen ? (
              <>
                <ExpandButton
                  disableRipple
                  variant="outlined"
                  color="primary"
                  onClick={handleExpandAll}
                  startIcon={
                    <StyledExpandIcon expanded={isAllExpanded.current} />
                  }
                  fullWidth
                >
                  {isAllExpanded.current ? "Collapse" : "Expand"}
                </ExpandButton>
                <FilterDropdown
                  codes={codes}
                  GEs={GEs}
                  selectedGEs={selectedGEs}
                  selectedSubjects={selectedSubjects}
                  selectedClassTypes={selectedClassTypes}
                  selectedEnrollmentStatuses={selectedEnrollmentStatuses}
                  onClassTypesChange={setSelectedClassTypes}
                  onSelectedSubjectsChange={setSelectedSubjects}
                  onEnrollmentStatusesChange={setSelectedEnrollmentStatuses}
                  onSelectedGEs={setSelectedGEs}
                />
              </>
            ) : (
              <>
                <ExpandButton
                  variant="outlined"
                  color="primary"
                  onClick={handleExpandAll}
                  endIcon={
                    <StyledExpandIcon expanded={isAllExpanded.current} />
                  }
                >
                  {isAllExpanded.current ? "Collapse" : "Expand"}{" "}
                  {isMediumScreen ? "" : "All"}
                </ExpandButton>
                <FilterDropdown
                  codes={codes}
                  GEs={GEs}
                  selectedGEs={selectedGEs}
                  selectedSubjects={selectedSubjects}
                  selectedClassTypes={selectedClassTypes}
                  selectedEnrollmentStatuses={selectedEnrollmentStatuses}
                  onClassTypesChange={setSelectedClassTypes}
                  onSelectedSubjectsChange={setSelectedSubjects}
                  onEnrollmentStatusesChange={setSelectedEnrollmentStatuses}
                  onSelectedGEs={setSelectedGEs}
                />
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
              <Grid2 container flexDirection="column" alignItems="center">
                <Typography
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    color: COLORS.GRAY_400,
                  }}
                >
                  {search
                    ? "No matching courses found "
                    : "No courses available "}
                  <SentimentDissatisfiedIcon
                    sx={{ ml: 1, color: COLORS.GRAY_400 }}
                  />
                </Typography>
                <Typography
                  onClick={handleClearFilters}
                  sx={{
                    textDecoration: "underline",
                    color: theme.palette.primary.dark,
                    cursor: "pointer",
                    mt: 1,
                  }}
                >
                  {"Clear Filters"}
                </Typography>
              </Grid2>
            </NoResults>
          </CenterContent>
        ) : (
          <DynamicCourseList
            filteredCourses={filteredCourses}
            isSmallScreen={isSmallScreen}
            expandedCodesMap={expandedCodesMap}
            handleExpandCard={handleExpandCard}
            scrollToCourseId={scrollToCourseId}
            setSelectedGE={setSelectedGE}
          />
        )}
      </CourseContainer>
    </Root>
  );
};

export default GeSearch;
