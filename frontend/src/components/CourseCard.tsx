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
import RateReviewIcon from "@mui/icons-material/RateReview";
import CancelIcon from "@mui/icons-material/Cancel";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import Grid from "@mui/material/Grid";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocationOnIcon from "@mui/icons-material/LocationOn";
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
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  COLORS,
  Course,
  CourseCode,
  DifficultyChipProps,
  getLetterGrade,
  GradeChipProps,
  StyledExpandIcon,
} from "../Constants";
import { RatingsModal } from "./RatingsModal";
import StatusIcon from "./StatusIcon";
import { useQuery } from "@tanstack/react-query";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CourseDistribution } from "../pages/CourseDistribution";

interface CourseCardProps {
  course: Course;
  isSmallScreen: boolean;
  expanded: boolean;
  onExpandChange: (courseCode: string) => void;
  setSelectedGE?: (category: string) => void;
}

export const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      course,
      isSmallScreen,
      expanded,
      onExpandChange,
      setSelectedGE,
    }: CourseCardProps,
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
      ],
      queryFn: async () => {
        try {
          const response = await fetch(
            `https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/2250?subject=${course.subject}&catalog_nbr=${course.catalog_num}`
          );
          const data = await response.json();

          if (!data.classes?.length)
            return { enrollment: course.class_count, waitlist: null };

          const matchingClass = data.classes.find((classInfo: any) => {
            const apiInstructor = classInfo.instructors[0]?.name || "Staff";

            if (course.instructor === "Staff" && apiInstructor === "Staff") {
              return true;
            }
            console;
            if (apiInstructor.includes(",")) {
              const [apiLastName] = apiInstructor.split(",");
              const courseLastName = course.instructor.split(" ").pop() || "";
              const courseMiddleName = course.instructor.split(" ")[1] || "";

              const isMatch =
                apiLastName.toLowerCase() === courseLastName.toLowerCase() ||
                courseMiddleName.toLowerCase() ===
                  apiLastName.toLowerCase().split(" ")[0];

              return isMatch;
            }

            return false;
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
        e.target === e.currentTarget ||
        e.currentTarget.contains(e.target as Node)
      ) {
        onExpandChange(course_code);
      }
    };
    const handleOpenModal = (e: React.MouseEvent) => {
      e.preventDefault();

      e.stopPropagation();
      setIsModalOpen(true);
    };
    const handleModalClose = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(false);
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
    const handleDistributionOpen = (e: React.MouseEvent) => {
      e.stopPropagation();

      setIsDistributionOpen(true);
    };
    const handleDistributionClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDistributionOpen(false);
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
              icon={<StarIcon color="inherit" />}
              label="No rating found"
              size="small"
              sx={{
                backgroundColor: theme.palette.grey.A700,
                color: "white",
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
              onClick={handleOpenModal}
              size="small"
            />
          )}
        </Box>
      );
    };

    return (
      <StyledCard
        elevation={expanded ? 4 : 2}
        ref={ref}
        onClick={handleExpandClick}
        sx={{ cursor: "pointer" }}
      >
        <RatingsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          professorName={rmpData.name}
          currentClass={
            rmpData.course_codes.some(
              (code: CourseCode) =>
                code.courseName === course_code.replace(" ", "")
            )
              ? course_code.replace(" ", "")
              : "all"
          }
          courseCodes={rmpData.course_codes}
        />
        <CourseDistribution
          courseCode={course_code}
          professorName={
            course.instructor.indexOf(".") == -1 && !isStaffOrLoading
              ? course.instructor
              : "All"
          }
          isOpen={isDistributionOpen}
          onClose={handleDistributionClose}
        />
        <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
          <HeaderContent>
            <CourseInfo>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    <CourseCodeChip
                      label={course_code}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Link>
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

              <Typography variant="h6">{course.name}</Typography>

              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
                {fullInstructorName !== "Staff" ? (
                  <Grid
                    container
                    spacing={1}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Grid item>
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
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {fullInstructorName}
                      </Link>
                    </Grid>
                    <Grid item>
                      {!isSmallScreen && rmpData?.num_ratings != undefined && (
                        <ReviewCountChip
                          icon={<RateReviewIcon color="inherit" />}
                          label={`${rmpData?.num_ratings} ${
                            rmpData?.num_ratings > 1 ? "reviews" : "review"
                          }`}
                          onClick={handleOpenModal}
                          size="small"
                        />
                      )}
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2">{"Staff"}</Typography>
                )}
              </Grid>

              <>
                <RenderRMPContent />
              </>
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
                    label={`${
                      !isSmallScreen ? "Average Grade:" : ""
                    } ${getLetterGrade(avgGPA)}`}
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
                  icon={
                    <CancelIcon sx={{ fontSize: 16, color: COLORS.WHITE }} />
                  }
                  label={isSmallScreen ? "No GPA" : "No GPA information"}
                  size="small"
                  sx={{
                    height: "28px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                />
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
                      <CheckCircleOutlineIcon
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
                    e.stopPropagation();
                    handleDistributionOpen(e);
                  }}
                >
                  <ListItemIcon>
                    <EqualizerIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Course Distribution</ListItemText>
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
                    <ShoppingCartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Add to UCSC Cart</ListItemText>
                </MenuItem>
              </Menu>

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
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{course.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{course.schedule}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
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
                    <Tooltip title="Refresh enrollment data">
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
                    </Tooltip>
                  </Stack>
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
  }
);

