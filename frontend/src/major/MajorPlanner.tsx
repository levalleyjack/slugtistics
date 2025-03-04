import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    selectedMajor:string;
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

const MajorPlanner = ({ selectedMajor, onBack }: MajorPlannerProps) => {
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(
    new Set()
  );
  const [selectedSection, setSelectedSection] = useState<
    "Core" | "Capstone" | "DC" | "Electives"
  >("Core");

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

  const renderCourseSection = (
    title: string, 
    courseGroups: Array<{ class: string[] }> = []
  ) => {
    const allCourses = courseGroups.flatMap(group => group.class);
    
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
                <Grid item xs={12} sm={6} md={3} key={`${course}-${groupIndex}`}>
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
        {Object.entries(courseData.electives.categories).map(([key, category]) => (
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
        ))}
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
        <Typography variant="h6" gutterBottom>
          Overall Progress
        </Typography>
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
      </ProgressPaper>
      
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={1}>
          {[
            { label: "Core", value: "Core" },
            { label: "Capstone", value: "Capstone" },
            { label: "DC", value: "DC" },
            { label: "Electives", value: "Electives" },
          ].map((section) => (
            <Grid item key={section.value}>
              <StyledChip
                label={section.label}
                onClick={() => setSelectedSection(section.value as any)}
                color={selectedSection === section.value ? "primary" : "default"}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {courseData && (
        <>
          {selectedSection === "Core" && 
            renderCourseSection("Core Courses", courseData.requirements.core)}
          {selectedSection === "Capstone" && 
            renderCourseSection("Capstone Courses", courseData.requirements.capstone)}
          {selectedSection === "DC" && 
            renderCourseSection("Disciplinary Communication", courseData.requirements.dc)}
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