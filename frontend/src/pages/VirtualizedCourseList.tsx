import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  UIEvent,
} from "react";
import { Virtuoso } from "react-virtuoso";
import { Box, Divider, styled, Typography } from "@mui/material";
import { CourseCard } from "../components/CourseCard";
import { COLORS, Course, CourseCode } from "../Constants";
import { LoadingCourseCard } from "../components/LoadingComponents";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

interface DynamicCourseListProps {
  filteredCourses: Course[];
  isSmallScreen: boolean;
  selectedCourse: string;
  handleSelectedCourse: (courseId: string) => void;
  comparisonCourses: Course[];

  setSelectedGE?: (category: string) => void;
  onDistributionOpen: (courseCode: string, professorName: string) => void;
  onRatingsOpen: (
    professorName: string,
    courseCode: string,
    courseCodes: CourseCode[]
  ) => void;
  onCourseDetailsOpen: (course: Course) => void;
  handleAddToFavorites?: (course: Course) => void;
  onScrollPositionChange?: (position: number) => void;
}

const ListWrapper = styled("div")({
  height: "100%",
  width: "100%",
});
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

const ItemWrapper = styled("div")<{
  isFirstItem?: boolean;
  isLastItem?: boolean;
}>(({ theme, isFirstItem, isLastItem }) => ({
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
  width: "100%",
}));
export const DynamicCourseList: React.FC<DynamicCourseListProps> = ({
  filteredCourses,
  isSmallScreen,
  selectedCourse,
  handleSelectedCourse,
  comparisonCourses,
  setSelectedGE,
  onDistributionOpen,
  onRatingsOpen,
  onCourseDetailsOpen,
  handleAddToFavorites,
  onScrollPositionChange,
}) => {
  const virtuosoRef = useRef<any>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [lastScrolledId, setLastScrolledId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const previousFilteredCoursesRef = useRef<Course[]>(filteredCourses);
  const handleScroll = (event: any) => {
    const scrollTop =
      typeof event.scrollTop !== "undefined"
        ? event.scrollTop
        : event.target?.scrollTop || event.currentTarget?.scrollTop || 0;

    if (onScrollPositionChange) {
      onScrollPositionChange(scrollTop);
    }
  };

  useEffect(() => {
    previousFilteredCoursesRef.current = filteredCourses;
  }, [filteredCourses]);

  useEffect(() => {
    if (!selectedCourse || !virtuosoRef.current) return;

    const courseIndex = filteredCourses.findIndex(
      (course) => course.id === selectedCourse
    );

    if (courseIndex === -1) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (previousFilteredCoursesRef.current !== filteredCourses) {
      setLastScrolledId(null);
    }

    if (
      selectedCourse !== lastScrolledId ||
      previousFilteredCoursesRef.current !== filteredCourses
    ) {
      scrollTimeoutRef.current = setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: courseIndex,
          align: "center",
          behavior: "smooth",
        });
        setLastScrolledId(selectedCourse);
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [selectedCourse, filteredCourses, lastScrolledId]);

  const itemContent = useCallback(
    (index: number) => {
      const course = filteredCourses[index];
      const isExpanded = course.id === selectedCourse;
      const isLastItem = index === filteredCourses.length - 1;
      const isFirstItem = index === 0;
      const favorited = comparisonCourses.some(
        (c) => c.enroll_num == course.enroll_num
      );
      const isBottomExpanded =
        !isLastItem && filteredCourses[index + 1].id === selectedCourse;

      return (
        <ItemWrapper
          isFirstItem={isFirstItem}
          isLastItem={isLastItem}
          data-course-id={course.id}
        >
          <Box
            sx={{
              width: "600px",
              maxWidth: "100%", //make sure responsive on small screens
            }}
          >
            <CourseCard
              course={course}
              isSmallScreen={isSmallScreen}
              expanded={!!isExpanded}
              onExpandChange={() => {
                handleSelectedCourse(course.id);
              }}
              isFavorited={favorited}
              {...(setSelectedGE ? { setSelectedGE } : {})} //conditionally adds selectge
              onDistributionOpen={onDistributionOpen}
              onRatingsOpen={onRatingsOpen}
              onCourseDetailsOpen={onCourseDetailsOpen}
              handleAddToFavorites={handleAddToFavorites}
              hideCompareButton={handleAddToFavorites ? false : true}
            />

            <Divider
              sx={{
                display: "flex",
                mb: "1.5px",
                mt: "1.5px",
                visibility:
                  isExpanded || isBottomExpanded ? "hidden" : "visible",
              }}
            />
          </Box>
        </ItemWrapper>
      );
    },
    [
      filteredCourses,
      isSmallScreen,
      selectedCourse,
      handleSelectedCourse,
      handleAddToFavorites,
    ]
  );

  return (
    <ListWrapper>
      <Virtuoso
        fixedItemHeight={160}
        ref={virtuosoRef}
        style={{ height: "100%" }}
        totalCount={filteredCourses.length}
        itemContent={itemContent}
        overscan={15}
        computeItemKey={useCallback(
          (index) => filteredCourses[index].id,
          [filteredCourses]
        )}
        onScroll={handleScroll}
        scrollerRef={(ref) => {
          scrollRef.current = ref as HTMLDivElement | null;
        }}
      />
    </ListWrapper>
  );
};

interface CourseListProps {
  isFetchLoading: boolean;
  filteredCourses: Course[];
  isSmallScreen: boolean;
  selectedCourse: string;
  setSelectedCourse: (courseId: string) => void;
  comparisonCourses: Course[];

  selectedGE: string;
  setSelectedGE: (ge: string) => void;
  setPanelData: (data: any) => void;
  setActivePanel: (
    panel: "distribution" | "ratings" | "courseDetails" | null
  ) => void;
  handleClearFilters: () => void;
  handleAddToFavorites: (course: Course) => void;
  onScrollPositionChange?: (position: number) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  isFetchLoading,
  filteredCourses,
  isSmallScreen,
  selectedCourse,
  setSelectedCourse,
  comparisonCourses,
  selectedGE,
  setSelectedGE,
  setPanelData,
  setActivePanel,
  handleClearFilters,
  handleAddToFavorites,
  onScrollPositionChange,
}) => {
  if (isFetchLoading) {
    return (
      <ListWrapper>
        {Array.from({ length: 5 }).map((_, i) => (
          <ItemWrapper key={i}>
            <Box
              sx={{
                width: "600px",
                maxWidth: "100%", //make sure responsive on small screens
              }}
            >
              <LoadingCourseCard />
              <Divider
                sx={{
                  display: "flex",
                  mb: "1.5px",
                  mt: "1.5px",
                }}
              />
            </Box>
          </ItemWrapper>
        ))}
      </ListWrapper>
    );
  }

  if (!filteredCourses?.length) {
    return (
      <CenterContent>
        <NoResults>
          No courses found <SentimentVeryDissatisfiedIcon />
          <Box
            component="span"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Box>
        </NoResults>
      </CenterContent>
    );
  }

  return (
    <>
      <DynamicCourseList
        filteredCourses={filteredCourses}
        isSmallScreen={isSmallScreen}
        selectedCourse={selectedCourse}
        handleSelectedCourse={(id: string) => setSelectedCourse(id)}
        {...(selectedGE === "AnyGE" && { setSelectedGE })}
        onDistributionOpen={(courseCode, professorName) => {
          setPanelData({ courseCode, professorName });
          setActivePanel("distribution");
        }}
        onRatingsOpen={(professorName, courseCode, courseCodes) => {
          setPanelData({
            professorName,
            currentClass: courseCode,
            courseCodes,
          });
          setActivePanel("ratings");
        }}
        onCourseDetailsOpen={(course) => {
          setPanelData(course);
          setActivePanel("courseDetails");
        }}
        handleAddToFavorites={handleAddToFavorites}
        onScrollPositionChange={onScrollPositionChange}
        comparisonCourses={comparisonCourses}
      />
    </>
  );
};
