import React, { useState, useCallback, useMemo } from "react";
import {
  Typography,
  IconButton,
  useTheme,
  styled,
  Drawer,
  Box,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AnimatedArrowIcon, COLORS, Course, PanelData } from "../Constants";
import {
  useAllCourseData,
  useLocalStorage,
  useSessionStorage,
} from "./GetGEData";
import { fetchLastUpdate } from "./FetchLastUpdate";
import { CourseList } from "./VirtualizedCourseList";
import { useQuery } from "@tanstack/react-query";
import { SearchControls } from "../components/SearchControls";
import { PanelDrawer } from "../components/PanelDrawer";
import StatisticsDrawer from "../components/StatisticsDrawer";
import EnhancedCourseComparison from "../components/CourseComparisonTabs";

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

const CourseContainer = styled("div")<{}>(({ theme }) => ({
  flex: 1,
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
}));

const ComparisonContainer = styled("div")(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ListContainer = styled("div")<{ isComparisonOpen: boolean }>(
  ({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    backgroundColor: COLORS.WHITE,
  })
);

const filterBySort = (
  sortBy: string,
  selectedSubjects: string[],
  selectedClassTypes: string[],
  selectedEnrollmentStatuses: string[],
  currentCourses: Course[],
  selectedGEs: string[],
  careers: string[],
  prereqs: string[]
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
    const matchCareers = !careers.length || careers.includes(course.career);
    const matchPrereqs =
      !prereqs.length ||
      prereqs.some((prereq) =>
        prereq === "Has Prerequisites"
          ? course.has_enrollment_reqs === true
          : course.has_enrollment_reqs === false
      );
    return (
      matchSubject &&
      matchType &&
      matchStatus &&
      matchGEs &&
      matchCareers &&
      matchPrereqs
    );
  });

  return filteredCourses.sort((a, b) => {
    switch (sortBy) {
      case "DEFAULT":
        const getScore = (course: Course) => {
          const gpa = course.gpa === null ? 0 : course.gpa;
          const normalizedGPA = (gpa / 4.0) * 5.0;
          const rating = course.instructor_ratings?.avg_rating ?? 2.5;
          return normalizedGPA * 0.6 + rating * 0.4;
        };
        return getScore(b) - getScore(a);
      case "GPA":
        const gpaA = a.gpa === null ? -Infinity : a.gpa;
        const gpaB = b.gpa === null ? -Infinity : b.gpa;
        return gpaB - gpaA;
      case "INSTRUCTOR":
        const ratingA = a.instructor_ratings?.avg_rating ?? -Infinity;
        const ratingB = b.instructor_ratings?.avg_rating ?? -Infinity;
        return ratingB - ratingA;
      case "ALPHANUMERIC":
        return `${a.subject} ${a.catalog_num}`.localeCompare(
          `${b.subject} ${b.catalog_num}`,
          "en",
          { numeric: true }
        );
      default:
        return 0;
    }
  });
};

