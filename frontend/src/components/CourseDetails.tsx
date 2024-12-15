import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  styled,
  Fade,
  Skeleton,
  Chip,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  IconButton as MuiIconButton,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  ContentCopy as ContentCopyIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Class as ClassIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Course } from "../Constants";

interface CourseDetailsProps {
  course: Course;
  onClose?: () => void;
}

interface DiscussionSection {
  class_count: number;
  class_status: string;
  code: string;
  enroll_num: number;
  instructor: string;
  location: string;
  schedule: string;
  wait_count: string;
}

interface CourseApiResponse {
  data?: {
    id: number;
    description: string;
    class_notes: string;
    enrollment_reqs: string;
    discussion_sections: DiscussionSection[];
  };
  success: boolean;
  error?: string;
  message?: string;
}

const ContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
}));

const InfoSection = styled(Paper)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  transition: "box-shadow 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: "bold",
  padding: theme.spacing(0.5, 1),
  "& .MuiChip-label": {
    padding: theme.spacing(0.5, 1),
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& svg": {
    color: theme.palette.primary.main,
  },
}));
const DiscussionRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& + &": {
    marginTop: theme.spacing(2),
  },
}));

const ChipsContainer = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  "& > *": {
    margin: "0 !important", // Override default Stack spacing
  },
}));

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
}> = ({ label, value }) => {
  if (!value) return null;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
};

const CopyButton: React.FC<{ copyString: string; tooltip?: string }> = ({
  copyString,
  tooltip = "Copy to clipboard",
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyString);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Tooltip title={copied ? "Copied!" : tooltip}>
      <MuiIconButton
        size="small"
        onClick={handleCopy}
        sx={{
          ml: 1,
          color: copied ? "success.main" : "inherit",
          transition: "color 0.2s ease",
          borderRadius: "8px",
        }}
      >
        {copied ? (
          <CheckCircleOutlineIcon fontSize="small" />
        ) : (
          <ContentCopyIcon fontSize="small" />
        )}
      </MuiIconButton>
    </Tooltip>
  );
};

export const CourseDetailsPanel: React.FC<CourseDetailsProps> = ({
  course,
  onClose,
}) => {
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courseDetails", course?.enroll_num],
    queryFn: async () => {
      if (!course?.enroll_num) {
        throw new Error("Invalid course enrollment number");
      }

      const response = await fetch(
        `https://api.slugtistics.com/api/pyback/course_details/${course.enroll_num}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch course details (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch course details");
      }

      return data as CourseApiResponse;
    },
    enabled: !!course?.enroll_num,
    retry: false,
  });

  if (!course) {
    return (
      <ContentContainer>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" variant="filled">
            No course data provided
          </Alert>
        </Box>
      </ContentContainer>
    );
  }

  const LoadingSkeleton = () => (
    <Stack spacing={3}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={120}
          sx={{
            borderRadius: "12px",
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
    </Stack>
  );

  const getValidChips = () => {
    const chips = [];
    if (course.credits) chips.push({ label: `${course.credits} Credits` });
    if (course.career) chips.push({ label: course.career });
    if (course.ge) chips.push({ label: `GE: ${course.ge}` });
    if (course.class_status) chips.push({ label: course.class_status });
    return chips;
  };

  return (
    <ContentContainer>
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "background.paper",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {course.subject} {course.catalog_num}
            <CopyButton
              copyString={String(course.enroll_num)}
              tooltip="Copy course code"
            />
          </Typography>
          {course.name && (
            <Typography variant="subtitle1" color="text.secondary">
              {course.name}
            </Typography>
          )}
          <ChipsContainer>
            {getValidChips().map((chip, index) => (
              <StatsChip key={index} label={chip.label} size="medium" />
            ))}
          </ChipsContainer>
        </Box>
        {onClose && (
          <IconButton
            onClick={onClose}
            size="medium"
            sx={{
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
            {error instanceof Error
              ? error.message
              : "Failed to load course details"}
          </Alert>
        ) : (
          <Fade in={!isLoading} timeout={400}>
            <Stack spacing={3}>
              {response?.data?.enrollment_reqs && (
                <InfoSection>
                  <SectionHeader>
                    <AssignmentIcon />
                    Prerequisites & Requirements
                  </SectionHeader>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {response.data.enrollment_reqs}
                  </Typography>
                </InfoSection>
              )}

              {response?.data?.description && (
                <InfoSection>
                  <SectionHeader>
                    <DescriptionIcon />
                    Description
                  </SectionHeader>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {response.data.description}
                  </Typography>
                </InfoSection>
              )}

              <InfoSection>
                <SectionHeader>
                  <InfoIcon />
                  Course Information
                </SectionHeader>
                <Stack spacing={2} divider={<Divider flexItem />}>
                  <DetailItem label="Instructor" value={course.instructor} />
                  <DetailItem label="Schedule" value={course.schedule} />
                  <DetailItem label="Location" value={course.location} />
                  <DetailItem label="Class Type" value={course.class_type} />
                  {course.gpa && (
                    <DetailItem
                      label="Average GPA"
                      value={course.gpa.toFixed(2)}
                    />
                  )}

                  <DetailItem
                    label="Enrolled Students"
                    value={course.class_count}
                  />

                 
                    <DetailItem
                      label="Grading Type"
                      value={course.grading}
                    />
                
                </Stack>
              </InfoSection>

              {response?.data?.class_notes && (
                <InfoSection>
                  <SectionHeader>
                    <SchoolIcon />
                    Class Notes
                  </SectionHeader>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {response.data.class_notes}
                  </Typography>
                </InfoSection>
              )}

              {response?.data?.discussion_sections &&
                response.data.discussion_sections.length > 0 && (
                  <InfoSection>
                    <SectionHeader>
                      <ClassIcon />
                      Discussion Sections
                    </SectionHeader>
                    <Stack spacing={2}>
                      {response.data.discussion_sections.map(
                        (section, index) => (
                          <DiscussionRow key={index}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="primary"
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                Section {section.code}
                                <CopyButton
                                  copyString={section.enroll_num.toString()}
                                  tooltip="Copy enrollment number"
                                />
                              </Typography>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    maxWidth: "40%",
                                    textAlign: "right",
                                  }}
                                >
                                  {section.instructor}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 0.5 }}
                                >
                                  {section.schedule}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {section.location}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {section.class_count}
                                </Typography>
                                {section.wait_count && (
                                  <Typography
                                    variant="caption"
                                    color="warning.main"
                                  >
                                    ({section.wait_count} waitlisted)
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </DiscussionRow>
                        )
                      )}
                    </Stack>
                  </InfoSection>
                )}
            </Stack>
          </Fade>
        )}
      </Box>
    </ContentContainer>
  );
};
