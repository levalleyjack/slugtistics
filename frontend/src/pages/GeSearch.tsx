import React, { useState, useCallback, useMemo, useRef } from "react";
import { useTheme, useMediaQuery, styled } from "@mui/material";
import { COLORS, Course, FilterOptions, PanelData } from "../Constants";
import {
  useGECourseData,
  useLocalStorage,
  useSessionStorage,
} from "./GetGEData";
import CategoryDrawer from "../components/CategoryDrawer";
import { fetchLastUpdate } from "./FetchLastUpdate";
import { SearchControls } from "../components/SearchControls";
import { CourseList } from "./VirtualizedCourseList";
import { PanelDrawer } from "../components/PanelDrawer";
import EnhancedCourseComparison from "../components/CourseComparisonTabs";

const BREAKPOINT_CATEGORY = 1340;
const BREAKPOINT_DISTRIBUTION = 990;

const filterCourses = (courses: Course[] = [], search: string) => {
  if (!search) return courses;
  const searchLower = search.toLowerCase();
  return courses.filter((course) => {
    const courseCode = `${course.subject} ${course.catalog_num}`.toLowerCase();
    return (
      course.name.toLowerCase().includes(searchLower) ||
      courseCode.includes(searchLower) ||
      course.instructor.toLowerCase().includes(searchLower)
    );
  });
};

const calculateCourseScore = (course: Course) => {
  const gpa = course.gpa === null ? 0 : course.gpa;
  const normalizedGPA = (gpa / 4.0) * 5.0;
  const rating = course.instructor_ratings?.avg_rating ?? 2.5;
  return normalizedGPA * 0.6 + rating * 0.4;
};

