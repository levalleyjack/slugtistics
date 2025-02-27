import { forwardRef, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Link,
  Box,
  Collapse,
  Tooltip,
  Paper,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CancelIcon from "@mui/icons-material/Cancel";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import Grid from "@mui/material/Grid";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  ContentCopy as ContentCopyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Groups as GroupsIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  School as SchoolIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  COLORS,
  Course,
  CourseCardProps,
  CourseCode,
  CourseCodeChip,
  DifficultyChip,
  DifficultyChipProps,
  GECategoryChip,
  getLetterGrade,
  GradeChip,
  GradeChipProps,
  RatingChip,
  ReviewCountChip,
  StyledChip,
  StyledExpandIcon,
} from "../Constants";
import StatusIcon from "./StatusIcon";
import { useQuery } from "@tanstack/react-query";

export const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      course,
      isSmallScreen,
      expanded,
      onExpandChange,
      setSelectedGE,
      onDistributionOpen,
      onRatingsOpen,
      onCourseDetailsOpen,
      handleAddToComparison,
      hideCompareButton = true,
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const [isDistributionOpen, setIsDistributionOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const {
      instructor: fullInstructorName,
      gpa: avgGPA,
      instructor_ratings: rmpData,
    } = course;
    const course_code = `${course.subject} ${course.catalog_num}`;

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
      enabled: expanded,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const handleExpandClick = (e: React.MouseEvent) => {
      if (
        (e.target === e.currentTarget ||
          e.currentTarget.contains(e.target as Node)) &&
        onExpandChange
      ) {
        onExpandChange(course_code);
      }
    };
    const handleRatingsOpen = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onRatingsOpen(
        rmpData.name ?? course.instructor,
        rmpData?.course_codes.some(
          (code: CourseCode) => code.courseName === course_code.replace(" ", "")
        )
          ? course_code.replace(" ", "")
          : "all",
        rmpData?.course_codes ?? []
      );
    };

    const handleCopyClick = async () => {
      try {
        await navigator.clipboard.writeText(String(course.enroll_num));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy enrollment number:", err);
      }
    };

    const handleDistributionOpen = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDistributionOpen(course_code, fullInstructorName);
    };
    const handleCourseDetailsOpen = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      onCourseDetailsOpen(course);
    };
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleRefreshEnrollment = (e: React.MouseEvent) => {
      e.stopPropagation();
      enrollmentQuery.refetch();
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const searchName =
      fullInstructorName?.split(" ")[0].indexOf(".") === -1
        ? `${fullInstructorName.split(" ")[0]} ${
            fullInstructorName.split(" ")[
              fullInstructorName.split(" ").length - 1
            ]
          }`
        : fullInstructorName?.split(" ").slice(1).join(" ") || "";

    const isStaffOrLoading = fullInstructorName === "Staff";

    const RenderRMPContent = () => {
      if (!rmpData || isStaffOrLoading) {
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
            <RatingChip
              icon={<CancelIcon sx={{ fontSize: 16, color: COLORS.WHITE }} />}
              label="No rating found"
              size="small"
              sx={{
                color: "inherit",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            />
          </Box>
        );
      }

      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
          <RatingChip
            icon={<StarIcon color="inherit" />}
            label={`${rmpData.avg_rating?.toFixed(1) || "N/A"}/5`}
            size="small"
            sx={{
              border: `1px solid ${
                rmpData.avg_rating >= 4
                  ? theme.palette.success.dark
                  : rmpData.avg_rating >= 3
                  ? theme.palette.warning.dark
                  : theme.palette.error.dark
              }`,
              color:
                rmpData.avg_rating >= 4
                  ? theme.palette.success.main
                  : rmpData.avg_rating >= 3
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
              backgroundColor: "white",
            }}
          />
          <DifficultyChip
            label={`${
              rmpData.difficulty_level?.toFixed(1) || "N/A"
            }/5 difficulty`}
            size="small"
            variant="outlined"
            difficulty={rmpData.difficulty_level}
          />
          {isSmallScreen && rmpData?.num_ratings != undefined && (
            <ReviewCountChip
              icon={<RateReviewIcon color="inherit" />}
              label={`${rmpData?.num_ratings} ${
                rmpData?.num_ratings > 1 ? "reviews" : "review"
              }`}
              onClick={handleRatingsOpen}
              size="small"
            />
          )}
        </Box>
      );
    };

    return (
      <StyledCard
        elevation={expanded ? 2 : 1}
        ref={ref}
        onClick={handleExpandClick}
        sx={{ cursor: "pointer" }}
      >
        <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
          <HeaderContent>
            <CourseInfo>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CourseCodeChip
                    label={course_code}
                    size="small"
                    onClick={handleCourseDetailsOpen}
                  />
                  {course.ge && (
                    <GECategoryChip
                      label={course.ge}
                      size="small"
                      {...(setSelectedGE && {
                        onClick: () => setSelectedGE(course.ge),
                      })}
                    />
                  )}
                  <StatusIcon status={course.class_status} />
                </Box>
              </Box>

              <Typography variant="h6">{course?.name}</Typography>

              <Grid sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 18 }} />
                {fullInstructorName !== "Staff" ? (
                  <Grid
                    container
                    spacing={1}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Grid item>
                      <Typography variant="body2" color="text.secondary">
                        {fullInstructorName}
                      </Typography>
                    </Grid>
                    <Grid item>
                      {!isSmallScreen && rmpData?.num_ratings != undefined && (
                        <ReviewCountChip
                          icon={<RateReviewIcon color="inherit" />}
                          label={`${rmpData?.num_ratings} ${
                            rmpData?.num_ratings > 1 ? "reviews" : "review"
                          }`}
                          onClick={handleRatingsOpen}
                          size="small"
                        />
                      )}
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2">{"Staff"}</Typography>
                )}
              </Grid>

              <RenderRMPContent />
            </CourseInfo>

            <ActionContainer>
              {avgGPA !== null && !Number.isNaN(avgGPA) ? (
                <Tooltip
                  title={`${!isSmallScreen ? "Average GPA:" : ""} ${avgGPA}`}
                >
                  <GradeChip
                    grade={Number(avgGPA)}
                    icon={
                      <EqualizerIcon
                        sx={{ fontSize: 16, color: COLORS.WHITE }}
                      />
                    }
                    label={`${!isSmallScreen ? "Average Grade: " : ""}${getLetterGrade(
                      avgGPA
                    )}`}
                    size="small"
                    sx={{
                      height: "28px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                    onClick={handleDistributionOpen}
                  />
                </Tooltip>
              ) : (
                <StyledChip
                icon={<CancelIcon sx={{ fontSize: 16, color: COLORS.WHITE }} />}
                label="No GPA"
                size="small"
                sx={{
                  height: "28px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              />
              )}
              {!hideCompareButton && (
                <Tooltip title="Compare Courses">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (handleAddToComparison) {
                        handleAddToComparison(course);
                      }
                    }}
                    size="small"
                    sx={{
                      p: 0.5,
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <CompareArrowsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <IconButton
                onClick={handleMenuClick}
                size="small"
                sx={{
                  p: 0.5,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: {
                      borderRadius: "8px",
                      minWidth: 200,
                      marginTop: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleCopyClick}>
                  <ListItemIcon>
                    {copied ? (
                      <AssignmentTurnedInIcon
                        fontSize="small"
                        color="success"
                      />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>
                    {copied ? "Copied!" : "Copy Enrollment Number"}
                  </ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    handleCourseDetailsOpen(e);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <InfoOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText>Additional Course Information</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={(e) => {
                    handleDistributionOpen(e);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <EqualizerIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Course Distribution</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    handleRatingsOpen(e);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <RateReviewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>See Teacher Reviews</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(course.link, "_blank");
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <OpenInNewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Open Course Page</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      "https://my.ucsc.edu/psp/csprd/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?PORTALPARAM_PTCNAV=HC_SSR_SSENRL_CART_GBL&EOPP.SCNode=SA&EOPP.SCPortal=EMPLOYEE&EOPP.SCName=UCSC_MOBILE_ENROLL&EOPP.SCLabel=&EOPP.SCPTcname=PT_PTPP_SCFNAV_BASEPAGE_SCR&FolderPath=PORTAL_ROOT_OBJECT.PORTAL_BASE_DATA.CO_NAVIGATION_COLLECTIONS.UCSC_MOBILE_ENROLL.ADMN_S201704121458063536484878&IsFolder=false%22&PortalKeyStruct=yes",
                      "_blank"
                    );
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <OpenInNewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Go to UCSC Cart</ListItemText>
                </MenuItem>
              </Menu>
              {onExpandChange && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandClick(e);
                  }}
                  size="small"
                  sx={{ p: 0.5, borderRadius: "8px" }}
                >
                  <StyledExpandIcon expanded={expanded} fontSize="small" />
                </IconButton>
              )}
            </ActionContainer>
          </HeaderContent>
        </CardContent>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0, pb: "0px !important" }}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mt: 1,
                borderRadius: "8px",
                background: COLORS.GRAY_50,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{course.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{course.schedule}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CategoryIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" noWrap>
                      {course.class_type}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupsIcon sx={{ fontSize: 18 }} />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">
                        {enrollmentQuery.data?.enrollment ||
                          `${course.class_count}...`}
                        {!isSmallScreen && " enrolled"}
                      </Typography>
                      {course.class_status === "Wait List" &&
                        enrollmentQuery.data?.waitlist !== null &&
                        enrollmentQuery.data?.waitlist !== undefined &&
                        enrollmentQuery.data.waitlist > 0 && (
                          <Typography variant="body2" color="warning.main">
                            ({enrollmentQuery.data?.waitlist}
                            {!isSmallScreen && " waitlisted"})
                          </Typography>
                        )}
                    </Stack>
                    <IconButton
                      size="small"
                      onClick={handleRefreshEnrollment}
                      sx={{
                        p: 0.5,
                        animation: enrollmentQuery.isFetching
                          ? "spin 1s linear infinite"
                          : "none",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 18 }} color="primary" />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CreditCardIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{`${course.credits} units`}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ display: "flex", alignItems: "center" }}
                      color={course.has_enrollment_reqs ? "warning" : "success"}
                    >
                      {course.has_enrollment_reqs ? (
                        <>
                          <WarningAmberIcon
                            color="warning"
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          Has Prerequisites
                        </>
                      ) : (
                        <>
                          <CheckCircleOutlineIcon
                            color="success"
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          No Prerequisites
                        </>
                      )}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </CardContent>
        </Collapse>
      </StyledCard>
    );
  }
);

const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  position: "relative",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  paddingBottom: theme.spacing(2),
  "&:hover": {
    "& .MuiChip-clickable": {
      transform: "translateY(-1px)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
  },
  ".MuiCardActionArea-focusHighlight": {
    background: "transparent",
  },
}));

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
