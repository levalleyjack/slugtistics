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
import {
  AnimatedArrowIcon,
  COLORS,
  Course,
  StyledExpandIcon,
} from "../Constants";
import React, { useState, useCallback, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGECourseData } from "./GetGEData";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { CategorySidebar } from "../components/CategorySideBar";
import { fetchLastUpdate } from "./FetchLastUpdate";
import FilterDropdown from "../components/FilterDropdown";
import GlobalSearch from "../components/GlobalSearchDropdownList";
import { DynamicCourseList } from "./VirtualizedCourseList";
import { useQuery } from "@tanstack/react-query";

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
  sortBy: string,
  selectedSubjects: string[],
  selectedClassTypes: string[],
  selectedEnrollmentStatuses: string[],
  currentCourses: Course[],
  currentGE: string,
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
      currentGE === "AnyGE"
        ? selectedGEs.length === 0 || selectedGEs.includes(course.ge)
        : currentCourses;

    return matchSubject && matchType && matchStatus && matchGEs;
  });

  return filteredCourses.sort((a, b) => {
    switch (sortBy) {
      case "DEFAULT":
        const getScore = (course: Course) => {
          //gpa to 5.0
          const gpa = course.gpa === null ? 0 : parseFloat(course.gpa);
          const normalizedGPA = (gpa / 4.0) * 5.0;

          const rating = course.instructor_ratings?.avg_rating ?? 0;

          //60 / 40 rmp
          return normalizedGPA * 0.6 + rating * 0.4;
        };

        const scoreA = getScore(a);
        const scoreB = getScore(b);

        return scoreB - scoreA;

      case "GPA":
        const gpaA = a.gpa === null ? -Infinity : parseFloat(a.gpa);
        const gpaB = b.gpa === null ? -Infinity : parseFloat(b.gpa);
        return gpaB - gpaA;
      case "INSTRUCTOR":
        const ratingA =
          (a.instructor_ratings && a.instructor_ratings.avg_rating) ??
          -Infinity;
        const ratingB =
          (b.instructor_ratings && b.instructor_ratings.avg_rating) ??
          -Infinity;
        return ratingA === ratingB &&
          b.instructor_ratings &&
          a.instructor_ratings
          ? b.instructor_ratings.num_ratings - a.instructor_ratings.num_ratings
          : ratingB - ratingA;
      case "ALPHANUMERIC":
        const aCourseCode = `${a.subject} ${a.catalog_num}`;
        const bCourseCode = `${b.subject} ${b.catalog_num}`;
        return aCourseCode.localeCompare(bCourseCode, "en", { numeric: true });
      default:
        return 0;
    }
  });
};

