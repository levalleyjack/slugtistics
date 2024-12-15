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
import { AnimatedArrowIcon, COLORS, Course } from "../Constants";
import { useAllCourseData, useSessionStorage } from "./GetGEData";
import { fetchLastUpdate } from "./FetchLastUpdate";
import { CourseList } from "./VirtualizedCourseList";
import { useQuery } from "@tanstack/react-query";
import { SearchControls } from "../components/SearchControls";
import { PanelDrawer } from "../components/PanelDrawer";
import StatisticsDrawer from "../components/StatisticsDrawer";

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

  const [scrollToCourseId, setScrollToCourseId] = useState<
    string | undefined
  >();
  const [expandedCodesMap, setExpandedCodesMap] = useState<
    Map<string, boolean>
  >(new Map());
  const [panelData, setPanelData] = useState(null);
  const [activePanel, setActivePanel] = useState<
    "distribution" | "ratings" | "courseDetails" | null
  >(null);
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

  const handleGlobalCourseSelect = (courseId: string) => {
    handleClearFilters();
    setScrollToCourseId(courseId);
    setExpandedCodesMap((prev) => new Map(prev).set(courseId, true));
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
    setSelectedEnrollmentStatuses([]);
    setSelectedSubjects([]);
    setSelectedClassTypes([]);
    setSelectedGEs([]);
  };

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
          lastUpdated={lastUpdated ?? "None"}
        />

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
        />
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
