import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Link,
  Chip,
  Box,
  Collapse,
  Tooltip,
  Paper,
  Theme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import CategoryIcon from "@mui/icons-material/Category";
import GradeIcon from "@mui/icons-material/Grade";
import React from "react";
import { Button, Grid } from "@mui/material";
import { COLORS, getLetterGrade } from "../Colors";
import StarIcon from "@mui/icons-material/Star";
import { local } from "./GetGEData";

const route = "https://api.slugtistics.com/api/";

const gpaMap = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "D-": 0.7,
  "F": 0.0,
} as const
const calculateGPA = (grade: keyof typeof gpaMap) => {
  return gpaMap[grade] || 0.0;
};

const calculateAverageGPA = (gradeDistribution: Record<string, number>) =>{
  let totalGPA = 0;
  let totalStudents = 0;

  Object.entries(gradeDistribution).forEach(([grade, count]) => {
    totalGPA += calculateGPA(grade as any) * count;
    totalStudents += count;
  });

  return totalStudents > 0 ? (totalGPA / totalStudents).toFixed(2) : "N/A";
};

const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  transition: "transform 0.2s ease-in-out",
  paddingBottom: theme.spacing(2),
  "&:hover": {
    transform: "translateY(-4px)",
    "& .MuiChip-root": {
      transform: "scale(1.05)",
    },
  },
  ".MuiCardActionArea-focusHighlight": {
    background: "transparent",
  },
}));

const CodeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "grade",
})(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 500,
  fontSize: "0.875rem",
  transition: "transform 0.2s ease-in-out",
}));

const GradeChip = styled(Chip)(({ theme, grade }: {theme?: Theme, grade: string}) => {
  const getGradient = (gpa: number) => {
    if (gpa >= 3.7) return theme?.palette.success.main;
    if (gpa >= 3.0) return theme?.palette.warning.main;
    return theme?.palette.error.main;
  };

  return {
    background: getGradient(Number(grade)),
    color: theme?.palette.common.white,
    fontWeight: 500,
  };
});

const HeaderContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: theme.spacing(2),
}));

const CourseInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const ActionContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
}));
const RatingChip = styled(Chip)(({ theme, rating }: {theme :Theme, rating: number}) => ({
  backgroundColor:
    rating >= 4.0
      ? theme.palette.success.main
      : rating >= 3.0
      ? theme.palette.warning.main
      : theme.palette.error.main,
  color: theme.palette.common.white,
  fontWeight: 500,
}));

const StyledExpandIcon = styled(ExpandMoreIcon, {
  shouldForwardProp: (prop) => prop !== "expanded",
})(({ theme, expanded }: {theme?:Theme, expanded: boolean}) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme?.transitions.create("transform", {
    duration: theme?.transitions.duration.shortest,
  }),
}));

const fetchGradeDistribution = async (code: string) => {
  try {
    const response = await fetch(
      `${route}grade-distribution/${code}?instructor=All&term=All`
    );
    const gradeData = await response.json();
    return calculateAverageGPA(gradeData);
  } catch (error) {
    console.error(`Error fetching GPA for ${code}:`, error);
    return "N/A";
  }
};