const sortCourses = (courses: Course[], sortBy: string) => {
  return [...courses].sort((a, b) => {
    switch (sortBy) {
      case "DEFAULT":
        return calculateCourseScore(b) - calculateCourseScore(a);
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

const filterBySort = (
  sortBy: string,
  filters: FilterOptions,
  currentCourses: Course[],
  currentGE: string
): Course[] => {
  if (!currentCourses?.length) return [];

  const { subjects, classTypes, enrollmentStatuses, GEs, careers, prereqs } =
    filters;

  const filteredCourses = currentCourses.filter((course) => {
    const matchSubject = !subjects.length || subjects.includes(course.subject);
    const matchType =
      !classTypes.length || classTypes.includes(course.class_type);
    const matchStatus =
      !enrollmentStatuses.length ||
      enrollmentStatuses.includes(course.class_status);
    const matchGEs =
      currentGE === "AnyGE" ? !GEs.length || GEs.includes(course.ge) : true;
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

  return sortCourses(filteredCourses, sortBy);
};

const GeSearch: React.FC = () => {
  const theme = useTheme();
  const isCategoryDrawer = useMediaQuery(
    `(max-width:${BREAKPOINT_CATEGORY}px)`
  );
  const isDistributionDrawer = useMediaQuery(
    `(max-width:${BREAKPOINT_DISTRIBUTION}px)`
  );
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [panelData, setPanelData] = useSessionStorage<PanelData | null>(
    "gePanelData",
    null
  );
  const [activePanel, setActivePanel] = useSessionStorage<
    "distribution" | "ratings" | "courseDetails" | null
  >("geActivePanel", null);

  const [isOpen, setIsOpen] = useState(false);
  const [scrollToCourseId, setScrollToCourseId] = useState<string>();
  const [expandedCodesMap, setExpandedCodesMap] = useState(
    new Map<string, boolean>()
  );
  const isAllExpanded = useRef(false);

  const [sortBy, setSortBy] = useSessionStorage("sortBy", "DEFAULT");
  const [selectedGE, setSelectedGE] = useSessionStorage("selectedGE", "AnyGE");
  const [selectedClassTypes, setSelectedClassTypes] = useSessionStorage<
    string[]
  >("selectedClassTypes", []);
  const [selectedPrereqs, setSelectedPrereqs] = useSessionStorage<string[]>(
    "selectedPrereqs",
    []
  );
  const [selectedCareers, setSelectedCareers] = useSessionStorage<string[]>(
    "selectedCareers",
    []
  );

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
  const [comparisonCourses, setComparisonCourses] = useLocalStorage<Course[]>(
    "comparisonCourses",
    []
  );

  const [isComparisonOpen, setIsComparisonOpen] = useLocalStorage(
    "isComparisonOpen",
    false
  );

  const [isCategoriesVisible, setIsCategoriesVisible] = useSessionStorage(
    "isCategoriesVisible",
    false
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

  const { data: courses, isLoading: isFetchLoading } = useGECourseData();
  const currentCourses = courses?.[selectedGE];
  const [lastUpdated, setLastUpdated] = useState<string>("None");
  fetchLastUpdate()
    .then((result) => setLastUpdated(result))
    .catch(() => setLastUpdated("Error loading update time"));
  const codes = useMemo(
    () => [...new Set(currentCourses?.map((course) => course.subject))].sort(),
    [currentCourses]
  );

  const GEs = useMemo(
    () =>
      [
        ...new Set(currentCourses?.map((course) => course.ge).filter(Boolean)),
      ].sort(),
    [currentCourses]
  );

  const handleClearFilters = useCallback(() => {
    setSelectedEnrollmentStatuses([]);
    setSelectedSubjects([]);
    setSelectedClassTypes([]);
    setSelectedGEs([]);
    setSelectedPrereqs([]);
    setSelectedCareers([]);
  }, [
    setSelectedEnrollmentStatuses,
    setSelectedSubjects,
    setSelectedClassTypes,
    setSelectedGEs,
    setSelectedCareers,
    setSelectedPrereqs,
  ]);

  const handleGlobalCourseSelect = useCallback(
    (course: Course, courseId: string, category?: string) => {
      handleClearFilters();
      setSelectedGE(category ?? "AnyGE");
      setScrollToCourseId(courseId);
      setExpandedCodesMap((prev) => new Map(prev).set(courseId, true));

      setPanelData(course);
      setActivePanel("courseDetails");
    },
    [handleClearFilters, setSelectedGE, setPanelData, setActivePanel]
  );

  const handleExpandAll = useCallback(() => {
    isAllExpanded.current = !isAllExpanded.current;
    setExpandedCodesMap(
      new Map(
        currentCourses?.map((course) => [course.id, isAllExpanded.current]) ??
          []
      )
    );
  }, [currentCourses]);

  const filteredCourses = useMemo(() => {
    const searchFiltered = filterCourses(currentCourses, search);
    return filterBySort(
      sortBy,
      {
        subjects: selectedSubjects,
        classTypes: selectedClassTypes,
        enrollmentStatuses: selectedEnrollmentStatuses,
        GEs: selectedGEs,
        careers: selectedCareers,
        prereqs: selectedPrereqs,
      },
      searchFiltered,
      selectedGE
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
    selectedCareers,
    selectedPrereqs,
  ]);

  return (
    <Root>
      <CategoryDrawer
        isOpen={isOpen}
        isCategoriesVisible={isCategoriesVisible}
        isCategoryDrawer={isCategoryDrawer}
        isDistributionDrawer={isDistributionDrawer}
        selectedGE={selectedGE}
        setSelectedGE={setSelectedGE}
        setIsOpen={setIsOpen}
        setIsCategoriesVisible={setIsCategoriesVisible}
        activePanel={activePanel}
      />

      <MainContent>
        <ContentContainer>
          <SearchControls
            isSmallScreen={isSmallScreen}
            isCategoryDrawer={isCategoryDrawer}
            handleCategoryToggle={() =>
              setIsCategoriesVisible(!isCategoriesVisible)
            }
            isCategoriesVisible={isCategoriesVisible}
            courses={courses}
            handleGlobalCourseSelect={handleGlobalCourseSelect}
            selectedGE={selectedGE}
            isAllExpanded={isAllExpanded.current}
            handleExpandAll={handleExpandAll}
            codes={codes}
            GEs={GEs}
            sortBy={sortBy}
            setSortBy={setSortBy}
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
              selectedGE={selectedGE}
              setSelectedGE={setSelectedGE}
              setPanelData={setPanelData}
              setActivePanel={setActivePanel}
              handleClearFilters={handleClearFilters}
              handleAddToComparison={handleAddToComparison}
            />
          </ListContainer>
        </ContentContainer>
      </MainContent>

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

// Updated styled components
const Root = styled("div")({
  display: "flex",
  backgroundColor: COLORS.GRAY_50,
  height: "calc(100dvh - 64px)",
  overflow: "hidden",
});

const MainContent = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const ContentContainer = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: COLORS.WHITE,
});

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
export default GeSearch;