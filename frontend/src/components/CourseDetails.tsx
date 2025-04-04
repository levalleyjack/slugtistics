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
  Tooltip,
  IconButton as MuiIconButton,
  useTheme,
  Grid,
  useMediaQuery,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  ContentCopy as ContentCopyIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Class as ClassIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  GradeRounded as GradeIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  ClassStatusEnum,
  COLORS,
  Course,
  CourseApiResponse,
  CourseDetailsProps,
  getLetterGrade,
  getStatusColor,
  GradientChipProps,
  GradientType,
} from "../Constants";
import StatusIcon from "./StatusIcon";
import LocationMap from "./LocationComponent";
import PrerequisitesSection from "./PrereqComponent";
import { local } from "../pages/GetGEData";
import RefreshIcon from "@mui/icons-material/Refresh";

const ContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
  backgroundColor: COLORS.WHITE,
  maxWidth: "100%",
}));

const InfoSection = styled("div")(({ theme }) => ({
  borderRadius: "12px",

  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  transition: "box-shadow 0.2s ease",
}));

const gradientStyles = {
  primary: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
  secondary: "linear-gradient(45deg, #9c27b0 30%, #d23ddf 90%)",
  info: "linear-gradient(45deg, #00bcd4 30%, #00e5ff 90%)",
  success: "linear-gradient(45deg, #4caf50 30%, #6fbf73 90%)",
  error: "linear-gradient(45deg, #f44336 30%, #ff7961 90%)",
  warning: "linear-gradient(45deg, #ff9800 30%, #ffc947 90%)",
} as const;
const StyledChip = styled(Chip)<{ gradienttype: GradientType }>(
  ({ gradienttype }) => ({
    background: gradientStyles[gradienttype],
    color: "white",
    borderRadius: "8px",
  })
);
const GradientChip: React.FC<GradientChipProps> = ({ gradienttype, label }) => (
  <StyledChip label={label} gradienttype={gradienttype} size="medium" />
);

const StatsChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  height: "24px",
  fontSize: "0.75rem",
  "& .MuiChip-label": {
    padding: "0 8px",
  },
  [theme.breakpoints.up("sm")]: {
    height: "28px",
    fontSize: "0.8125rem",
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& svg": {
    fontSize: "1.25rem",
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.up("sm")]: {
    fontSize: "1.125rem",
    marginBottom: theme.spacing(2),
    "& svg": {
      fontSize: "1.5rem",
    },
  },
}));

const DiscussionRow = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: "12px",
  backgroundColor: theme.palette.background.default,
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& + &": {
    marginTop: theme.spacing(1.5),
  },
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2),
    "& + &": {
      marginTop: theme.spacing(2),
    },
  },
}));

const EnrollmentStats = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: "8px",
  backgroundColor: COLORS.GRAY_50,
  fontSize: "0.875rem",
  width: "fit-content",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1.5),
    fontSize: "1rem",
  },
}));

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  if (!value) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box sx={{ color: "primary.main" }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          gutterBottom
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};
const isValidLocation = (location: string): boolean => {
  if (!location) return false;
  const invalidLocations = ["Online", "N/A", "Remote Instruction", "TBD"];
  return !invalidLocations.includes(location) && !location.includes("TBD");
};