const normalizeInstructorName = (name: string) => {
  return name
    .replace(/[**,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getInitials = (name: string) => {
  return name
    .split(/[\s.]/)
    .filter(
      (part) => part.length === 1 || (part.length === 2 && part.endsWith("."))
    )
    .map((initial) => initial.charAt(0).toUpperCase());
};
const useInstructor = (code: string, instructor: string) => {
  return useQuery({
    queryKey: ["instructor", code, instructor],
    queryFn: async () => {
      try {
        if (!instructor || instructor === "Staff") {
          console.log("isStaff");
          return "Staff";
        }
        const response = await fetch(`${route}instructors/${code}`);
        const instructors = await response.json();

        const normalizedInput = normalizeInstructorName(instructor);
        const inputParts = normalizedInput
          .split(" ")
          .filter((part) => part.length > 0);

        const inputLast = inputParts[inputParts.length - 1];

        const inputInitials = getInitials(normalizedInput);

        const matchedInstructor = instructors.find((fullName: string) => {
          const normalizedFullName = normalizeInstructorName(fullName);
          const fullNameParts = normalizedFullName.split(" ");

          const firstNames = fullNameParts.slice(0, -1);
          const lastName = fullNameParts[fullNameParts.length - 1];

          const lastNameMatches =
            lastName.toLowerCase() === inputLast.toLowerCase();
          if (!lastNameMatches) return false;

          if (inputInitials.length > 0) {
            const fullNameInitials = firstNames.map((name) =>
              name.charAt(0).toUpperCase()
            );

            const initialsMatch = inputInitials.every(
              (initial, index) => fullNameInitials[index] === initial
            );

            return initialsMatch;
          }

          return firstNames.some(
            (name) => name.toLowerCase() === inputParts[0].toLowerCase()
          );
        });

        return matchedInstructor || instructor;
      } catch (error) {
        console.error(`Error fetching instructor for ${code}:`, error);
        return instructor;
      }
    },
    enabled: !!code && !!instructor,
  });
};

export const CourseCard = ({
  course,
  isSmallScreen,
  onGPALoaded,
  expanded,
  onExpandChange,
}: {
  course: any,
  isSmallScreen: boolean,
  onGPALoaded: (a: any, b: any) => void,
  expanded: boolean,
  onExpandChange: (a: any) => void,
}) => {
  const [copied, setCopied] = useState(false);
  const [rmpData, setRmpData] = useState<any>();
  const [isLoadingRMP, setIsLoadingRMP] = useState(false);
  const [rmpError, setRmpError] = useState(null);

  const { data: avgGPA, isLoading: isLoadingGPA } = useQuery({
    queryKey: ["gradeDistribution", course.code],
    queryFn: () => fetchGradeDistribution(course.code),
  });

  const { data: fullInstructorName, isLoading: isLoadingInstructor } =
    useInstructor(course.code, course.instructor);

  const handleFetchRMP = async () => {
    if (isLoadingRMP || !fullInstructorName || fullInstructorName === "Staff")
      return;
    const searchName =
      fullInstructorName.split(" ")[0].indexOf(".") !== -1
        ? fullInstructorName.split(" ")[1]
        : fullInstructorName.split(" ")[0] +
          " " +
          fullInstructorName.split(" ")[
            fullInstructorName.split(" ").length - 1
          ];

    setIsLoadingRMP(true);
    setRmpError(null);

    try {
      const response = await fetch(
        `http://${local}/search_professor?school_id=1078&professor_name=${encodeURIComponent(
          searchName
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch professor data: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setRmpData({
        avgRating: data.average_rating,
        numRatings: data.number_of_ratings,
        department: data.department,
        wouldTakeAgainPercent: data.would_take_again,
        difficultyLevel: data.average_difficulty,
        name: `${data.first_name} ${data.last_name}`,
      });
    } catch (error: any) {
      console.error("Error fetching RMP data:", error);
      setRmpError(error.message || "Failed to fetch professor rating");
    } finally {
      setIsLoadingRMP(false);
    }
  };

  React.useEffect(() => {
    if (avgGPA !== undefined) {
      onGPALoaded(course.code, avgGPA);
    }
  }, [avgGPA, course.code, onGPALoaded]);

  const handleExpandClick = () => {
    onExpandChange(course.code);
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(course.enroll_num);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy enrollment number:", err);
    }
  };

  const searchName =
    fullInstructorName?.split(" ")[0].indexOf(".") == -1
      ? fullInstructorName
      : fullInstructorName?.split(" ").slice(1).join(" ") || "";
  const isStaffOrLoading =
    isLoadingInstructor || fullInstructorName === "Staff";

  return (
    <StyledCard elevation={2}>
      <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
        <HeaderContent>
          <CourseInfo>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Link
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "none",
                  },
                }}
              >
                <CodeChip
                  label={course.code}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ zIndex: 2 }}
                />
              </Link>
              <Box
                onClick={handleExpandClick}
                sx={{
                  cursor: "pointer",
                  flex: 1,
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <Typography variant="h6" noWrap>
                  {course.name}
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={handleExpandClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
              {fullInstructorName !== "Staff" ? (
                <Link
                  href={`https://www.ratemyprofessors.com/search/professors/1078?q=${searchName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  variant="body2"
                  noWrap
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                >
                  {fullInstructorName}
                </Link>
              ) : (
                <Typography variant="body2">{"Staff"}</Typography>
              )}
            </Box>

            {!isStaffOrLoading && (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                {!rmpData && !rmpError && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleFetchRMP}
                    disabled={isLoadingRMP}
                    startIcon={<StarIcon />}
                  >
                    {isLoadingRMP ? "Loading..." : "Get Rating"}
                  </Button>
                )}

                {rmpData && (
                  <>
                    <Chip
                      icon={<StarIcon />}
                      label={`Rating: ${
                        rmpData.avgRating?.toFixed(1) || "N/A"
                      }/5`}
                      color={
                        rmpData.avgRating >= 3.5
                          ? "success"
                          : rmpData.avgRating >= 2.5
                          ? "warning"
                          : "error"
                      }
                      size="small"
                    />
                    <Chip
                      label={`${rmpData.numRatings || 0} reviews`}
                      size="small"
                      variant="outlined"
                    />
                  </>
                )}

                {rmpError && (
                  <Chip
                    label={rmpError}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </CourseInfo>

          <ActionContainer>
            {avgGPA !== "N/A" && (
              <Tooltip
                title={`${!isSmallScreen ? "Average GPA:" : ""} ${avgGPA}`}
              >
                <GradeChip
                  grade={avgGPA || ""}
                  icon={
                    <GradeIcon sx={{ fontSize: 16 }} htmlColor={COLORS.WHITE} />
                  }
                  label={`${
                    !isSmallScreen ? "Average Grade:" : ""
                  } ${getLetterGrade(avgGPA)}`}
                  size="small"
                />
              </Tooltip>
            )}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleCopyClick();
              }}
              size="small"
              sx={{
                p: 0.5,
                borderRadius: "8px",
                "& .MuiTouchRipple-root .MuiTouchRipple-child": {
                  borderRadius: "8px",
                },
              }}
            >
              {copied ? (
                <CheckCircleOutlineIcon color="success" fontSize="small" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleExpandClick();
              }}
              size="small"
              sx={{ p: 0.5 }}
            >
              <StyledExpandIcon expanded={expanded} fontSize="small" />
            </IconButton>
          </ActionContainer>
        </HeaderContent>
      </CardContent>

      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        sx={{
          transformOrigin: "top",
        }}
      >
        <CardContent sx={{ pt: 0, pb: "8px !important" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mt: 1,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SchoolIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" noWrap>
                    {course.location}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" noWrap>
                    {course.schedule}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <GroupsIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" noWrap>
                    {course.class_count} enrolled
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CategoryIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" noWrap>
                    {course.class_type}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </CardContent>
      </Collapse>
    </StyledCard>
  );
};
