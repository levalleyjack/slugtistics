import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, UploadCloud, Plus, X } from "lucide-react";
import { local } from "../pages/GetGEData";
import { Notification } from "@/components/Notification";
import { motion } from "framer-motion";

const pulseClass =
  "transition-transform hover:scale-[1.02] active:scale-[0.98]";

interface MajorPlannerProps {
    selectedMajor:string;
  onBack: () => void;
}
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02, // each child will animate after 80ms
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
      const response = await fetch(
        `${local}/major_recommendations?classes=${encodeURIComponent(
          classesToRecommend.join(",")
        )}&major=${encodeURIComponent(selectedMajor)}`
      );
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

  const processClassesInput = () => {
    if (classesInputList.length) {
      setClassesToRecommend(classesInputList);
      refetchRecommendations();
    }
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
        { method: "PUT", body: formData }
      );
      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      if (Array.isArray(data.courses)) {
        setClassesInputList(data.courses);
        triggerNotification("success", "Transcript uploaded successfully");
        setClassesToRecommend(data.courses);
        refetchRecommendations();
      }
    } catch (err) {
      triggerNotification("error", "Failed to upload transcript");
    }
  };

  const toggleCourseCompletion = (course: string) => {
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.has(course) ? newSet.delete(course) : newSet.add(course);
      return newSet;
    });
  };

  const removeClass = (course: string) => {
    setClassesInputList((prev) => prev.filter((c) => c !== course));
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      newSet.delete(course.toUpperCase());
      return newSet;
    });
  };

  const addNewClass = () => {
    const cleanInput = newClassInput.trim().toUpperCase(); // <-- UPPERCASE fix
    if (cleanInput && !classesInputList.includes(cleanInput)) {
      setClassesInputList((prev) => [...prev, cleanInput]);
      const matchedCourse = allAvailableCourses.find(
        (c) => c.toLowerCase() === cleanInput.toLowerCase()
      );
      if (matchedCourse) {
        setCompletedCourses((prev) => new Set(prev).add(matchedCourse));
      }
      setNewClassInput("");
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="flex flex-col max-w-7xl mx-auto px-6 py-4">
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
          <h1 className="text-3xl font-bold">
            {courseData?.program.name} Requirements
          </h1>
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
          className={`relative w-full min-h-[400px] flex flex-col items-center border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out p-6 ${
            classesInputList.length === 0 ? "justify-center" : "items-start"
          } ${isDragging ? "border-primary bg-muted/30" : "border-muted"}`}
        >
          {classesInputList.length === 0 && !transcript ? (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mt-4">No classes yet</h2>
              <p className="text-muted-foreground mt-2 mb-6">
                Upload your transcript or manually add classes to get started!
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-muted rounded-md cursor-pointer hover:bg-muted-foreground/10 transition-colors">
                <UploadCloud className="h-5 w-5 mr-2" />
                {transcript ? transcript.name : "Choose File"}
                <input
                  type="file"
                  accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setTranscript(e.target.files[0])
                  }
                />
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                or drag and drop your file here
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 w-full">
              {classesInputList.map((course) => (
                <Badge
                  key={course}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => removeClass(course)}
                >
                  {course}
                  <X className="h-4 w-4" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Always show upload/add controls */}
        <div className="space-y-4 mb-6 mt-6">
          {/* Added Classes */}

          {/* Add Class Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a new class"
              value={newClassInput}
              onChange={(e) => setNewClassInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewClass()}
            />
            <Button onClick={addNewClass}>Add</Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* File Upload Actions */}
            <div className="flex gap-2 items-center">
              <label className="inline-flex items-center px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted-foreground/10 transition-colors">
                <UploadCloud className="h-4 w-4 mr-2" />
                {transcript ? transcript.name : "Choose File"}
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
                className="cursor-pointer"
              >
                Upload
              </Button>
            </div>

            {/* Divider */}

            {/* Get Recommendations */}
            {classesInputList.length > 0 && (
              <>
                <div className="h-12 w-px bg-muted" />

                <Button
                  onClick={processClassesInput}
                  disabled={isLoadingRecommendations}
                  variant="secondary"
                  className="cursor-pointer"
                >
                  {isLoadingRecommendations
                    ? "Processing..."
                    : "Get Recommendations"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Recommended Courses</h2>
            <div className="flex flex-wrap gap-2">
              {recommendedCourses.map((course) => (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleCourseCompletion(course)}
                >
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="relative flex space-x-6 border-b border-border mb-6">
          {["All", "Core", "Capstone", "DC", "Electives"].map((section) => (
            <button
              className={`relative px-4 py-2 font-medium transition-colors cursor-pointer ${
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

        {/* Courses Grid */}
        {courseData && (
          <div className="space-y-6">
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
              Object.values(courseData.electives.categories).map((cat) => (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
                  {renderCourses(cat.courses.flatMap((g) => g.class))}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};
