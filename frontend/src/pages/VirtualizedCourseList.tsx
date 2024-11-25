import React, { useCallback, useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { styled } from "@mui/material";
import { CourseCard } from "./CourseCard";
import { Course } from "../Colors";

interface CardRefs {
  [key: string]: HTMLDivElement | null;
}

interface DynamicCourseListProps {
  filteredCourses: Course[];
  isSmallScreen: boolean;
  expandedCodesMap: Map<string, boolean>;
  handleExpandCard: (courseId: string) => void;
  scrollToCourseId?: string;
  setSelectedGE:(courseId: string) => void;

}

const ListWrapper = styled("div")({
  height: "calc(100vh - 120px)",
  width: "100%",
});

const ItemWrapper = styled("div")<{ isLastItem?: boolean }>(
  ({ isLastItem }) => ({
    padding: "16px",
    paddingBottom: isLastItem ? "16px" : 0,
    boxSizing: "border-box",
  })
);

export const DynamicCourseList: React.FC<DynamicCourseListProps> = ({
  filteredCourses,
  isSmallScreen,
  expandedCodesMap,
  handleExpandCard,
  scrollToCourseId,
  setSelectedGE,
}) => {
  const cardRefs = useRef<CardRefs>({});
  const virtuosoRef = useRef<any>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [lastScrolledId, setLastScrolledId] = useState<string | null>(null);
  const previousFilteredCoursesRef = useRef<Course[]>(filteredCourses);

  useEffect(() => {
    previousFilteredCoursesRef.current = filteredCourses;
  }, [filteredCourses]);

  useEffect(() => {
    filteredCourses.forEach((course) => {
      if (!cardRefs.current[course.unique_id]) {
        cardRefs.current[course.unique_id] = null;
      }
    });

    Object.keys(cardRefs.current).forEach((unique_id) => {
      if (!filteredCourses.find(course => course.unique_id === unique_id)) {
        delete cardRefs.current[unique_id];
      }
    });
  }, [filteredCourses]);

  useEffect(() => {
    if (!scrollToCourseId || !virtuosoRef.current) return;

    const courseIndex = filteredCourses.findIndex(course => course.unique_id === scrollToCourseId);
    
    if (courseIndex === -1) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (previousFilteredCoursesRef.current !== filteredCourses) {
      setLastScrolledId(null);
    }

    if (scrollToCourseId !== lastScrolledId || previousFilteredCoursesRef.current !== filteredCourses) {
      scrollTimeoutRef.current = setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: courseIndex,
          align: 'center',
          behavior: 'smooth'
        });
        setLastScrolledId(scrollToCourseId);
      }, 100); 
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollToCourseId, filteredCourses, lastScrolledId]);

  const setCardRef = useCallback((courseId: string, element: HTMLDivElement | null) => {
    cardRefs.current[courseId] = element;
  }, []);

  const itemContent = useCallback(
    (index: number) => {
      const course = filteredCourses[index];
      const isExpanded = expandedCodesMap.get(course.unique_id);
      const isLastItem = index === filteredCourses.length - 1;

      return (
        <ItemWrapper 
          isLastItem={isLastItem}
          ref={(el) => setCardRef(course.unique_id, el as HTMLDivElement)}
          data-course-id={course.unique_id}
        >
          <CourseCard
            course={course}
            isSmallScreen={isSmallScreen}
            expanded={!!isExpanded}
            onExpandChange={() => handleExpandCard(course.unique_id)}
            setSelectedGE={setSelectedGE}
          />
        </ItemWrapper>
      );
    },
    [filteredCourses, isSmallScreen, expandedCodesMap, handleExpandCard, setCardRef]
  );

  return (
    <ListWrapper>
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%" }}
        totalCount={filteredCourses.length}
        itemContent={itemContent}
        overscan={30}
        computeItemKey={useCallback(
          (index) => filteredCourses[index].unique_id,
          [filteredCourses]
        )}
      />
    </ListWrapper>
  );
};
