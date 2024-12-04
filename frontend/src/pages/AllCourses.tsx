import {
  Typography,
  IconButton,
  CircularProgress,
  Button,
  useTheme,
  styled,
  Grid2,
} from "@mui/material";
import { COLORS, Course, StyledExpandIcon } from "../Constants";
import React, { useState, useCallback, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { useAllCourseData } from "./GetGEData";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { fetchLastUpdate } from "./FetchLastUpdate";
import FilterDropdown from "../components/FilterDropdown";
import GlobalSearch from "../components/GlobalSearchDropdownList";
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
  marginLeft: theme.spacing(1),
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

const filterCourses = (courses: Course[], search: string): Course[] => {
  if (!courses) return [];
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
  selectedGEs: string[]
): Course[] => {
  if (!Array.isArray(currentCourses) || currentCourses.length === 0) return [];

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
    switch (sortBy) {
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

const AllCourses = () => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("GPA");
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const [selectedEnrollmentStatuses, setSelectedEnrollmentStatuses] = useState<
    string[]
  >([]);
  const [selectedGEs, setSelectedGEs] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [scrollToCourseId, setScrollToCourseId] = useState<
    string | undefined
  >();
  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());
  const isAllExpanded = React.useRef(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 300000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: coursesData, isLoading: isFetchLoading } = useAllCourseData();

  // Ensure we have an array of courses
  const currentCourses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : [];
  }, [coursesData]);

  const handleGlobalCourseSelect = (courseId: string, category?: string) => {
    handleClearFilters();
    setScrollToCourseId(courseId);
    handleExpandCard(courseId, true);
  };

  const filteredCourses = useMemo(() => {
    const searchFiltered = filterCourses(currentCourses, search);
    return filterBySort(
      sortBy,
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      searchFiltered,
      selectedGEs
    );
  }, [
    sortBy,
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

  const codes = useMemo(() => {
    return [...new Set(currentCourses?.map((course) => course.subject))].sort();
  }, [currentCourses]);

  const GEs = useMemo(() => {
    return [
      ...new Set(
        currentCourses?.map((course) => course.ge).filter((ge) => ge != null)
      ),
    ].sort();
  }, [currentCourses]);

  return (
    <Root>
      <CourseContainer>
        <HeaderContainer>
          <SearchSection>
            <GlobalSearch
              courses={currentCourses}
              onCourseSelect={handleGlobalCourseSelect}
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
                  onSortBy={setSortBy}
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
                  onSortBy={setSortBy}
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
          />
        )}
      </CourseContainer>
    </Root>
  );
};

export default AllCourses;