const AllCourses = () => {
  const theme = useTheme();
  const [sortBy, setSortBy] = useSessionStorage("sortBy", "DEFAULT");
  const [selectedClassTypes, setSelectedClassTypes] = useSessionStorage<
    string[]
  >("selectedClassTypes", []);
  const [selectedEnrollmentStatuses, setSelectedEnrollmentStatuses] =
    useSessionStorage<string[]>("selectedEnrollmentStatuses", []);
  const [selectedGEs, setSelectedGEs] = useSessionStorage<string[]>(
    "selectedGEs",
    []
  );
  const [selectedSubjects, setSelectedSubjects] = useSessionStorage<string[]>(
    "selectedSubjects",
    []
  );
  const [isDrawerOpen, setIsDrawerOpen] = useSessionStorage(
    "isStatisticsVisible",
    false
  );
  const [selectedPrereqs, setSelectedPrereqs] = useSessionStorage<string[]>(
    "selectedPrereqs",
    []
  );
  const [selectedCareers, setSelectedCareers] = useSessionStorage<string[]>(
    "selectedCareers",
    []
  );

  const [scrollToCourseId, setScrollToCourseId] = useState<
    string | undefined
  >();
  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());
  const [panelData, setPanelData] = useSessionStorage<PanelData | null>(
    "allPanelData",
    null
  );
  const [activePanel, setActivePanel] = useSessionStorage<
    "distribution" | "ratings" | "courseDetails" | null
  >("allActivePanel", null);

  const [comparisonCourses, setComparisonCourses] = useLocalStorage<Course[]>(
    "comparisonCourses",
    []
  );

  const [isComparisonOpen, setIsComparisonOpen] = useLocalStorage(
    "isComparisonOpen",
    false
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const isAllExpanded = React.useRef(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isDistributionDrawer = useMediaQuery("(max-width: 990px)");

  const { data: lastUpdated } = useQuery({
    queryKey: ["lastUpdate"],
    queryFn: fetchLastUpdate,
    refetchInterval: 300000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const isCategoryDrawer = useMediaQuery(`(max-width:${`1340`}px)`);

  const { data: coursesData, isLoading: isFetchLoading } = useAllCourseData();
  const currentCourses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : [];
  }, [coursesData]);

  const handleSortBy = useCallback(
    (newSortBy: string) => {
      setSortBy(newSortBy);
    },
    [setSortBy]
  );
  const handleAddToComparison = (course: Course) => {
    if (!comparisonCourses.find((c) => c.id === course.id)) {
      setComparisonCourses((prev) => [...prev, course]);
      setIsComparisonOpen(true);
    }
  };

  const handleRemoveFromComparison = (index: number) => {
    setComparisonCourses((prev) => prev.filter((_, i) => i !== index));
  };
  const handleClearAll = () => {
    setComparisonCourses([]);
  };

  const handleExpandAll = useCallback(() => {
    isAllExpanded.current = !isAllExpanded.current;
    setExpandedCodesMap(
      new Map(
        currentCourses?.map((course) => [course.id, isAllExpanded.current]) ||
          []
      )
    );
  }, [currentCourses]);

  const filteredCourses = useMemo(() => {
    return filterBySort(
      sortBy,
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      currentCourses,
      selectedGEs,
      selectedCareers,
      selectedPrereqs
    );
  }, [
    sortBy,
    selectedSubjects,
    selectedClassTypes,
    selectedEnrollmentStatuses,
    currentCourses,
    selectedGEs,
    selectedCareers,
    selectedPrereqs,
  ]);

  const handleClearFilters = () => {
    setSelectedEnrollmentStatuses([]);
    setSelectedSubjects([]);
    setSelectedClassTypes([]);
    setSelectedGEs([]);
    setSelectedCareers([]);
    setSelectedPrereqs([]);
  };
  const handleGlobalCourseSelect = useCallback(
    (course: Course, courseId: string) => {
      handleClearFilters();
      setScrollToCourseId(courseId);
      setExpandedCodesMap((prev) => new Map(prev).set(courseId, true));

      setPanelData(course);
      setActivePanel("courseDetails");
    },
    [handleClearFilters, setPanelData, setActivePanel]
  );

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
      <StatisticsDrawer
        isOpen={isOpen}
        isCategoriesVisible={isDrawerOpen}
        isMediumScreen={isCategoryDrawer}
        setIsOpen={setIsOpen}
        setIsCategoriesVisible={setIsDrawerOpen}
        filteredCourses={filteredCourses}
        activePanel={activePanel}
        isDistributionDrawer={isDistributionDrawer}
      />
      <CourseContainer>
        <SearchControls
          isSmallScreen={isSmallScreen}
          isCategoryDrawer={isSmallScreen}
          handleCategoryToggle={handleDrawerToggle}
          isCategoriesVisible={isDrawerOpen}
          courses={currentCourses}
          handleGlobalCourseSelect={handleGlobalCourseSelect}
          selectedGE={""}
          isAllExpanded={isAllExpanded.current}
          handleExpandAll={handleExpandAll}
          codes={codes}
          GEs={GEs}
          sortBy={sortBy}
          setSortBy={handleSortBy}
          selectedClassTypes={selectedClassTypes}
          setSelectedClassTypes={setSelectedClassTypes}
          selectedSubjects={selectedSubjects}
          setSelectedSubjects={setSelectedSubjects}
          selectedEnrollmentStatuses={selectedEnrollmentStatuses}
          setSelectedEnrollmentStatuses={setSelectedEnrollmentStatuses}
          selectedGEs={selectedGEs}
          setSelectedGEs={setSelectedGEs}
          selectedCareers={selectedCareers}
          selectedPrereqs={selectedPrereqs}
          setSelectedCareers={setSelectedCareers}
          setSelectedPrereqs={setSelectedPrereqs}
          lastUpdated={lastUpdated ?? "None"}
        />

        {isComparisonOpen && comparisonCourses.length > 0 && (
          <ComparisonContainer>
            <EnhancedCourseComparison
              onClearAll={handleClearAll}
              courses={comparisonCourses}
              onRemoveCourse={handleRemoveFromComparison}
              onDistributionOpen={(courseCode, professorName) => {
                setPanelData({ courseCode, professorName });
                setActivePanel("distribution");
              }}
              onRatingsOpen={(professorName, courseCode, courseCodes) => {
                setPanelData({ professorName, courseCode, courseCodes });
                setActivePanel("ratings");
              }}
              onCourseDetailsOpen={(course) => {
                setPanelData(course);
                setActivePanel("courseDetails");
              }}
            />
          </ComparisonContainer>
        )}

        <ListContainer isComparisonOpen={isComparisonOpen}>
          <CourseList
            isFetchLoading={isFetchLoading}
            filteredCourses={filteredCourses}
            isSmallScreen={isSmallScreen}
            expandedCodesMap={expandedCodesMap}
            setExpandedCodesMap={setExpandedCodesMap}
            scrollToCourseId={scrollToCourseId}
            selectedGE={""}
            setSelectedGE={() => {}}
            setPanelData={setPanelData}
            setActivePanel={setActivePanel}
            handleClearFilters={handleClearFilters}
            handleAddToComparison={handleAddToComparison}
          />
        </ListContainer>
      </CourseContainer>

      <PanelDrawer
        activePanel={activePanel}
        panelData={panelData}
        isDistributionDrawer={isDistributionDrawer}
        isSmallScreen={isSmallScreen}
        onClose={() => {
          setActivePanel(null);
          setPanelData(null);
        }}
      />
    </Root>
  );
};

export default AllCourses;
