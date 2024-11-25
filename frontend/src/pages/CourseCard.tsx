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
} from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CancelIcon from "@mui/icons-material/Cancel";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import Grid from "@mui/material/Grid";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  ContentCopy as ContentCopyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Groups as GroupsIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  RadioButtonChecked,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  COLORS,
  Course,
  DifficultyChipProps,
  getLetterGrade,
  GradeChipProps,
  StyledExpandIcon,
} from "../Colors";
import { RatingsModal } from "./RatingsModal";
import StatusIcon from "./StatusIcon";

interface CourseCardProps {
  course: Course;
  isSmallScreen: boolean;
  expanded: boolean;
  onExpandChange: (courseCode: string) => void;
  setSelectedGE: (courseCode: string) => void;
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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const {
      instructor: fullInstructorName,
      gpa: avgGPA,
      instructor_ratings: rmpData,
    } = course;
    const course_code = `${course.subject} ${course.catalog_num}`;

    const handleExpandClick = () => onExpandChange(course_code);
    const handleOpenModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsModalOpen(true);
    };

    const handleCopyClick = async () => {
      try {
        await navigator.clipboard.writeText(course.enroll_num);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        handleMenuClose();
      } catch (err) {
        console.error("Failed to copy enrollment number:", err);
      }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
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
                fontWeight: "bold",
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
              border:
                `1px solid ${rmpData.avg_rating >= 4
                  ? theme.palette.success.dark
                  : rmpData.avg_rating >= 3
                  ? theme.palette.warning.dark
                  : theme.palette.error.dark}`,
              color:
                rmpData.avg_rating >= 4
                  ? theme.palette.success.main
                  : rmpData.avg_rating >= 3
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
              backgroundColor: "white",
              fontWeight: "bold",
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
              disableRipple
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
      <StyledCard elevation={expanded ? 4 : 2} ref={ref}>
        <RatingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          professorName={rmpData?.name || fullInstructorName}
          ratings={rmpData?.all_ratings}
          currentClass={course_code.replace(" ", "")}
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
                      disableRipple
                      label={course_code}
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Link>
                  {course.ge && (
                    <GECategoryChip
                      label={course.ge}
                      size="small"
                      disableRipple
                      onClick={() => setSelectedGE(course.ge)}
                    />
                  )}
                  <StatusIcon status={course.class_status} />
                </Box>
              </Box>

              <Box
                onClick={handleExpandClick}
                sx={{
                  cursor: "pointer",
                  flex: 1,
                  "&:hover": {
                    opacity: 0.8,
                  },
                  mb: 1,
                }}
              >
                <Typography variant="h6" noWrap>
                  {course.name}
                </Typography>
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
                          disableRipple
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
              </Box>

              <>
                <RenderRMPContent />
              </>
            </CourseInfo>

            <ActionContainer>
              {avgGPA !== "N/A" ? (
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
                      fontWeight: 600,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                      },
                    }}
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
                    fontWeight: 600,
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
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 200,
                    mt: 1,
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
                  <ListItemText>Open Shopping Cart</ListItemText>
                </MenuItem>
              </Menu>

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

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0, pb: "8px !important" }}>
            <Paper variant="outlined" sx={{ p: 1.5, mt: 1 }}>
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
                    <Tooltip title="Updated every 5 minutes">
                      <RadioButtonChecked sx={{ fontSize: 18 }} color="error" />
                    </Tooltip>
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
  }
);

//styles

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

const GradeChip = styled(Chip)<GradeChipProps>(({ theme, grade }) => {
  const getGradient = (gpa: number) => {
    if (gpa >= 3.7) {
      return `linear-gradient(135deg, 
        ${theme.palette.success.light} 0%, 
        ${theme.palette.success.main} 50%,
        ${theme.palette.success.dark} 100%)`;
    }
    if (gpa >= 3.3) {
      return `linear-gradient(135deg, 
        ${theme.palette.success.light} 0%, 
        ${theme.palette.warning.light} 100%)`;
    }
    if (gpa >= 3.0) {
      return `linear-gradient(135deg, 
        ${theme.palette.warning.light} 0%, 
        ${theme.palette.warning.main} 50%,
        ${theme.palette.warning.dark} 100%)`;
    }
    if (gpa >= 2.7) {
      return `linear-gradient(135deg, 
        ${theme.palette.warning.main} 0%, 
        ${theme.palette.error.light} 100%)`;
    }
    return `linear-gradient(135deg, 
      ${theme.palette.error.light} 0%, 
      ${theme.palette.error.main} 50%,
      ${theme.palette.error.dark} 100%)`;
  };

  return {
    background: getGradient(grade),
    color: theme.palette.common.white,
    fontWeight: 500,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    },
    "& .MuiChip-icon": {
      color: "inherit",
    },
    "& .MuiChip-label": {
      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
  };
});
const GECategoryChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  background: `linear-gradient(135deg, 
    ${theme.palette.secondary.dark} 0%, 
    ${theme.palette.secondary.light} 100%)`,
  border: `1px solid ${theme.palette.secondary.dark}`,

  color: "white",
  fontWeight: 600,
  letterSpacing: "0.5px",
  padding: "0 4px",
  height: "28px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    background: `linear-gradient(135deg, 
      ${theme.palette.secondary.light} 0%, 
      ${theme.palette.secondary.light} 100%)`,
  },
}));
const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  "&.MuiChip-outlined": {
    background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    borderColor: theme.palette.grey[300],
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
      borderColor: theme.palette.grey[400],
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
  },
}));

const CourseCodeChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  background: `linear-gradient(135deg,
    ${theme.palette.primary.dark} 0%,
    ${theme.palette.primary.light} 100%)`,
  backdropFilter: "blur(8px)",
  border: `1px solid ${theme.palette.primary.dark}`,
  color: "white",
  fontWeight: 600,
  height: "28px",
  animation: "gradient 3s ease infinite",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    background: `linear-gradient(135deg,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.light} 100%)`,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const DifficultyChip = styled(Chip)<DifficultyChipProps>(
  ({ theme, difficulty }) => ({
    borderRadius: "8px",
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
    background: "white",
    fontWeight: 500,
    height: "24px",

    "&:hover": {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
  })
);
const RatingChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  backgroundSize: "200% 200%",
  color: "white",
  fontWeight: 600,
  height: "28px",
  animation: "gradient 3s ease infinite",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
}));

const ReviewCountChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  background: `linear-gradient(135deg,
    ${theme.palette.primary.light} 0%,
    ${theme.palette.primary.main} 100%)`,
  backdropFilter: "blur(8px)",
  border: `1px solid ${theme.palette.primary.dark}`,
  color: "white",
  fontWeight: 500,
  height: "24px",
  animation: "gradient 3s ease infinite",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    background: `linear-gradient(135deg,
      ${theme.palette.primary.light} 0%,
      ${theme.palette.primary.main} 100%)`,
    color: "white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
