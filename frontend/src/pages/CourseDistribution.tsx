import React, { useState, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  styled,
  Fade,
  Skeleton,
} from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import "chart.js/auto";
import { ChartOptions } from "chart.js";

interface CourseDistributionProps {
  courseCode: string;
  professorName?: string;
  isOpen: boolean;
  onClose: (e: React.MouseEvent) => void;
}

interface GradeDistribution {
  [key: string]: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

interface APIResponse {
  [key: string]: number;
}

const BORDER_RADIUS = "12px";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  position: "relative",
  width: "100%",
  maxWidth: "56rem",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
  overflow: "hidden",
  boxShadow: theme.shadows[24],
  [theme.breakpoints.down("sm")]: {
    maxHeight: "100vh",
    height: "100%",
    margin: 0,
  },
}));

const StatsBar = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const StatItem = styled(Box)({
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
});

const FilterContainer = styled(Paper)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  padding: theme.spacing(2),
  height: 450,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down("sm")]: {
    height: 350,
  },
}));

const StyledFormControl = styled(FormControl)({
  minWidth: 200,
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: BORDER_RADIUS,
  padding: theme.spacing(1, 2),
  height: "40px",
  minWidth: "auto",
  whiteSpace: "nowrap",
  textTransform: "none",
  fontWeight: "bold",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,

  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  },
}));

const LoadingSkeleton = () => {
  return (
    <Box>
      <FilterContainer>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={200}
              height={40}
              sx={{ borderRadius: BORDER_RADIUS }}
            />
          ))}
          <Skeleton
            variant="rounded"
            width={120}
            height={40}
            sx={{ borderRadius: BORDER_RADIUS }}
          />
        </Stack>
      </FilterContainer>
      <ChartContainer>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ borderRadius: BORDER_RADIUS }}
        />
      </ChartContainer>
    </Box>
  );
};

const API_ROUTE = "https://api.slugtistics.com/api/";

const fetchGradeDistribution = async (
  courseCode: string,
  instructor: string,
  term: string
): Promise<APIResponse> => {
  const response = await fetch(
    `${API_ROUTE}grade-distribution/${courseCode}?instructor=${instructor}&term=${term}`
  );
  return response.json();
};

const fetchInstructors = async (courseCode: string): Promise<string[]> => {
  const response = await fetch(`${API_ROUTE}instructors/${courseCode}`);
  return response.json();
};

const fetchQuarters = async (courseCode: string): Promise<string[]> => {
  const response = await fetch(`${API_ROUTE}quarters/${courseCode}`);
  return response.json();
};

const calculateGPA = (gradeDistribution: GradeDistribution): string => {
  const gpaMap: { [key: string]: number } = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  };

  let totalPoints = 0;
  let totalStudents = 0;

  Object.entries(gradeDistribution).forEach(([grade, count]) => {
    if (grade in gpaMap) {
      totalPoints += gpaMap[grade] * count;
      totalStudents += count;
    }
  });

  return totalStudents > 0 ? (totalPoints / totalStudents).toFixed(2) : "N/A";
};

export const CourseDistribution: React.FC<CourseDistributionProps> = ({
  courseCode,
  professorName = "All",
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [term, setTerm] = useState<string>("All");
  const [showPercentage, setShowPercentage] = useState<boolean>(false);
  const [selectedInstructor, setSelectedInstructor] = useState<string>(professorName);

  const { data: instructors = [], isLoading: isInstructorsLoading } = useQuery({
    queryKey: ["instructors", courseCode],
    queryFn: () => fetchInstructors(courseCode),
    enabled: isOpen,
  });

  const instructor = useMemo(() => {
    if (!instructors?.length) return "All";
    return instructors.includes(selectedInstructor) ? selectedInstructor : "All";
  }, [instructors, selectedInstructor]);

  const { data: distribution, isLoading: isDistributionLoading } = useQuery({
    queryKey: ["gradeDistribution", courseCode, instructor, term],
    queryFn: () => fetchGradeDistribution(courseCode, instructor, term),
    enabled: isOpen,
  });

  const { data: quarters = [], isLoading: isQuartersLoading } = useQuery({
    queryKey: ["quarters", courseCode],
    queryFn: () => fetchQuarters(courseCode),
    enabled: isOpen,
  });

  const grades = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "F",
  ];

  const totalStudents = distribution
    ? Object.values(distribution).reduce((acc, val) => acc + val, 0)
    : 0;

  const chartData = useMemo((): ChartData => {
    return {
      labels: grades,
      datasets: [
        {
          label: "Students",
          data: grades.map((grade) => {
            const count = distribution?.[grade] || 0;
            return showPercentage
              ? Number(((count / totalStudents) * 100).toFixed(1))
              : count;
          }),
          backgroundColor: theme.palette.primary.main,
        },
      ],
    };
  }, [
    distribution,
    showPercentage,
    grades,
    theme.palette.primary.main,
    totalStudents,
  ]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (typeof value === "number") {
              return showPercentage ? `${value}%` : value;
            }
            return value;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const isLoading =
    isInstructorsLoading || isDistributionLoading || isQuartersLoading;

  return (
    <StyledModal open={isOpen} onClose={onClose} closeAfterTransition={false}>
      <ModalContent>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {courseCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {instructor === "All" ? "All Instructors" : instructor}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Fade in={!isLoading} timeout={300}>
          <StatsBar>
            <StatItem>
              <Typography variant="h6" fontWeight="bold">
                {isLoading ? <Skeleton width={40} /> : totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                students
              </Typography>
            </StatItem>
            <StatItem>
              <Typography variant="h6" fontWeight="bold">
                {isLoading ? (
                  <Skeleton width={40} />
                ) : distribution ? (
                  calculateGPA(distribution)
                ) : (
                  "N/A"
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GPA
              </Typography>
            </StatItem>
            <StatItem>
              <Typography variant="h6" fontWeight="bold">
                {isLoading ? <Skeleton width={40} /> : instructors.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                instructors
              </Typography>
            </StatItem>
          </StatsBar>
        </Fade>

        <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <Fade in={!isLoading} timeout={300}>
              <Box>
                <FilterContainer>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="center"
                  >
                    <StyledFormControl size="small">
                      <InputLabel>Instructor</InputLabel>
                      <Select
                        value={instructor}
                        label="Instructor"
                        onChange={(e: SelectChangeEvent<string>) => 
                          setSelectedInstructor(e.target.value)
                        }
                      >
                        <MenuItem value="All">All Instructors</MenuItem>
                        {instructors.map((inst) => (
                          <MenuItem key={inst} value={inst}>
                            {inst}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>

                    <StyledFormControl size="small">
                      <InputLabel>Term</InputLabel>
                      <Select
                        value={term}
                        label="Term"
                        onChange={(e: SelectChangeEvent<string>) =>
                          setTerm(e.target.value)
                        }
                      >
                        <MenuItem value="All">All Terms</MenuItem>
                        {quarters.map((quarter) => (
                          <MenuItem key={quarter} value={quarter}>
                            {quarter}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>

                    <StyledButton
                      variant="contained"
                      onClick={() => setShowPercentage((prev) => !prev)}
                    >
                      Show {showPercentage ? "Count" : "Percentage"}
                    </StyledButton>
                  </Stack>
                </FilterContainer>

                <ChartContainer>
                  <Bar data={chartData} options={chartOptions} />
                </ChartContainer>
              </Box>
            </Fade>
          )}
        </Box>
      </ModalContent>
    </StyledModal>
  );
};