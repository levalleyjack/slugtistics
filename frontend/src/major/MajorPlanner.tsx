import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Chip,
  styled,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

interface MajorPlannerProps {
  selectedMajor: string;
  onBack: () => void;
}

interface CourseData {
  program: {
    name: string;
    admissionYear: string;
  };
  requirements: {
    core: Array<{ class: string[] }>;
    capstone: Array<{ class: string[] }>;
    dc: Array<{ class: string[] }>;
  };
  electives: {
    required: {
      math: number;
      upperDivision: number;
    };
    categories: {
      [key: string]: {
        name: string;
        courses: Array<{ class: string[] }>;
      };
    };
  };
}

interface RecommendationsResponse {
  equiv_classes: string[];
  recommended_classes: string[];
  success: boolean;
}

const MajorPlanner = ({ selectedMajor, onBack }: MajorPlannerProps) => {
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(
    new Set()
  );
  const [selectedSection, setSelectedSection] = useState<
    "Core" | "Capstone" | "DC" | "Electives" | "All"
  >("Core");
  const [classesInput, setClassesInput] = useState<string>("");
  const [recommendedCourses, setRecommendedCourses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [classesToRecommend, setClassesToRecommend] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);

  // Get the course data
  const { data: courseData, isLoading } = useQuery<CourseData>({
    queryKey: ["course-requirements"],
    queryFn: async () => {
      const response = await fetch(
        `http://127.0.0.1:5000/major_courses/${selectedMajor}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch course requirements");
      }
      return response.json();
    },
  });

  // Calls get recommendations, usequery to constantly update
  const {
    data: recommendationsData,
    isLoading: isLoadingRecommendations,
    refetch: refetchRecommendations,
    error,
  } = useQuery<RecommendationsResponse, Error>({
    queryKey: ["recommendations", classesToRecommend],
    queryFn: () => getRecommendations(classesToRecommend),
    enabled: classesToRecommend.length > 0,
  });

  // Use useEffect to handle recommendationsData changes
  useEffect(() => {
    if (recommendationsData) {
      // Update the completed courses with equiv_classes
      if (recommendationsData.equiv_classes && recommendationsData.equiv_classes.length > 0) {
        setCompletedCourses(new Set(recommendationsData.equiv_classes));
      }
      
      // Update recommended courses
      if (recommendationsData.recommended_classes && recommendationsData.recommended_classes.length > 0 &&
        (recommendedCourses.length === 0 || JSON.stringify(recommendationsData.recommended_classes) !== JSON.stringify(recommendedCourses))) {
        setRecommendedCourses(recommendationsData.recommended_classes);
      }
    }
  }, [recommendationsData]); // Only run when recommendationsData changes

  if (error) {
    console.error("Error fetching recommendations:", error);
  }

  // Fetch recommendations with GET Reuqest
  const getRecommendations = async (
    classes: string[]
  ): Promise<RecommendationsResponse> => {
    const classesParam = classes.join(",");
    const response = await fetch(
      `http://127.0.0.1:5000/major_recommendations?classes=${encodeURIComponent(
        classesParam
      )}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }
    const data = await response.json();

    console.log(data);
    return data;
    
  };

  // Process the classes input and get recommendations
  const processClassesInput = () => {
    const classes = classesInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0); // Add this filter to prevent empty inputs
      
    if (classes.length > 0) { // Only set if there are actual classes
      setClassesToRecommend(classes);
      refetchRecommendations();
    }
  };

  // Update the completed courses set
  const toggleCourseCompletion = (course: string) => {
    setCompletedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(course)) {
        newSet.delete(course);
      } else {
        newSet.add(course);
      }
      return newSet;
    });
  };
  // List of all classes 
  
  const renderCourseSection = (
    title: string,
    courseGroups: Array<{ class: string[] }> = []
  ) => {
    const allCourses = courseGroups.flatMap((group) => group.class);

    return (
      <Box sx={{ mb: 4 }}>
        <SectionTitle variant="h5" gutterBottom>
          {title}
          <CourseCount>
            {completedCourses.size}/{allCourses.length} Completed
          </CourseCount>
        </SectionTitle>
        <Grid container spacing={2}>
          {courseGroups.map((group, groupIndex) =>
            group.class.map((course) => {
              const isCompleted = completedCourses.has(course);
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  key={`${course}-${groupIndex}`}
                >
                  <CourseCard
                    elevation={2}
                    completed={isCompleted}
                    onClick={() => toggleCourseCompletion(course)}
                  >
                    <CourseCardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {course}
                        </Typography>
                        <Tooltip
                          title={
                            isCompleted
                              ? "Mark as Incomplete"
                              : "Mark as Complete"
                          }
                        >
                          <IconButton
                            size="small"
                            color={isCompleted ? "success" : "default"}
                          >
                            {isCompleted ? <CheckCircleIcon /> : <AddIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CourseCardContent>
                  </CourseCard>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>
    );
  };

  const renderElectivesSection = () => {
    if (!courseData?.electives) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <SectionTitle variant="h5" gutterBottom>
          Electives
          <CourseCount>
            Requirements:
            {courseData.electives.required.math} Math,
            {courseData.electives.required.upperDivision} Upper Division
          </CourseCount>
        </SectionTitle>
        {Object.entries(courseData.electives.categories).map(
          ([key, category]) => (
            <Box key={key} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {category.name}
              </Typography>
              <Grid container spacing={2}>
                {category.courses.map((courseGroup) =>
                  courseGroup.class.map((course) => {
                    const isCompleted = completedCourses.has(course);
                    return (
                      <Grid item xs={12} sm={6} md={3} key={course}>
                        <CourseCard
                          elevation={2}
                          completed={isCompleted}
                          onClick={() => toggleCourseCompletion(course)}
                        >
                          <CourseCardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="h6" component="div">
                                {course}
                              </Typography>
                              <Tooltip
                                title={
                                  isCompleted
                                    ? "Mark as Incomplete"
                                    : "Mark as Complete"
                                }
                              >
                                <IconButton
                                  size="small"
                                  color={isCompleted ? "success" : "default"}
                                >
                                  {isCompleted ? (
                                    <CheckCircleIcon />
                                  ) : (
                                    <AddIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CourseCardContent>
                        </CourseCard>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            </Box>
          )
        )}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <IconButton onClick={onBack} sx={{ p: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {courseData?.program?.name || "Major"} Requirements
        </Typography>
      </Box>

      <ProgressPaper elevation={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Overall Progress
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "500px",
              gap: 1,
            }}
          >
            <textarea
              style={{
                padding: "8px",
                fontSize: "16px",
                width: "100%",
                height: "100px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
              placeholder="Enter classes taken... e.g. (CSE 30, CSE 16, Math 19A, CSE 120...)"
              value={classesInput}
              onChange={(e) => setClassesInput(e.target.value)}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="Mark these classes as completed and get recommendations">
                <IconButton
                  onClick={processClassesInput}
                  color="primary"
                  disabled={isLoadingRecommendations}
                  sx={{
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    px: 2,
                  }}
                >
                  {isLoadingRecommendations ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="button">Processing...</Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="button" sx={{ mr: 1 }}>
                        Submit & Get Recommendations
                      </Typography>
                      <CheckCircleIcon />
                    </>
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <ProgressChip
            label={`${completedCourses.size} Completed`}
            icon={<CheckCircleIcon />}
          />
          <ProgressChip
            label={`${
              (courseData?.requirements?.core?.length || 0) +
              (courseData?.requirements?.capstone?.length || 0) +
              (courseData?.requirements?.dc?.length || 0) -
              completedCourses.size
            } Remaining`}
            color="primary"
          />
        </Box>

        {isLoadingRecommendations && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Getting recommendations...</Typography>
          </Box>
        )}

        {recommendedCourses.length > 0 && !isLoadingRecommendations && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <SchoolIcon sx={{ mr: 1 }} />
              Recommended Next Courses
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {recommendedCourses.map((course) => (
                <Chip
                  key={course}
                  label={course}
                  color="secondary"
                  sx={{ fontWeight: 500 }}
                  onClick={() => toggleCourseCompletion(course)}
                />
              ))}
            </Box>
          </Box>
        )}
      </ProgressPaper>

      <Box sx={{ padding: 2 }}>
        <Grid container spacing={1}>
          {[
            { label: "All", value: "All" },
            { label: "Core", value: "Core" },
            { label: "Capstone", value: "Capstone" },
            { label: "DC", value: "DC" },
            { label: "Electives", value: "Electives" },
          ].map((section) => (
            <Grid item key={section.value}>
              <StyledChip
                label={section.label}
                onClick={() => setSelectedSection(section.value as any)}
                color={
                  selectedSection === section.value ? "primary" : "default"
                }
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {courseData && (
        <>
          {selectedSection === "All" && (renderCourseSection("All Courses", 
            [...courseData.requirements.core, ...courseData.requirements.capstone, ...courseData.requirements.dc]))}
          {selectedSection === "Core" && renderCourseSection("Core Courses", courseData.requirements.core)}
          {selectedSection === "Capstone" && renderCourseSection("Capstone Courses", courseData.requirements.capstone)}
          {selectedSection === "DC" && renderCourseSection("Disciplinary Communication", courseData.requirements.dc)}
          {selectedSection === "Electives" && renderElectivesSection()}
        </>
      )}
    </Container>
  );
};

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

const CourseCount = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const ProgressPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
}));

const ProgressChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1),
  height: "36px",
  fontWeight: 600,
  "& .MuiChip-icon": {
    fontSize: "1.2rem",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  minWidth: "fit-content",
  margin: theme.spacing(0.5),
}));

interface CourseCardProps {
  completed?: boolean;
}

const CourseCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "completed",
})<CourseCardProps>(({ theme, completed }) => ({
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  background: completed
    ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`
    : theme.palette.background.paper,
  color: completed ? theme.palette.common.white : theme.palette.text.primary,
  border: `1px solid ${
    completed ? theme.palette.success.main : theme.palette.divider
  }`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const CourseCardContent = styled(CardContent)({
  "&:last-child": {
    paddingBottom: 16,
  },
});

export default MajorPlanner;
