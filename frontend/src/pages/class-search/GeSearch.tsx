import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  useTheme,
  useMediaQuery,
  styled,
  Typography,
  Box,
} from "@mui/material";
import {
  calculateCourseScoreOutOf10,
  COLORS,
  Course,
  FilterOptions,
  getLastUpdatedText,
  PanelData,
  ScrollDirection,
} from "../../Constants";
import {
  useAllCourseData,
  useGEState,
  useLocalStorage,
  useSessionStorage,
} from "../../components/GetGEData";
import CategoryDrawer from "../../components/CategoryDrawer";
import { SearchControls } from "../../components/SearchControls";
import { CourseList } from "../../components/VirtualizedCourseList";
import CoursePanel from "@/components/CoursePanel";
import { Notification } from "@/components/Notification";
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // panel state
  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [activePanel, setActivePanel] = useState<
    "distribution" | "ratings" | "courseDetails" | null
  >(null);

  // layout toggles
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesVisible, setIsCategoriesVisible] = useSessionStorage(
    "isCategoriesVisible",
    false
  );

  // selection & scrolling
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const virtuosoRef = useRef<any>(null);
  const [visibleRange, setVisibleRange] = useState({
    startIndex: 0,
    endIndex: 0,
  });

  // favorites & compare
  const [favoriteCourses, setFavoriteCourses] = useLocalStorage<Course[]>(
    "favoriteCourses",
    []
  );
  const [compareMode, setCompareMode] = useState(false);

  // tip notification
  const [hasSeenFavoriteTip, setHasSeenFavoriteTip] = useState(false);
  const hasTriggeredTipRef = useRef(false);
  const [showFavoriteTip, setShowFavoriteTip] = useState(false);

  // global filters / sort
  const [sortBy, setSortBy] = useSessionStorage("sortBy", "DEFAULT");
  const [selectedGE, setSelectedGE] = useGEState("AnyGE");
  const [selectedSubjects, setSelectedSubjects] = useSessionStorage<string[]>(
    "selectedSubjects",
    []
  );
  const [selectedClassTypes, setSelectedClassTypes] = useSessionStorage<
    string[]
  >("selectedClassTypes", []);
  const [selectedEnrollmentStatuses, setSelectedEnrollmentStatuses] =
    useSessionStorage<string[]>("selectedEnrollmentStatuses", []);
  const [selectedGEs, setSelectedGEs] = useSessionStorage<string[]>(
    "selectedGEs",
    []
  );
  const [selectedCareers, setSelectedCareers] = useSessionStorage<string[]>(
    "selectedCareers",
    []
  );
  const [selectedPrereqs, setSelectedPrereqs] = useSessionStorage<string[]>(
    "selectedPrereqs",
    []
  );

  // 1. fetch a flat list of all courses
  const {
    data: allCourses = [],
    lastUpdate: lastUpdated,
    isLoading: isFetchLoading,
    error: coursesError,
  } = useAllCourseData();

  // 2. build the list of GE “keys” (AnyGE + unique codes)
  const geKeys = useMemo(() => {
    const uniques = Array.from(
      new Set(allCourses.map((c) => c.ge).filter(Boolean))
    ).sort();
    return ["AnyGE", ...uniques];
  }, [allCourses]);

  // 3. pick the right slice of courses by selectedGE
  const currentCourses = useMemo(() => {
    if (selectedGE === "AnyGE") return allCourses;
    return allCourses.filter((c) => c.ge === selectedGE);
  }, [allCourses, selectedGE]);

  // 4. derive dropdown options
  const GEs = geKeys;
  const codes = useMemo(
    () => [...new Set(currentCourses.map((c) => c.subject))].sort(),
    [currentCourses]
  );

  // load tip state from localStorage
  useEffect(() => {
    setHasSeenFavoriteTip(
      localStorage.getItem("hasSeenFavoriteTip") === "true"
    );
  }, []);

  // handlers
  const handleAddToFavorites = (course: Course) => {
    setFavoriteCourses((prev) => {
      const isFav = prev.some((c) => c.enroll_num === course.enroll_num);
      if (isFav) {
        const updated = prev.filter((c) => c.enroll_num !== course.enroll_num);
        if (updated.length === 0) setCompareMode(false);
        return updated;
      } else {
        if (!hasSeenFavoriteTip && !hasTriggeredTipRef.current) {
          hasTriggeredTipRef.current = true;
          setShowFavoriteTip(true);
          localStorage.setItem("hasSeenFavoriteTip", "true");
          setHasSeenFavoriteTip(true);
        }
        return [...prev, course];
      }
    });
  };

  const handleClearAllFavorites = () => {
    setCompareMode(false);
    setFavoriteCourses([]);
  };
  const handleClearFilters = useCallback(() => {
    setSelectedEnrollmentStatuses([]);
    setSelectedSubjects([]);
    setSelectedClassTypes([]);
    setSelectedGEs([]);
    setSelectedCareers([]);
    setSelectedPrereqs([]);
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
    [handleClearFilters]
  );

  // filtering + sorting
  const filteredCourses = useMemo(
    () =>
      filterBySort(
        sortBy,
        {
          subjects: selectedSubjects,
          classTypes: selectedClassTypes,
          enrollmentStatuses: selectedEnrollmentStatuses,
          GEs: selectedGEs,
          careers: selectedCareers,
          prereqs: selectedPrereqs,
        },
        currentCourses,
        selectedGE
      ),
    [
      sortBy,
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      selectedGEs,
      selectedCareers,
      selectedPrereqs,
      currentCourses,
      selectedGE,
    ]
  );

  const filteredFavoriteCourses = useMemo(
    () =>
      filterBySort(
        sortBy,
        {
          subjects: selectedSubjects,
          classTypes: selectedClassTypes,
          enrollmentStatuses: selectedEnrollmentStatuses,
          GEs: selectedGEs,
          careers: selectedCareers,
          prereqs: selectedPrereqs,
        },
        favoriteCourses,
        selectedGE
      ),
    [
      sortBy,
      selectedSubjects,
      selectedClassTypes,
      selectedEnrollmentStatuses,
      selectedGEs,
      selectedCareers,
      selectedPrereqs,
      favoriteCourses,
      selectedGE,
    ]
  );

  const leftList =
    favoriteCourses.length > 0 && compareMode
      ? filteredFavoriteCourses
      : filteredCourses;

  const selectedIndex = filteredCourses.findIndex(
    (c) => c.id === selectedCourse
  );

  const scrollDirection: ScrollDirection = selectedCourse
    ? selectedIndex < visibleRange.startIndex
      ? "up"
      : selectedIndex > visibleRange.endIndex
      ? "down"
      : "none"
    : "none";

  const scrollToSelected = useCallback(() => {
    setSelectedGE("AnyGE");
    if (virtuosoRef.current && selectedIndex > -1) {
      virtuosoRef.current.scrollToIndex({
        index: selectedIndex,
        align: "center",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyItems: "center",
      }}
    >
      <Box
        maxWidth="1440px"
        mx="auto"
        sx={{
          height: "calc(100dvh - 64px)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Mobile category drawer */}
        <CategoryDrawer
          isOpen={isOpen}
          selectedGE={selectedGE}
          setSelectedGE={setSelectedGE}
          setIsOpen={setIsOpen}
        />

        <Box display="flex" gap="12px" height="calc(100vh - 64px)">
          {/* Left column */}
          <Box
            sx={{
              flex: "0 0 600px",
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <SearchControls
              setIsOpen={setIsOpen}
              lastUpdated={getLastUpdatedText(lastUpdated)}
              scrollDirection={scrollDirection}
              handleCategoryToggle={() =>
                setIsCategoriesVisible(!isCategoriesVisible)
              }
              isCategoriesVisible={isCategoriesVisible}
              courses={allCourses}
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
              setSelectedCareers={setSelectedCareers}
              selectedPrereqs={selectedPrereqs}
              setSelectedPrereqs={setSelectedPrereqs}
              scrollToSelectedCourse={scrollToSelected}
              favoriteCoursesLength={favoriteCourses.length}
              compareMode={compareMode}
              setCompareMode={setCompareMode}
              handleDeleteAllFavorites={handleClearAllFavorites}
            />

            <Box flex={1} overflow="auto">
              {!coursesError ? (
                <CourseList
                  virtuosoRef={virtuosoRef}
                  isFetchLoading={isFetchLoading}
                  filteredCourses={leftList}
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
                  onRangeChange={(range) => setVisibleRange(range)}
                />
              ) : (
                <Box
                  display="flex"
                  height="100%"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography color="text.secondary">
                    Server is starting soon, please wait...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <CoursePanel activePanel={activePanel} panelData={panelData} />
        </Box>
      </Box>

      <Notification
        isOpen={showFavoriteTip}
        onClose={() => setShowFavoriteTip(false)}
        message="Don’t worry — your saved courses are stored in your browser and will stick around unless you clear your data."
        duration={6000}
        type="info"
      />
    </div>
  );
};

export default GeSearch;
