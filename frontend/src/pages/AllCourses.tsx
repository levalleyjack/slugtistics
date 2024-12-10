import React, { useState, useCallback, useMemo } from "react";
import {
  Typography,
  IconButton,
  CircularProgress,
  Button,
  useTheme,
  styled,
  Drawer,
  Grid2,
  Box,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  AnimatedArrowIcon,
  COLORS,
  Course,
  StyledExpandIcon,
} from "../Constants";
import { useAllCourseData } from "./GetGEData";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { fetchLastUpdate } from "./FetchLastUpdate";
import FilterDropdown from "../components/FilterDropdown";
import GlobalSearch from "../components/GlobalSearchDropdownList";
import { DynamicCourseList } from "./VirtualizedCourseList";
import { useQuery } from "@tanstack/react-query";
import { LoadingCourseCard } from "../components/LoadingCourseCard";

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

const SidebarContainer = styled("div")<{ isVisible: boolean }>(
  ({ theme, isVisible }) => ({
    width: isVisible ? 332 : 0,

    height: "100%",
    backgroundColor: COLORS.WHITE,
    borderRight: isVisible ? `1px solid ${COLORS.GRAY_100}` : "none",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease-in-out",
    overflow: "hidden",
    position: "relative",
    opacity: isVisible ? 1 : 0,
    [theme.breakpoints.down("md")]: {
      width: isVisible ? 280 : 0,
      minWidth: isVisible ? 280 : 0,
    },
    [theme.breakpoints.down("sm")]: {
      width: isVisible ? 240 : 0,
      minWidth: isVisible ? 240 : 0,
    },
  })
);
const StatisticsCard = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: COLORS.GRAY_50,
  borderRadius: "8px",
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const CourseStatistic = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(1),
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

const SidebarContent = styled("div")<{ isVisible: boolean }>(
  ({ theme, isVisible }) => ({
    width: "300px",
    height: "100%",
    padding: theme.spacing(2),
    opacity: isVisible ? 1 : 0,
    transition: "opacity 0.3s ease-in-out",
    overflowY: "auto",
    [theme.breakpoints.down("md")]: {
      width: "280px",
    },
    [theme.breakpoints.down("sm")]: {
      width: "240px",
    },
  })
);

