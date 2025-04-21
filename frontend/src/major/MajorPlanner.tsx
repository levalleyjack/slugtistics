import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle,
  UploadCloud,
  Plus,
  X,
  ChevronDown,
  Menu,
} from "lucide-react";
import { local } from "../pages/GetGEData";
import { Notification } from "@/components/Notification";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@mui/material";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const pulseClass =
  "transition-transform hover:scale-[1.02] active:scale-[0.98]";

interface MajorPlannerProps {
  selectedMajor: string;
  onBack: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
  const [newClassInput, setNewClassInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [needsRecommendationRefresh, setNeedsRecommendationRefresh] =
    useState(false);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Ref for the intersection observer target (where the header should start showing)
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

  useEffect(() => {
    if (recommendationsData) {
      setCompletedCourses(new Set(recommendationsData.equiv_classes || []));
      setRecommendedCourses(recommendationsData.recommended_classes || []);
    }
  }, [recommendationsData]);

  // Use scroll position instead of IntersectionObserver for better reliability
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

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileView, courseData]);

  const processClassesInput = () => {
    if (classesInputList.length) {
      setClassesToRecommend(classesInputList);
      refetchRecommendations();
    }
  };

  const toggleCourseCompletion = (course: string) => {
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.has(course) ? newSet.delete(course) : newSet.add(course);
      return newSet;
    });
  };

  const addNewClass = () => {
    const cleanInput = newClassInput.trim().toUpperCase();
    if (cleanInput && !classesInputList.includes(cleanInput)) {
      setClassesInputList((prev) => [...prev, cleanInput]);
      setNeedsRecommendationRefresh(true);
      const matchedCourse = allAvailableCourses.find(
        (c) => c.toLowerCase() === cleanInput.toLowerCase()
      );
      if (matchedCourse) {
        setCompletedCourses((prev) => new Set(prev).add(matchedCourse));
      }
      setNewClassInput("");
    }
  };

  const removeClass = (course: string) => {
    setClassesInputList((prev) => prev.filter((c) => c !== course));
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.delete(course.toUpperCase());
      return newSet;
    });
    setNeedsRecommendationRefresh(true);
  };

  const handleFileUpload = async () => {
    if (!transcript) return;
    if (transcript.size > 5 * 1024 * 1024) {
      triggerNotification("error", "File size exceeds 5MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("transcript", transcript);

    try {
      const response = await fetch(
        `${local}/major_recommendations/parse_transcript`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      if (Array.isArray(data.courses)) {
        setClassesInputList(data.courses);
        setClassesToRecommend(data.courses);
        setNeedsRecommendationRefresh(false);
        refetchRecommendations();
        triggerNotification("success", "Transcript uploaded successfully");
      }
    } catch (err) {
      triggerNotification("error", "Failed to upload transcript");
    }
  };

  const renderCourses = (courses: string[]) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
    >
      {courses.map((course) => (
        <motion.div variants={cardVariants} className="w-full">
          <Card
            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
              completedCourses.has(course)
                ? "bg-emerald-100 border-emerald-400"
                : recommendedCourses.includes(course)
                ? "bg-yellow-100 border-yellow-400"
                : "border-muted"
            }`}
            onClick={() => toggleCourseCompletion(course)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium">{course}</span>
              {completedCourses.has(course) ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <Plus className="h-5 w-5 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  // Mobile nav section selector
  const MobileNavSelector = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="mt-6 space-y-1">
          {["All", "Core", "Capstone", "DC", "Electives"].map((section) => (
            <div
              className={`px-4 py-3 rounded-md cursor-pointer ${
                selectedSection === section
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setSelectedSection(section);
                setIsSheetOpen(false);
              }}
            >
              {section}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Fixed header that shows when scrolling down - only on desktop
  const FixedHeader = () => (
    <AnimatePresence>
      {showFixedHeader && !isMobileView && (
        <motion.div
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm hidden md:block"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h3 className="font-semibold text-sm sm:text-base truncate max-w-[140px] sm:max-w-full">
                {courseData?.program.name}
              </h3>
              <div className="flex items-center space-x-1 text-xs sm:text-sm">
                <Badge variant="outline" className="bg-emerald-50">
                  {completedCourses.size} / {allAvailableCourses.length}{" "}
                  completed
                </Badge>
                {recommendedCourses.length > 0 && (
                  <Badge variant="outline" className="bg-yellow-50">
                    {recommendedCourses.length} recommended
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border border-gray-200 rounded-md">
                {["All", "Core", "Capstone", "DC", "Electives"].map(
                  (section) => (
                    <button
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
                  )
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="cursor-pointer"
              >
                <ChevronDown className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-40 sm:w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <Skeleton className="h-24 rounded-lg" />
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

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              setTranscript(e.dataTransfer.files[0]);
            }
            setIsDragging(false);
          }}
          className={`relative w-full min-h-[150px] sm:min-h-[300px] flex flex-col items-center border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out p-3 sm:p-6 ${
            classesInputList.length === 0 ? "justify-center" : "items-start"
          } ${isDragging ? "border-primary bg-muted/30" : "border-muted"}`}
        >
          {classesInputList.length === 0 && !transcript ? (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <UploadCloud className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              <h2 className="text-lg sm:text-2xl font-semibold mt-4">
                No classes yet
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 mb-4 sm:mb-6">
                Upload your transcript or manually add classes to get started!
              </p>
              <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-muted rounded-md cursor-pointer hover:bg-muted-foreground/10 transition-colors">
                <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base truncate max-w-[140px] sm:max-w-full">
                  {transcript ? (transcript as File).name : "Choose File"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setTranscript(e.target.files[0])
                  }
                />
              </label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                or drag and drop your file here
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 w-full">
              {classesInputList.map((course) => (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm"
                  onClick={() => removeClass(course)}
                >
                  {course}
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 mt-4 sm:mt-6">
          {/* Add Class Input */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add a new class"
              value={newClassInput}
              onChange={(e) => setNewClassInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewClass()}
              className="flex-grow"
            />
            <Button onClick={addNewClass} className="w-full sm:w-auto">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* File Upload Actions */}
            <div className="flex flex-wrap gap-2 items-center">
              <label className="inline-flex items-center px-3 sm:px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted-foreground/10 transition-colors text-xs sm:text-sm">
                <UploadCloud className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="truncate max-w-[80px] sm:max-w-[200px]">
                  {transcript ? transcript.name : "Choose File"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setTranscript(e.target.files[0])
                  }
                />
              </label>
              <Button
                onClick={handleFileUpload}
                disabled={!transcript}
                variant="default"
                size="sm"
                className="cursor-pointer text-xs sm:text-sm"
              >
                Upload
              </Button>
            </div>

            {/* Divider */}
            {classesInputList.length > 0 && (
              <>
                <div className="hidden sm:block h-8 sm:h-12 w-px bg-muted" />

                {needsRecommendationRefresh ? (
                  <div className="relative flex flex-col mt-2 sm:mt-0">
                    <Tooltip
                      title="You added new classes. Click to refresh."
                      arrow
                      placement="top"
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
              </>
            )}
          </div>
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

        {/* Section Tabs - Desktop */}
        <div
          ref={coursesSectionRef}
          className="relative hidden md:flex space-x-4 sm:space-x-6 border-b border-border mb-4 sm:mb-6"
        >
          {["All", "Core", "Capstone", "DC", "Electives"].map((section) => (
            <button
              className={`relative px-2 sm:px-4 py-2 font-medium transition-colors cursor-pointer text-sm ${
                selectedSection === section
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setSelectedSection(section)}
            >
              {section}
              {selectedSection === section && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Section Tabs - Mobile */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <MobileNavSelector />
          <div className="px-2 py-1 bg-muted/30 rounded-md text-sm">
            Section: <span className="font-medium">{selectedSection}</span>
          </div>
        </div>

        {/* Courses Grid */}
        {courseData && (
          <div className="space-y-4 sm:space-y-6">
            {selectedSection === "All" && renderCourses(allAvailableCourses)}
            {selectedSection === "Core" &&
              renderCourses(
                courseData.requirements.core.flatMap((g) => g.class)
              )}
            {selectedSection === "Capstone" &&
              renderCourses(
                courseData.requirements.capstone.flatMap((g) => g.class)
              )}
            {selectedSection === "DC" &&
              renderCourses(courseData.requirements.dc.flatMap((g) => g.class))}
            {selectedSection === "Electives" &&
              Object.values(courseData.electives.categories).map((cat, idx) => (
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {cat.name}
                  </h3>
                  {renderCourses(cat.courses.flatMap((g) => g.class))}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};