//styles
const BaseChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  height: "28px",
  fontWeight: "bold",

  "&.MuiChip-clickable": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    "&:hover": {
      transform: "translateY(-2px)",
      filter: "brightness(110%)",
      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
    },
    "&:active": {
      transform: "translateY(0)",
      filter: "brightness(95%)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    },
  },
}));

const CourseCodeChip = styled(BaseChip)(({ theme }) => ({
  background: `linear-gradient(135deg,
    ${theme.palette.primary.dark} 0%,
    ${theme.palette.primary.light} 100%)`,
  color: "white",
  fontSize: "0.875rem",
  letterSpacing: "0.03em",
  height: "32px",
  "& .MuiChip-label": {
    padding: "0 12px",
    textTransform: "uppercase",
    lineHeight: 1.2,
  },
  "&.MuiChip-clickable:hover": {
    background: `linear-gradient(135deg,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.main} 100%)`,
  },
}));

const GECategoryChip = styled(BaseChip)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.secondary.dark} 0%, 
    ${theme.palette.secondary.light} 100%)`,
  fontWeight: "lighter",
  color: "white",
  letterSpacing: "0.5px",
  padding: "0 4px",
  "&.MuiChip-clickable:hover": {
    background: `linear-gradient(135deg, 
      ${theme.palette.secondary.light} 0%, 
      ${theme.palette.secondary.main} 100%)`,
  },
}));

const GradeChip = styled(BaseChip)<GradeChipProps>(({ theme, grade }) => {
  const getGradient = (gpa: number) => {
    if (gpa >= 3.7)
      return `linear-gradient(135deg, 
      ${theme.palette.success.light} 0%, 
      ${theme.palette.success.main} 50%,
      ${theme.palette.success.dark} 100%)`;
    if (gpa >= 3.3)
      return `linear-gradient(135deg, 
      ${theme.palette.success.light} 0%, 
      ${theme.palette.warning.light} 100%)`;
    if (gpa >= 3.0)
      return `linear-gradient(135deg, 
      ${theme.palette.warning.light} 0%, 
      ${theme.palette.warning.main} 50%,
      ${theme.palette.warning.dark} 100%)`;
    if (gpa >= 2.7)
      return `linear-gradient(135deg, 
      ${theme.palette.warning.main} 0%, 
      ${theme.palette.error.light} 100%)`;
    return `linear-gradient(135deg, 
      ${theme.palette.error.light} 0%, 
      ${theme.palette.error.main} 50%,
      ${theme.palette.error.dark} 100%)`;
  };

  return {
    background: getGradient(grade),

    color: theme.palette.common.white,
    "& .MuiChip-icon": {
      color: "inherit",
    },
  };
});

const DifficultyChip = styled(BaseChip)<DifficultyChipProps>(
  ({ theme, difficulty }) => ({
    background: "white",
    height: "26px",
    fontWeight: "bolder",

    borderWidth: 1,
    borderStyle: "solid",
    borderColor:
      difficulty >= 4
        ? theme.palette.error.dark
        : difficulty >= 3
        ? theme.palette.warning.dark
        : theme.palette.success.dark,
    color:
      difficulty >= 4
        ? theme.palette.error.main
        : difficulty >= 3
        ? theme.palette.warning.main
        : theme.palette.success.main,
    "&.MuiChip-clickable:hover": {
      background: theme.palette.grey[50],
    },
  })
);

const RatingChip = styled(BaseChip)(({ theme }) => ({
  backgroundSize: "200% 200%",
  height: "26px",
  color: "white",
}));
const ReviewCountChip = styled(BaseChip)(({ theme }) => ({
  height: "24px",
  fontWeight: "lighter",
  background: `linear-gradient(90deg,
    ${theme.palette.primary.main} 0%,
    ${theme.palette.secondary.light} 100%)`,
  color: "white",
  "&.MuiChip-clickable:hover": {
    background: `linear-gradient(135deg,
      ${theme.palette.secondary.light} 0%,
      ${theme.palette.primary.light} 100%)`,
    color: "white",
  },
}));

const StyledChip = styled(BaseChip)(({ theme }) => ({
  "&.MuiChip-outlined": {
    background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    borderColor: theme.palette.grey[300],
    "&.MuiChip-clickable:hover": {
      background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
      borderColor: theme.palette.grey[400],
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  position: "relative",
  transition: "transform 0.2s ease-in-out",
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
