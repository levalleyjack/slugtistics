import React, { useState, useCallback, useMemo, useRef } from "react";
import { useTheme, useMediaQuery, styled, Typography } from "@mui/material";
import {
  calculateCourseScoreOutOf10,
  COLORS,
  Course,
  FilterOptions,
  PanelData,
} from "../Constants";
import {
  useGECourseData,
  useGEState,
  useLocalStorage,
  useSessionStorage,
} from "./GetGEData";
import CategoryDrawer from "../components/CategoryDrawer";
import { SearchControls } from "../components/SearchControls";
import { CourseList } from "./VirtualizedCourseList";
import { PanelDrawer } from "../components/PanelDrawer";
import { useLocation, useNavigate } from "react-router-dom";
import EnhancedCourseComparison from "../components/CourseComparisonTabs";

const BREAKPOINT_CATEGORY = 1340;
const BREAKPOINT_DISTRIBUTION = 1047;
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

const sortCourses = (courses: Course[], sortBy: string) => {
  return [...courses].sort((a, b) => {
    switch (sortBy) {
      case "DEFAULT":
        const courseAScore = calculateCourseScoreOutOf10(
          a.gpa,
          a.instructor_ratings?.avg_rating,
          0.85
        );
        const courseBScore = calculateCourseScoreOutOf10(
          b.gpa,
          b.instructor_ratings?.avg_rating,
          0.85
        );

        return courseBScore - courseAScore;

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
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollPosition = useRef(0);
  const accumulatedDelta = useRef(0);
  const scrollDirectionRef = useRef<"up" | "down" | null>(null);
  
  const handleScrollPositionChange = (position: number) => {
    const delta = position - lastScrollPosition.current;
    const newDirection = delta > 0 ? "down" : delta < 0 ? "up" : null;
  
    if (newDirection !== scrollDirectionRef.current) {
      accumulatedDelta.current = 0;
      scrollDirectionRef.current = newDirection;
    }
  
    accumulatedDelta.current += Math.abs(delta);
  
    if (position === 0) {
      setHeaderVisible(true);
      accumulatedDelta.current = 0;
    } else if (scrollDirectionRef.current === "up" && accumulatedDelta.current > 120) {//scrolls up an entire course
      setHeaderVisible(true);
      accumulatedDelta.current = 0; 
    } else if (scrollDirectionRef.current === "down" && accumulatedDelta.current > 5 && position > 0) {
      setHeaderVisible(false);
      accumulatedDelta.current = 0; 
    }
  
    lastScrollPosition.current = position;
  };
  

  const [search, setSearch] = useState("");
  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [activePanel, setActivePanel] = useState<
    "distribution" | "ratings" | "courseDetails" | null
  >(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const [sortBy, setSortBy] = useSessionStorage("sortBy", "DEFAULT");
  const [selectedGE, setSelectedGE] = useGEState("AnyGE");

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
  const [favoriteCourses, setFavoriteCourses] = useLocalStorage<Course[]>(
    "favoriteCourses",
    []
  );

  const [isFavoritesOpen, setIsFavoritesOpen] = useLocalStorage(
    "isFavoritesOpen",
    false
  );

  const [isCategoriesVisible, setIsCategoriesVisible] = useSessionStorage(
    "isCategoriesVisible",
    false
  );

  const handleAddToFavorites = (course: Course) => {
    if (!favoriteCourses.find((c) => c.enroll_num === course.enroll_num)) {
      setFavoriteCourses((prev) => [...prev, course]);
      setIsFavoritesOpen(true);
    }
  };

  const handleRemoveFromFavorites = (index: number) => {
    setFavoriteCourses((prev) => prev.filter((_, i) => i !== index));
  };
  const handleClearAll = () => {
    setFavoriteCourses([]);
  };

  const {
    data: courses,
    isLoading: isFetchLoading,
    error: coursesError,
  } = useGECourseData();
  const currentCourses = courses?.[selectedGE];

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
      setSelectedCourse(courseId);
      setPanelData(course);
      setActivePanel("courseDetails");
    },
    [handleClearFilters, setSelectedGE, setPanelData, setActivePanel]
  );

  // const handleExpandAll = useCallback(() => {
  //   isAllExpanded.current = !isAllExpanded.current;
  //   setExpandedCodesMap(
  //     new Map(
  //       currentCourses?.map((course) => [course.id, isAllExpanded.current]) ??
  //         []
  //     )
  //   );
  // }, [currentCourses]);

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
            headerVisible={headerVisible}
            isCategoryDrawer={isCategoryDrawer}
            handleCategoryToggle={() =>
              setIsCategoriesVisible(!isCategoriesVisible)
            }
            isCategoriesVisible={isCategoriesVisible}
            courses={courses}
            handleGlobalCourseSelect={handleGlobalCourseSelect}
            selectedGE={selectedGE}
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
          />

          {isFavoritesOpen && favoriteCourses.length > 0 && (
            <FavoritesContainer>
              <EnhancedCourseComparison
                onClearAll={handleClearAll}
                courses={favoriteCourses}
                onRemoveCourse={handleRemoveFromFavorites}
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
            </FavoritesContainer>
          )}

          <ListContainer isFavoritesOpen={isFavoritesOpen}>
            {!coursesError ? (
              <CourseList
                isFetchLoading={isFetchLoading}
                filteredCourses={filteredCourses}
                isSmallScreen={isSmallScreen}
                selectedCourse={selectedCourse}
                comparisonCourses={favoriteCourses}
                setSelectedCourse={setSelectedCourse}
                selectedGE={selectedGE}
                setSelectedGE={setSelectedGE}
                setPanelData={setPanelData}
                setActivePanel={setActivePanel}
                handleClearFilters={handleClearFilters}
                handleAddToFavorites={handleAddToFavorites}
                onScrollPositionChange={handleScrollPositionChange}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Server is starting soon, please wait...
                </Typography>
              </div>
            )}
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
          setSelectedCourse("");
        }}
      />
    </Root>
  );
};

const Root = styled("div")({
  display: "flex",
  height: "calc(100dvh - 64px)",
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

const FavoritesContainer = styled("div")(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ListContainer = styled("div")<{ isFavoritesOpen: boolean }>(
  ({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  })
);
export default GeSearch;