const CopyButton: React.FC<{ copyString: string; tooltip?: string }> = ({
  copyString,
  tooltip = "Copy to clipboard",
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? "Copied!" : tooltip}>
      <MuiIconButton
        size="small"
        onClick={handleCopy}
        sx={{
          p: 1,
          borderRadius: "8px",
          color: copied ? "success.main" : "info",
        }}
      >
        {copied ? (
          <AssignmentTurnedInIcon fontSize="small" />
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
  maxWidth = "100%",
}) => {
  const enrollmentQuery = useQuery({
    queryKey: [
      "enrollment",
      course.subject,
      course.catalog_num,
      course.instructor,
      course.enroll_num,
    ],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/2252?subject=${course.subject}&catalog_nbr=${course.catalog_num}`
        );
        const data = await response.json();

        if (!data.classes?.length)
          return { enrollment: course.class_count, waitlist: null };

        const matchingClass = data.classes.find((classInfo: any) => {
          return String(classInfo.class_nbr) === String(course.enroll_num);
        });

        if (matchingClass) {
          return {
            enrollment: `${matchingClass.enrl_total}/${matchingClass.enrl_capacity}`,
            waitlist: parseInt(matchingClass.waitlist_total),
          };
        }

        return { enrollment: course.class_count, waitlist: null };
      } catch (error) {
        console.error(`Error fetching enrollment:`, error);
        return { enrollment: course.class_count, waitlist: null };
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const handleRefreshEnrollment = (e: React.MouseEvent) => {
    e.stopPropagation();
    enrollmentQuery.refetch();
  };

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

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
        `${local}/course_details/${course.enroll_num}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch course details (${response.status})`);
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
        <Alert severity="error" sx={{ m: 2 }}>
          No course data provided
        </Alert>
      </ContentContainer>
    );
  }
  const getValidChips = () => {
    const chips: { label: string; gradienttype: GradientType }[] = [];

    if (course.credits) {
      chips.push({
        label: `${course.credits} Credits`,
        gradienttype: "primary",
      });
    }
    if (course.ge) {
      chips.push({ label: course.ge, gradienttype: "secondary" });
    }
    if (course.career) {
      chips.push({ label: course.career, gradienttype: "info" });
    }
    if (course.class_status) {
      chips.push({
        label: course.class_status,
        gradienttype: course.class_status.toLowerCase().includes("open")
          ? "success"
          : course.class_status.toLowerCase().includes("wait list")
          ? "warning"
          : "error",
      });
    }
    return chips;
  };

  return (
    <ContentContainer sx={{ maxWidth }}>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderLeft: 1,

          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                wordBreak: "break-word",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {course.subject} {course.catalog_num}
              <CopyButton
                copyString={String(course.enroll_num)}
                tooltip="Copy Enrollment Number"
              />
            </Typography>
            {course.name && (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  wordBreak: "break-word",
                }}
              >
                {course.name}
              </Typography>
            )}
          </Box>
          {onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ borderRadius: "8px" }}
            >
              <ArrowForwardIcon />
            </IconButton>
          )}
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
          {getValidChips().map((chip, index) => (
            <GradientChip
              key={index}
              label={chip.label}
              gradienttype={chip.gradienttype}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          flexGrow: 1,
          overflow: "auto",
          "& > *:last-child": {
            mb: 0,
          },
        }}
      >
        {isLoading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={120}
                sx={{ borderRadius: "12px" }}
              />
            ))}
          </Stack>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error
              ? error.message
              : "Failed to load course details"}
          </Alert>
        ) : (
          <Fade in={!isLoading}>
            <Stack spacing={3}>
              {response?.data?.enrollment_reqs.description && (
                <InfoSection>
                  <SectionHeader>
                    <AssignmentIcon />
                    Prerequisites & Requirements
                  </SectionHeader>
                  <PrerequisitesSection
                    enrollmentReqs={response.data.enrollment_reqs.description}
                    coursesReq={response.data.enrollment_reqs.courses}
                  />
                </InfoSection>
              )}

              {response?.data?.description && (
                <InfoSection>
                  <SectionHeader>
                    <DescriptionIcon />
                    Description
                  </SectionHeader>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {response.data.description}
                  </Typography>
                </InfoSection>
              )}
              {response?.data?.class_notes && (
                <InfoSection>
                  <SectionHeader>
                    <SchoolIcon />
                    Class Notes
                  </SectionHeader>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {response.data.class_notes}
                  </Typography>
                </InfoSection>
              )}

              <InfoSection>
                <SectionHeader>
                  <InfoIcon />
                  Course Information
                </SectionHeader>
                <Stack spacing={3} divider={<Divider flexItem />}>
                  <DetailItem
                    label="Instructor"
                    value={course.instructor}
                    icon={<PersonIcon />}
                  />
                  <Box
                    sx={{
                      p: 0,
                      m: 0,
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 1,
                        boxSizing: "border-box",
                      }}
                    >
                      <DetailItem
                        label="Enrolled Students"
                        value={
                          enrollmentQuery.isLoading
                            ? course.class_count
                            : enrollmentQuery.data?.enrollment
                        }
                        icon={<PeopleIcon />}
                      />
                      <Tooltip title="Refresh Enrollment">
                        <IconButton
                          size="small"
                          onClick={handleRefreshEnrollment}
                          sx={{
                            color: "primary.main",
                            animation: enrollmentQuery.isLoading
                              ? "spin 1s linear infinite"
                              : "none",
                          }}
                        >
                          <RefreshIcon
                            sx={{
                              fontSize: "1rem",
                              "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                              },
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {!enrollmentQuery.isLoading &&
                      enrollmentQuery.data?.waitlist !== null && (
                        <DetailItem
                          label="Waitlist"
                          value={enrollmentQuery?.data?.waitlist}
                          icon={
                            <StatusIcon status={ClassStatusEnum.WAITLIST} />
                          }
                        />
                      )}
                    <Divider />
                  </Box>
                  <DetailItem
                    label="Meeting Times"
                    value={course.schedule}
                    icon={<ScheduleIcon />}
                  />

                  <Box>
                    <DetailItem
                      label="Location"
                      value={course.location.split(":")[1]?.trim()}
                      icon={<LocationIcon />}
                    />
                    {isValidLocation(course.location.split(":")[1]?.trim()) && (
                      <Box sx={{ mt: 2 }}>
                        <LocationMap
                          location={course.location.split(":")[1]?.trim()}
                        />
                      </Box>
                    )}
                  </Box>
                  <DetailItem
                    label="Class Type"
                    value={course.class_type}
                    icon={<ClassIcon />}
                  />

                  <DetailItem
                    label="Grading Type"
                    value={course.grading}
                    icon={<SchoolIcon />}
                  />
                </Stack>
              </InfoSection>

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
                          <DiscussionRow key={index} elevation={2}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: { xs: 1, sm: 2 },
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    color="primary"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      fontSize: { xs: "1rem", sm: "1.25rem" },
                                    }}
                                  >
                                    {section.code}
                                  </Typography>
                                  <CopyButton
                                    copyString={section.enroll_num.toString()}
                                    tooltip="Copy Enrollment Number"
                                  />
                                </Box>
                                <Chip
                                  icon={
                                    <StatusIcon status={section.class_status} />
                                  }
                                  label={section.class_status}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: getStatusColor(section.class_status),
                                    fontWeight: 500,
                                    "& .MuiChip-icon": {
                                      marginLeft: "8px",
                                    },
                                    backgroundColor: "transparent",
                                    border: "none",
                                    height: 24,
                                    marginLeft: "auto",
                                  }}
                                />
                              </Box>
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={1.5}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1.5,
                                      alignItems: "center",
                                    }}
                                  >
                                    <PersonIcon color="primary" />
                                    <Typography variant="body1">
                                      {section.instructor}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1.5,
                                      alignItems: "center",
                                    }}
                                  >
                                    <ScheduleIcon color="primary" />
                                    <Typography variant="body1">
                                      {section.schedule}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1.5,
                                      alignItems: "center",
                                    }}
                                  >
                                    <LocationIcon color="primary" />
                                    <Typography variant="body1">
                                      {section.location}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5,
                                    height: "100%",
                                    justifyContent: "center",
                                  }}
                                >
                                  <EnrollmentStats>
                                    <PeopleIcon color="primary" />
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {section.class_count} enrolled
                                    </Typography>
                                  </EnrollmentStats>

                                  {section.wait_count &&
                                    parseInt(section.wait_count) > 0 && (
                                      <EnrollmentStats
                                        sx={{
                                          backgroundColor:
                                            theme.palette.warning.light + "20",
                                          color: theme.palette.warning.dark,
                                        }}
                                      >
                                        <WarningIcon color="warning" />
                                        <Typography
                                          variant="body1"
                                          sx={{ fontWeight: 500 }}
                                        >
                                          {section.wait_count} waitlisted
                                        </Typography>
                                      </EnrollmentStats>
                                    )}
                                </Box>
                              </Grid>
                            </Grid>
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