const GeSearch = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(() => {
    const stored = localStorage.getItem("sortBy");
    return stored !== null ? stored : "DEFAULT";
  });
  const [selectedGE, setSelectedGE] = useState(() => {
    const stored = localStorage.getItem("selectedGE");
    return stored !== null ? stored : "AnyGE";
  });

  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedClassTypes");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedEnrollmentStatuses, setSelectedEnrollmentStatuses] = useState<
    string[]
  >(() => {
    const stored = localStorage.getItem("selectedEnrollmentStatuses");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedGEs, setSelectedGEs] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedGEs");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedSubjects");
    return stored ? JSON.parse(stored) : [];
  });
  const [isCategoriesVisible, setIsCategoriesVisible] = useState<boolean>(
    () => {
      const stored = localStorage.getItem("isCategoriesVisible");
      return stored !== null ? stored === "true" : true;
    }
  );
  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 300000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const [scrollToCourseId, setScrollToCourseId] = useState<
    string | undefined
  >();
  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());

  const isAllExpanded = React.useRef(false);

  const { data: courses, isLoading: isFetchLoading } = useGECourseData();
  const currentCourses = courses?.[selectedGE];

  const handleGE = useCallback((category: string) => {
    setSelectedGE(() => {
      localStorage.setItem("selectedGE", category);
      return category;
    });
  }, []);
  const handleSortBy = useCallback((sortBy: string) => {
    setSortBy(() => {
      localStorage.setItem("sortBy", sortBy);
      return sortBy;
    });
  }, []);
  const handleSelectedClassTypes = (newClassTypes: string[]) => {
    setSelectedClassTypes(newClassTypes);
    localStorage.setItem("selectedClassTypes", JSON.stringify(newClassTypes));
  };
  const handleSelectedGEs = (newGEs: string[]) => {
    setSelectedGEs(newGEs);
    localStorage.setItem("selectedGEs", JSON.stringify(newGEs));
  };
  const handleSelectedSubjects = (newSubjects: string[]) => {
    setSelectedSubjects(newSubjects);
    localStorage.setItem("selectedSubjects", JSON.stringify(newSubjects));
  };
  const handleSelectedEnrollmentStatuses = (
    newEnrollmentStatuses: string[]
  ) => {
    setSelectedEnrollmentStatuses(newEnrollmentStatuses);
    localStorage.setItem(
      "selectedEnrollmentStatuses",
      JSON.stringify(newEnrollmentStatuses)
    );
  };
  const handleGlobalCourseSelect = (courseId: string, category?: string) => {
    handleClearFilters();
    handleGE(category ?? "AnyGE");
    setScrollToCourseId(courseId);
    handleExpandCard(courseId, true);
  };

  const handleCategories = useCallback(() => {
    setIsCategoriesVisible((prev) => {
      const newValue = !prev;
      localStorage.setItem("isCategoriesVisible", String(newValue));
      return newValue;
    });
  }, []);
  const filteredCourses = useMemo(() => {
    const searchFiltered = filterCourses(currentCourses, search);
    return filterBySort(
      sortBy,
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      searchFiltered,
      selectedGE,
      selectedGEs
    );
  }, [
    sortBy,
    currentCourses,
    search,
    selectedSubjects,
    selectedClassTypes,
    selectedEnrollmentStatuses,
    selectedGE,
    selectedGEs,
  ]);

  const handleClearFilters = () => {
    handleSelectedEnrollmentStatuses([]);
    handleSelectedSubjects([]);
    handleSelectedClassTypes([]);
    handleSelectedGEs([]);
  };

  const handleCategorySelect = useCallback((categoryId: string) => {
    handleGE(categoryId);
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
        currentCourses?.map((course) => [course.id, isAllExpanded.current]) ||
          []
      )
    );
  }, [currentCourses]);
  const codes = [
    ...new Set(currentCourses?.map((course) => course.subject)),
  ].sort();
  const GEs = [
    ...new Set(
      currentCourses?.map((course) => course.ge).filter((ge) => ge != null)
    ),
  ].sort();

  return (
    <Root>
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
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{ borderRadius: "8px" }}
            >
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
        <GeContainer isVisible={isCategoriesVisible}>
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
            <MenuButton
              onClick={
                isSmallScreen || isMediumScreen
                  ? () => setMobileMenuOpen(!mobileMenuOpen)
                  : handleCategories
              }
              aria-label="Toggle Categories"
            >
              <AnimatedArrowIcon
                isVisible={!isMediumScreen ? isCategoriesVisible : true}
                isSmallScreen={isMediumScreen}
              />
            </MenuButton>

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
                  sortBy={sortBy}
                  selectedGEs={selectedGEs}
                  selectedSubjects={selectedSubjects}
                  selectedClassTypes={selectedClassTypes}
                  selectedEnrollmentStatuses={selectedEnrollmentStatuses}
                  onSortBy={handleSortBy}
                  onClassTypesChange={handleSelectedClassTypes}
                  onSelectedSubjectsChange={handleSelectedSubjects}
                  onEnrollmentStatusesChange={handleSelectedEnrollmentStatuses}
                  onSelectedGEs={handleSelectedGEs}
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
                  {isAllExpanded.current ? "Collapse" : "Expand"}
                </ExpandButton>
                <FilterDropdown
                  codes={codes}
                  GEs={GEs}
                  sortBy={sortBy}
                  selectedGEs={selectedGEs}
                  selectedSubjects={selectedSubjects}
                  selectedClassTypes={selectedClassTypes}
                  selectedEnrollmentStatuses={selectedEnrollmentStatuses}
                  onSortBy={handleSortBy}
                  onClassTypesChange={handleSelectedClassTypes}
                  onSelectedSubjectsChange={handleSelectedSubjects}
                  onEnrollmentStatusesChange={handleSelectedEnrollmentStatuses}
                  onSelectedGEs={handleSelectedGEs}
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
  backgroundColor: COLORS.WHITE,
  boxShadow: theme.shadows[2],
  marginRight: theme.spacing(1),
  "&:hover": {
    backgroundColor: COLORS.GRAY_50,
    transform: "translateY(-2px)",
    transition: "transform 0.2s ease-in-out",
  },
  transition: "transform 0.2s ease-in-out",
}));

const GeContainer = styled("div")<{ isVisible: boolean }>(
  ({ theme, isVisible }) => ({
    width: isVisible ? "300px" : "0px",
    marginRight: isVisible ? "40px" : "0px",
    height: "100%",
    backgroundColor: COLORS.WHITE,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    borderRight: isVisible ? `1px solid ${COLORS.GRAY_100}` : "none",
    transition: "width 0.3s ease-in-out, margin-right 0.3s ease-in-out",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      width: isVisible ? "280px" : "0px",
    },
    [theme.breakpoints.down("sm")]: {
      width: isVisible ? "240px" : "0px",
    },
  })
);

const CategoryContainer = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor: COLORS.WHITE,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  transition: "all 0.3s ease",
  scrollBehavior: "smooth",
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
  padding: theme.spacing(2),
  justifyContent: "space-between",
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
  flexDirection: "row",
  flex: 1,
  alignItems: "center",
  marginRight: theme.spacing(2),
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

export default GeSearch;
