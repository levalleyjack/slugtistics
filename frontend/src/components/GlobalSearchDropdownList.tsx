import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course, getLetterGrade } from "@/Constants";
import { Tooltip, useTheme } from "@mui/material";
import {
  Chip,
  CourseCodeChip,
  DifficultyChip,
  GECategoryChip,
  GradeChip,
  RatingChip,
  ReviewCountChip,
} from "@/components/ui/chip";
import StatusIcon from "./StatusIcon";
export type GlobalSearchProps = {
  courses: Course[] | Record<string, Course[]>;
  onCourseSelect: (course: Course, id: string, geCategory?: string) => void;
  selectedGE?: string;
  disabled?: boolean;
};

function getUniqueRandomIndices<T>(arr: Course[], count: number): number[] {
  if (arr.length <= count) {
    return arr.map((_, i) => i); // fallback if not enough elements
  }

  const indices = new Set<number>();
  while (indices.size < count) {
    const randIndex = Math.floor(Math.random() * arr.length);
    if (arr[randIndex].instructor.toLowerCase() !== "staff") {
      indices.add(randIndex);
    }
  }

  return Array.from(indices);
}

const GlobalSearch = ({
  courses,
  onCourseSelect,
  selectedGE,

  disabled = false,
}: GlobalSearchProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = search;
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [randomIndexes, setRandomIndexes] = useState<number[]>([]);

  const theme = useTheme();

  // Flatten courses array if needed
  const allCourses = useMemo(() => {
    if (!courses) return [];

    if (Array.isArray(courses)) {
      return courses;
    }

    return Object.entries(courses).flatMap(([category, categoryCourses]) =>
      categoryCourses.map((course) => ({
        ...course,
        category,
      }))
    );
  }, [courses]);
  useEffect(() => {
    if (isOpen) {
      const indices = getUniqueRandomIndices(allCourses, 3);
      setRandomIndexes(indices);
    }
  }, [isOpen, allCourses]);
  // Filter courses based on search term
  const searchResults = useMemo(() => {
    const searchInput = debouncedSearch.toLowerCase().trim();
    const searchTerms = searchInput.split(" ");

    const normalizeInstructorName = (name: string) => {
      const parts = name.toLowerCase().split(" ");
      return {
        firstName: parts[0],
        lastName: parts[parts.length - 1],
        fullName: name.toLowerCase(),
        firstInitial: parts[0].charAt(0),
        parts: parts,
      };
    };

    const matchesInstructor = (instructor: string) => {
      const normalizedInstructor = normalizeInstructorName(instructor);

      if (searchTerms.length === 1) {
        return normalizedInstructor.parts.some((part) =>
          part.startsWith(searchInput)
        );
      }

      if (
        searchTerms.length === 2 &&
        normalizedInstructor.firstInitial === searchTerms[0] &&
        normalizedInstructor.lastName.includes(searchTerms[1])
      ) {
        return true;
      }

      return searchTerms.every((term) =>
        normalizedInstructor.parts.some((part) => part.startsWith(term))
      );
    };

    const containsNumbers = /\d/.test(searchInput);

    if (!containsNumbers) {
      return allCourses
        .filter((course) => {
          const courseName = course.name.toLowerCase();
          const courseCode =
            `${course.subject} ${course.catalog_num}`.toLowerCase();

          return (
            matchesInstructor(course.instructor) ||
            courseName.includes(searchInput) ||
            courseCode.startsWith(searchInput)
          );
        })
        .slice(0, 20);
    }

    const courseCodeMatch = searchInput.match(/^([a-zA-Z]+)\s*(\d+)?$/);

    if (courseCodeMatch) {
      const [_, subject, number] = courseCodeMatch;

      return allCourses
        .filter((course) => {
          const courseSubject = course.subject.toLowerCase();
          const courseCatalogNum = course.catalog_num.toLowerCase();

          if (subject && number) {
            return (
              courseSubject.startsWith(subject.toLowerCase()) &&
              courseCatalogNum.startsWith(number)
            );
          }
          return courseSubject.startsWith(subject.toLowerCase());
        })
        .slice(0, 20);
    }

    return allCourses
      .filter((course) => {
        const courseName = course.name.toLowerCase();
        const courseCode =
          `${course.subject} ${course.catalog_num}`.toLowerCase();

        return (
          matchesInstructor(course.instructor) ||
          courseCode.startsWith(searchInput) ||
          courseName.includes(searchInput)
        );
      })
      .slice(0, 20);
  }, [debouncedSearch, allCourses]);

  // Separate results by GE category if applicable
  const { selectedGECourses, otherCourses } = useMemo(() => {
    if (!selectedGE) {
      return {
        selectedGECourses: [] as Course[],
        otherCourses: searchResults,
      };
    }

    return searchResults.reduce(
      (acc, course) => {
        const courseGE = course.ge_category;
        if (courseGE === selectedGE) {
          acc.selectedGECourses.push(course);
        } else {
          acc.otherCourses.push(course);
        }
        return acc;
      },
      { selectedGECourses: [] as Course[], otherCourses: [] as Course[] }
    );
  }, [searchResults, selectedGE]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    if (!isOpen && event.target.value) {
      setIsOpen(true);
    }
  };

  const handleCourseClick = (course: Course) => {
    onCourseSelect(
      course,
      course.id,
      selectedGE ? course.ge_category : undefined
    );
    setIsOpen(false);
    setSearch("");
  };
  const toggleSearch = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      // Focus the input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close search when disabled
  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  // Course list item component
  const CourseListItem = ({ course }: { course: Course }) => {
    const { instructor_ratings: rmpData } = course;

    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
        className="p-4 pb-2 border-b border-gray-100 hover:bg-slate-50 cursor-pointer "
        onClick={() => handleCourseClick(course)}
      >
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                {`${course.subject} ${course.catalog_num}`}
              </span>
              <StatusIcon status={course.class_status} />
            </div>
            <h3 className="text-sm font-medium mt-1 text-slate-800">
              {course.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {course.instructor} • {course.class_type}
            </p>

            {rmpData && (
              <div className="flex gap-2 mt-2">
                <RatingChip rating={rmpData?.avg_rating} compact />
                <DifficultyChip
                  difficulty={rmpData?.difficulty_level}
                  compact
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {course.gpa && (
              <GradeChip
                interactive={false}
                grade={Number(course.gpa)}
                letterGrade={getLetterGrade(course.gpa)}
              />
            )}

            {course.ge &&
              course.ge !== "AnyGE" &&
              course.ge_category !== "AnyGE" && (
                <GECategoryChip category={course.ge} interactive={false} />
              )}
          </div>
        </div>
      </motion.div>
    );
  };

  const ResultsHeader = ({
    count,
    category,
  }: {
    count: number;
    category?: string;
  }) => (
    <div className="sticky top-0 z-1 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 px-4 py-2 flex justify-between items-center">
      <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <span>
          {count} course{count === 1 ? "" : "s"}{" "}
        </span>
        {category && (
          <Badge variant="outline" className="bg-white border-slate-200">
            {category}
          </Badge>
        )}
      </p>
    </div>
  );

  const NoResults = () => (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="bg-slate-100 rounded-full p-4 mb-4">
        <Search className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-slate-500 text-center">
        No courses found matching "{search}"
      </p>
      <p className="text-slate-400 text-sm mt-2 text-center">
        Try adjusting your search or filters
      </p>
    </div>
  );

  return (
    <div className="relative" ref={searchRef}>
      <Tooltip title="Search for classes, instructors, etc." disableInteractive>
        <button
          onClick={toggleSearch}
          disabled={disabled}
          type="button"
          aria-label="Search for classes"
          className="h-9 w-9 rounded-md flex items-center justify-center transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
        >
          <Search className="h-5 w-5 text-slate-600" />
        </button>
      </Tooltip>
      {/* Full screen overlay */}
      <AnimatePresence>
  {isOpen && (
    <motion.div
      className="
        fixed inset-x-0 top-[64px] bottom-0
        bg-slate-900/50 z-50
        flex items-start justify-center
        px-4
      "
      style={{ height: "calc(100dvh - 64px)" }}
      onMouseDown={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* push your modal down slightly from the very top */}
      <div ref={modalRef} className="mt-8 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        >
              {/* Search header */}
              <div className="border-b border-slate-200">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search courses, instructors, subjects..."
                    className="!bg-white dark:!bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pl-6 pr-12 h-14 text-base placeholder:text-slate-400"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search results container */}
              <div className="relative max-h-[70vh] overflow-hidden virtuoso-wrapper">
                {debouncedSearch.length > 0 ? (
                  <div className="overflow-y-auto max-h-[70vh]">
                    {searchResults.length === 0 ? (
                      <NoResults />
                    ) : (
                      <>
                        {selectedGECourses.length > 0 && (
                          <div>
                            <ResultsHeader
                              count={selectedGECourses.length}
                              category={selectedGE}
                            />
                            {selectedGECourses.map((course) => (
                              <CourseListItem key={course.id} course={course} />
                            ))}
                          </div>
                        )}

                        {otherCourses.length > 0 && (
                          <div>
                            <ResultsHeader
                              count={otherCourses.length}
                              category={
                                selectedGE ? "Other categories" : undefined
                              }
                            />
                            {otherCourses.map((course) => (
                              <CourseListItem key={course.id} course={course} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                    <div className="relative">
                      <div className="bg-slate-100 rounded-full p-4 mb-4">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-slate-700 mb-1">
                      Course Search
                    </p>
                    <p className="text-sm text-slate-500 text-center max-w-sm">
                      Start typing to search for courses, instructors, or
                      subjects
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {randomIndexes.length === 3 &&
                        randomIndexes.every((i) => allCourses[i]) &&
                        [
                          `${allCourses[randomIndexes[0]].subject} ${
                            allCourses[randomIndexes[0]].catalog_num
                          }`,
                          `${allCourses[randomIndexes[1]].name}`,
                          `${allCourses[randomIndexes[2]].instructor}`,
                        ].map((example) => (
                          <Button
                            key={example}
                            variant="outline"
                            size="sm"
                            className="bg-slate-50 border-slate-200 hover:bg-slate-100 text-xs rounded-full"
                            onClick={() => setSearch(example)}
                          >
                            {example}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