const CourseContainer = styled("div")<{ sidebarVisible: boolean }>(
  ({ theme, sidebarVisible }) => ({
    flex: 1,
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: COLORS.WHITE,
    minWidth: 0,
    transition: "margin-left 0.3s ease-in-out",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
    [theme.breakpoints.down("sm")]: {
      height: "100%",
    },
  })
);

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
  marginRight: theme.spacing(1),

  [theme.breakpoints.down("sm")]: {
    marginRight: theme.spacing(3),
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
  padding: "6px 16px",
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  background: `linear-gradient(135deg,
    ${theme.palette.primary.dark} 0%,
    ${theme.palette.primary.main} 100%)`,

  transition: "all 0.2s ease-in-out",

  "&:hover": {
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
    background: `linear-gradient(135deg,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.main} 100%)`,
  },

  "&:active": {
    transform: "translateY(0)",
    filter: "brightness(95%)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
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

const AllCourses = () => {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState(() => {
    const stored = sessionStorage.getItem("sortBy");
    return stored !== null ? stored : "DEFAULT";
  });
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("selectedClassTypes");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedEnrollmentStatuses, setSelectedEnrollmentStatuses] = useState<
    string[]
  >(() => {
    const stored = sessionStorage.getItem("selectedEnrollmentStatuses");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedGEs, setSelectedGEs] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("selectedGEs");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    const stored = sessionStorage.getItem("selectedSubjects");
    return stored ? JSON.parse(stored) : [];
  });
  const [scrollToCourseId, setScrollToCourseId] = useState<
    string | undefined
  >();
  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    const stored = sessionStorage.getItem("isSidebarVisible");
    return stored !== null ? stored === "true" : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const currentCourses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : [];
  }, [coursesData]);

  const handleSortBy = useCallback((sortBy: string) => {
    setSortBy(() => {
      sessionStorage.setItem("sortBy", sortBy);
      return sortBy;
    });
  }, []);

  const handleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => {
      const newValue = !prev;
      sessionStorage.setItem("isSidebarVisible", String(newValue));
      return newValue;
    });
  }, []);

  const handleSelectedClassTypes = (newClassTypes: string[]) => {
    setSelectedClassTypes(newClassTypes);
    sessionStorage.setItem("selectedClassTypes", JSON.stringify(newClassTypes));
  };
  const handleSelectedGEs = (newGEs: string[]) => {
    setSelectedGEs(newGEs);
    sessionStorage.setItem("selectedGEs", JSON.stringify(newGEs));
  };
  const handleSelectedSubjects = (newSubjects: string[]) => {
    setSelectedSubjects(newSubjects);
    sessionStorage.setItem("selectedSubjects", JSON.stringify(newSubjects));
  };
  const handleSelectedEnrollmentStatuses = (
    newEnrollmentStatuses: string[]
  ) => {
    setSelectedEnrollmentStatuses(newEnrollmentStatuses);
    sessionStorage.setItem(
      "selectedEnrollmentStatuses",
      JSON.stringify(newEnrollmentStatuses)
    );
  };

  const handleGlobalCourseSelect = (courseId: string) => {
    handleClearFilters();
    setScrollToCourseId(courseId);
    handleExpandCard(courseId, true);
  };

  const filteredCourses = useMemo(() => {
    return filterBySort(
      sortBy,
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      currentCourses,
      selectedGEs
    );
  }, [
    sortBy,
    selectedSubjects,
    selectedClassTypes,
    selectedEnrollmentStatuses,
    currentCourses,
    selectedGEs,
  ]);

  const handleClearFilters = () => {
    handleSelectedEnrollmentStatuses([]);
    handleSelectedSubjects([]);
    handleSelectedClassTypes([]);
    handleSelectedGEs([]);
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

  const SidebarStats = () => {
    const totalCourses = filteredCourses?.length || 0;
    const averageGPA =
      filteredCourses?.reduce(
        (sum, course) => sum + (course.gpa ? parseFloat(course.gpa) : 0),
        0
      ) / totalCourses;
    const openSections =
      filteredCourses?.filter((course) => course.class_status === "Open")
        .length || 0;

    const departmentCounts = filteredCourses?.reduce((acc, course) => {
      acc[course.subject] = (acc[course.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDepartments = Object.entries(departmentCounts || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    const coursesAt4 =
      filteredCourses?.filter((course) => parseInt(course.gpa) === 4).length ||
      0;

    const coursesOver3 =
      filteredCourses?.filter(
        (course) => parseFloat(course.gpa) >= 3 && parseFloat(course.gpa) < 4
      ).length || 0;
    const coursesOver2 =
      filteredCourses?.filter(
        (course) => parseInt(course.gpa) >= 2 && parseFloat(course.gpa) < 3
      ).length || 0;
    const coursesOver1 =
      filteredCourses?.filter(
        (course) => parseInt(course.gpa) >= 1 && parseFloat(course.gpa) < 2
      ).length || 0;
    const noGPA =
      filteredCourses?.filter((course) => course?.gpa === null).length || 0;

    const yesGPA =
      filteredCourses?.filter((course) => course?.gpa !== null).length || 0;

    return (
      <>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Course Statistics
        </Typography>

        <StatisticsCard>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: theme.palette.grey[600] }}
          >
            Quick Overview
          </Typography>
          <CourseStatistic>
            <Typography variant="body2">Total Courses</Typography>
            <Typography variant="body2" fontWeight="medium">
              {totalCourses}
            </Typography>
          </CourseStatistic>
          <CourseStatistic>
            <Typography variant="body2">Average GPA</Typography>
            <Typography variant="body2" fontWeight="medium">
              {averageGPA ? averageGPA.toFixed(2) : "N/A"}
            </Typography>
          </CourseStatistic>
          <CourseStatistic>
            <Typography variant="body2">Open Sections</Typography>
            <Typography variant="body2" fontWeight="medium">
              {openSections}
            </Typography>
          </CourseStatistic>
        </StatisticsCard>

        <StatisticsCard>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: theme.palette.grey[600] }}
          >
            Top Departments
          </Typography>
          {topDepartments.map(([dept, count]) => (
            <CourseStatistic key={dept}>
              <Typography variant="body2">{dept}</Typography>
              <Typography variant="body2" fontWeight="medium">
                {count}
              </Typography>
            </CourseStatistic>
          ))}
        </StatisticsCard>
        <StatisticsCard>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: theme.palette.grey[600] }}
          >
            Courses by GPA
          </Typography>
          <CourseStatistic>
            <Typography variant="body2">{"4.0"}</Typography>
            <Typography variant="body2" fontWeight="medium">
              {coursesAt4}
            </Typography>
          </CourseStatistic>
          <CourseStatistic>
            <Typography variant="body2">{"3.0 - 3.99"}</Typography>
            <Typography variant="body2" fontWeight="medium">
              {coursesOver3}
            </Typography>
          </CourseStatistic>
          <CourseStatistic>
            <Typography variant="body2">{"2.0 - 2.99"}</Typography>
            <Typography variant="body2" fontWeight="medium">
              {coursesOver2}
            </Typography>
          </CourseStatistic>
          {coursesOver1 > 0 && (
            <CourseStatistic>
              <Typography variant="body2">{"1.0 - 1.99"}</Typography>
              <Typography variant="body2" fontWeight="medium">
                {coursesOver1}
              </Typography>
            </CourseStatistic>
          )}
          <CourseStatistic>
            <Typography variant="body2">{"No GPA"}</Typography>
            <Typography variant="body2" fontWeight="medium">
              {noGPA}
            </Typography>
          </CourseStatistic>
        </StatisticsCard>
      </>
    );
  };

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
              Course Statistics
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{ borderRadius: "8px" }}
            >
              <ArrowBackIcon />
            </IconButton>
          </DrawerHeader>
          <div style={{ padding: "16px" }}>
            <SidebarStats />
          </div>
        </Drawer>
      ) : (
        <SidebarContainer isVisible={isSidebarVisible}>
          <SidebarContent isVisible={isSidebarVisible}>
            <SidebarStats />
          </SidebarContent>
        </SidebarContainer>
      )}

      <CourseContainer sidebarVisible={isSidebarVisible}>
        <HeaderContainer>
          <SearchSection>
            <MenuButton
              onClick={
                isSmallScreen || isMediumScreen
                  ? () => setMobileMenuOpen(!mobileMenuOpen)
                  : handleSidebar
              }
              aria-label="Toggle Statistics"
            >
              <AnimatedArrowIcon
                isVisible={!isMediumScreen ? isSidebarVisible : true}
                isSmallScreen={isMediumScreen}
              />
            </MenuButton>

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
                  variant="contained"
                  color="primary"
                  onClick={handleExpandAll}
                  endIcon={
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
                  variant="contained"
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
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <LoadingCourseCard key={i} />
            ))}
          </Box>
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
                  {"No courses available "}
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
