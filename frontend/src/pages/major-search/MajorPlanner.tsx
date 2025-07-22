import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { Notification } from "@/components/Notification";
import { motion } from "framer-motion";
import { Tooltip } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton";
import { local } from "../../components/GetGEData";
import { FileUploader } from "@/components/FileUploader";
import { ClassInput } from "@/components/ClassInput";
import { SectionTabs } from "@/components/SectionTabs";
import { CourseList } from "@/components/CourseList";

interface MajorPlannerProps {
  selectedMajor: string;
  onBack: () => void;
}

const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

interface CourseData {
  program: { name: string; admissionYear: string };
  requirements: {
    core: Array<{ class: string[] }>;
    capstone: Array<{ class: string[] }>;
    dc: Array<{ class: string[] }>;
  };
  electives: {
    required: { math: number; upperDivision: number };
    categories: Record<
      string,
      { name: string; courses: Array<{ class: string[] }> }
    >;
  };
}

interface RecommendationsResponse {
  equiv_classes: string[];
  recommended_classes: string[];
  success: boolean;
}

export const MajorPlanner = ({ selectedMajor, onBack }: MajorPlannerProps) => {
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(
    new Set()
  );
  const [classesInputList, setClassesInputList] = useState<string[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<string[]>([]);
  const [classesToRecommend, setClassesToRecommend] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<File | null>(null);
  const [selectedSection, setSelectedSection] = useState("All");
  const [isDragging, setIsDragging] = useState(false);
  const [needsRecommendationRefresh, setNeedsRecommendationRefresh] =
    useState(false);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Refs for scrolling behavior
  const coursesSectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);
  const mainContainerRef = useRef(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "warning" | "error";
    isOpen: boolean;
  }>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const triggerNotification = (
    type: "success" | "info" | "warning" | "error",
    message: string
  ) => {
    setNotification({ type, message, isOpen: true });
  };

  // Check if we're in mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const { data: courseData, isLoading } = useQuery<CourseData>({
    queryKey: ["course-requirements", selectedMajor],
    queryFn: async () => {
      const response = await fetch(`${local}/major_courses/${selectedMajor}`);
      if (!response.ok) throw new Error("Failed to fetch course requirements");
      return response.json();
    },
  });

  const {
    data: recommendationsData,
    refetch: refetchRecommendations,
    isLoading: isLoadingRecommendations,
  } = useQuery<RecommendationsResponse>({
    queryKey: ["recommendations", classesToRecommend],
    queryFn: async () => {
      const response = await fetch(`
        ${local}/major_recommendations?classes=${encodeURIComponent(
        classesToRecommend.join(",")
      )}&major=${encodeURIComponent(selectedMajor)}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
    enabled: classesToRecommend.length > 0,
  });

  // All available courses across all categories
  const allAvailableCourses = courseData
    ? [
        ...courseData.requirements.core.flatMap((g) => g.class),
        ...courseData.requirements.capstone.flatMap((g) => g.class),
        ...courseData.requirements.dc.flatMap((g) => g.class),
        ...Object.values(courseData.electives.categories).flatMap((cat) =>
          cat.courses.flatMap((g) => g.class)
        ),
      ]
    : [];

  // Use recommendations data when available
  useEffect(() => {
    if (recommendationsData) {
      setCompletedCourses(new Set(recommendationsData.equiv_classes || []));
      setRecommendedCourses(recommendationsData.recommended_classes || []);
    }
  }, [recommendationsData]);

  // Handle fixed header visibility
  useEffect(() => {
    if (isMobileView) {
      setShowFixedHeader(false);
      return;
    }

    const handleScroll = () => {
      if (!coursesSectionRef.current) return;

      const rect = coursesSectionRef.current.getBoundingClientRect();
      // Show header when the courses section is scrolled above the viewport
      setShowFixedHeader(rect.top <= 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileView, courseData]);

  // Handle requests for recommendations
  const processClassesInput = () => {
    if (classesInputList.length) {
      setClassesToRecommend(classesInputList);
      refetchRecommendations();
    }
  };

  // Toggle course completion status
  const toggleCourseCompletion = (course: string) => {
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.has(course) ? newSet.delete(course) : newSet.add(course);
      return newSet;
    });
  };

  // Add a new class to the input list
  const addNewClass = (classCode: string) => {
    setClassesInputList((prev) => [...prev, classCode]);
    setNeedsRecommendationRefresh(true);
    const matchedCourse = allAvailableCourses.find(
      (c) => c.toLowerCase() === classCode.toLowerCase()
    );
    if (matchedCourse) {
      setCompletedCourses((prev) => new Set(prev).add(matchedCourse));
    }
  };

  // Remove a class from the input list
  const removeClass = (course: string) => {
    setClassesInputList((prev) => prev.filter((c) => c !== course));
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.delete(course.toUpperCase());
      return newSet;
    });
    setNeedsRecommendationRefresh(true);
  };

  // Handle transcript file upload
  const handleFileUpload = async (file: File) => {
    if (!file) {
      triggerNotification("error", "No file selected for upload");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(
        reader.result as string,
        "text/html"
      );

      const rows = htmlDoc.querySelectorAll("table tr");
      const extractedCourses: string[] = [];

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const dept = cells[0].textContent?.trim();
          const number = cells[1].textContent?.trim();

          // Match patterns like "CSE" and "130"
          if (dept?.match(/^[A-Z]{2,4}$/) && number?.match(/^\d{1,3}[A-Z]?$/)) {
            extractedCourses.push(`${dept} ${number}`);
          }
        }
      });

      if (extractedCourses.length > 0) {
        setClassesInputList(extractedCourses);
        setClassesToRecommend(extractedCourses);
        setNeedsRecommendationRefresh(false);
        refetchRecommendations();
        triggerNotification("success", "Transcript parsed successfully");
      } else {
        triggerNotification("error", "No course data found in transcript");
      }
    };

    reader.onerror = () => {
      triggerNotification("error", "Failed to read HTML transcript");
    };

    reader.readAsText(file);
  };

  // Fixed header component
  const FixedHeader = () => (
    <motion.div
      ref={headerRef}
      variants={headerVariants}
      initial="hidden"
      animate={showFixedHeader ? "visible" : "hidden"}
      className={`fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm ${
        isMobileView ? "hidden" : "block"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <h3 className="font-semibold text-sm sm:text-base truncate max-w-[140px] sm:max-w-full">
            {courseData?.program.name}
          </h3>
          <div className="flex items-center space-x-1 text-xs sm:text-sm">
            <div className="flex border border-gray-200 rounded-md">
              {["All", "Core", "Capstone", "DC", "Electives"].map((section) => (
                <button
                  key={section}
                  className={`cursor-pointer px-2 sm:px-3 py-1.5 text-xs sm:text-sm ${
                    selectedSection === section
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${section === "All" ? "rounded-l-md" : ""} ${
                    section === "Electives" ? "rounded-r-md" : ""
                  }`}
                  onClick={() => setSelectedSection(section)}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50">
            {completedCourses.size} / {allAvailableCourses.length} completed
          </Badge>
          {recommendedCourses.length > 0 && (
            <Badge variant="outline" className="bg-yellow-50">
              {recommendedCourses.length} recommended
            </Badge>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="cursor-pointer rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-40 sm:w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {notification.isOpen && (
        <Notification
          type={notification.type}
          message={notification.message}
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
        />
      )}

      <FixedHeader />

      <div
        ref={mainContainerRef}
        className="flex flex-col max-w-7xl mx-auto px-3 sm:px-6 py-4"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl sm:text-3xl font-bold line-clamp-2">
              {courseData?.program.name} Requirements
            </h1>
            <div className="flex space-x-1 text-xs">
              <Badge variant="outline" className="bg-emerald-50">
                {completedCourses.size} / {allAvailableCourses.length} completed
              </Badge>
              {recommendedCourses.length > 0 && (
                <Badge variant="outline" className="bg-yellow-50">
                  {recommendedCourses.length} recommended
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* File Uploader or Class List */}
        {classesInputList.length === 0 ? (
          <FileUploader
            onFileUpload={handleFileUpload}
            onNotification={triggerNotification}
            isDragActive={isDragging}
            uploading={uploading}
            file={transcript}
          />
        ) : (
          <div className="border-2 border-dashed rounded-lg p-3 sm:p-6">
            <ClassInput
              onAddClass={addNewClass}
              onRemoveClass={removeClass}
              classes={classesInputList}
            />
          </div>
        )}

        {/* Controls for adding courses and getting recommendations */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 mt-4 sm:mt-6">
          {classesInputList.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {/* File uploader in compact mode */}
              <FileUploader
                onFileUpload={handleFileUpload}
                onNotification={triggerNotification}
                uploading={uploading}
                file={transcript}
                compact={true}
              />

              {/* Divider */}
              <div className="hidden sm:block h-8 sm:h-12 w-px bg-muted" />

              {/* Get recommendations button */}
              {needsRecommendationRefresh ? (
                <div className="relative flex flex-col mt-2 sm:mt-0">
                  <Tooltip
                    title="You added new classes. Click to refresh."
                    arrow
                    placement="top"
                    disableInteractive
                  >
                    <span className="inline-block">
                      <Button
                        onClick={() => {
                          processClassesInput();
                          setNeedsRecommendationRefresh(false);
                        }}
                        disabled={isLoadingRecommendations}
                        variant="secondary"
                        size="sm"
                        className="cursor-pointer text-xs sm:text-sm"
                      >
                        {isLoadingRecommendations
                          ? "Processing..."
                          : "Get Recommendations"}
                      </Button>
                    </span>
                  </Tooltip>

                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-amber-400 rounded-full" />
                </div>
              ) : (
                <Button
                  onClick={() => {
                    processClassesInput();
                    setNeedsRecommendationRefresh(false);
                  }}
                  disabled={isLoadingRecommendations}
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer text-xs sm:text-sm mt-2 sm:mt-0"
                >
                  {isLoadingRecommendations
                    ? "Processing..."
                    : "Get Recommendations"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <div className="mb-4 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              Recommended Courses
            </h2>
            <div className="flex flex-wrap gap-2">
              {recommendedCourses.map((course) => (
                <Badge
                  key={course}
                  variant="secondary"
                  className="cursor-pointer text-xs sm:text-sm"
                  onClick={() => toggleCourseCompletion(course)}
                >
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div ref={coursesSectionRef}>
          <SectionTabs
            sections={["All", "Core", "Capstone", "DC", "Electives"]}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            isMobileView={isMobileView}
          />
        </div>

        {/* Courses Grid */}
        {courseData && (
          <div className="space-y-4 sm:space-y-6">
            {selectedSection === "All" && (
              <CourseList
                courses={allAvailableCourses}
                completedCourses={completedCourses}
                recommendedCourses={recommendedCourses}
                onToggleCourse={toggleCourseCompletion}
              />
            )}

            {selectedSection === "Core" && (
              <CourseList
                courses={courseData.requirements.core.flatMap((g) => g.class)}
                completedCourses={completedCourses}
                recommendedCourses={recommendedCourses}
                onToggleCourse={toggleCourseCompletion}
              />
            )}

            {selectedSection === "Capstone" && (
              <CourseList
                courses={courseData.requirements.capstone.flatMap(
                  (g) => g.class
                )}
                completedCourses={completedCourses}
                recommendedCourses={recommendedCourses}
                onToggleCourse={toggleCourseCompletion}
              />
            )}

            {selectedSection === "DC" && (
              <CourseList
                courses={courseData.requirements.dc.flatMap((g) => g.class)}
                completedCourses={completedCourses}
                recommendedCourses={recommendedCourses}
                onToggleCourse={toggleCourseCompletion}
              />
            )}

            {selectedSection === "Electives" &&
              Object.values(courseData.electives.categories).map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {cat.name}
                  </h3>
                  <CourseList
                    courses={cat.courses.flatMap((g) => g.class)}
                    completedCourses={completedCourses}
                    recommendedCourses={recommendedCourses}
                    onToggleCourse={toggleCourseCompletion}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};
