import { forwardRef, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CancelIcon from "@mui/icons-material/Cancel";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import Grid from "@mui/material/Grid";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {
  ContentCopy as ContentCopyIcon,
  Person as PersonIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  categories,
  COLORS,
  CourseCardProps,
  CourseCode,
  CourseCodeChip,
  DifficultyChip,
  getLetterGrade,
  GradeChip,
  RatingChip,
  ReviewCountChip,
  StyledChip,
} from "../Constants";
import StatusIcon from "./StatusIcon";
import React from "react";

export const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      course,
      isSmallScreen,
      expanded,
      ratingsOpen,
      distributionOpen,
      courseDetailsOpen,
      isFavorited = false,

      onExpandChange,
      setSelectedGE,
      onDistributionOpen,
      onRatingsOpen,
      onCourseDetailsOpen,
      handleAddToFavorites,
      hideCompareButton = true,
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const {
      instructor: fullInstructorName,
      gpa: avgGPA,
      instructor_ratings: rmpData,
    } = course;
    const course_code = `${course.subject} ${course.catalog_num}`;
    const currentIcon = categories.find(
      (category) => category.id === course.ge
    )?.icon;

    const handleRatingsOpen = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onExpandChange) {
        onExpandChange(course.id);
      }
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
      if (onExpandChange) {
        onExpandChange(course.id);
      }
      onDistributionOpen(course_code, fullInstructorName);
    };
    const handleCourseDetailsOpen = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onExpandChange) {
        onExpandChange(course.id);
      }

      onCourseDetailsOpen(course);
    };
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

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
        elevation={0}
        ref={ref}
        onClick={handleCourseDetailsOpen}
        sx={{
          border: `1px solid ${
            expanded ? theme.palette.divider : "transparent"
          }`,
          cursor: "pointer",
        }}
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
                  {avgGPA !== null && !Number.isNaN(avgGPA) ? (
                    <Tooltip title={`${avgGPA}`}>
                      <GradeChip
                        grade={Number(avgGPA)}
                        label={`${getLetterGrade(avgGPA)}`}
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
                        <CancelIcon
                          sx={{ fontSize: 16, color: COLORS.WHITE }}
                        />
                      }
                      label="No GPA"
                      size="small"
                      sx={{
                        height: "28px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    />
                  )}
                  <StatusIcon status={course.class_status} />
                </Box>
              </Box>

              <Typography variant="h6" noWrap>
                {course?.name}
              </Typography>

              <Grid sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 18 }} />

                <Grid
                  container
                  spacing={1}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: "32px",
                  }}
                >
                  <Grid item>
                    {fullInstructorName !== "Staff" ? (
                      <Typography variant="body2" noWrap color="text.secondary">
                        {fullInstructorName}
                      </Typography>
                    ) : (
                      <Typography variant="body2">{"Staff"}</Typography>
                    )}
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
              </Grid>

              <RenderRMPContent />
            </CourseInfo>

            <ActionContainer>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: "130px",
                }}
              >
                <Box sx={{ display: "flex" }}>
                  {!hideCompareButton && (
                    <Tooltip title="Favorite Course">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          if (handleAddToFavorites) {
                            handleAddToFavorites(course);
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
                        {isFavorited ? (
                          <BookmarkIcon fontSize="small" />
                        ) : (
                          <BookmarkBorderIcon
                            fontSize="small"
                            color="disabled"
                          />
                        )}
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
                </Box>

                {course.ge && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      backgroundColor: theme.palette.background.default,
                      padding: "3px 8px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: setSelectedGE ? "pointer" : "default",
                      "&:hover": setSelectedGE
                        ? {
                            backgroundColor: theme.palette.action.hover,
                          }
                        : {},
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setSelectedGE) {
                        setSelectedGE(course.ge);
                      }
                    }}
                  >
                    {currentIcon &&
                      React.cloneElement(currentIcon, {
                        style: { fontSize: "14px", marginRight: "4px" },
                      })}
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "text.secondary",
                      }}
                    >
                      {categories.find((category) => category.id === course.ge)
                        ?.id || ""}
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {course.class_count}
                </Typography>
              </Box>
            </ActionContainer>
          </HeaderContent>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  borderRadius: "4px",
                  minWidth: 200,
                  color: "gray",
                },
              },
            }}
          >
            <MenuItem onClick={handleCopyClick}>
              <ListItemIcon>
                {copied ? (
                  <AssignmentTurnedInIcon fontSize="small" color="success" />
                ) : (
                  <ContentCopyIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>{copied ? "Copied!" : "Copy Enr. #"}</ListItemText>
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
              <ListItemText>Overview</ListItemText>
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
              <ListItemText>Grades</ListItemText>
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
              <ListItemText>Reviews</ListItemText>
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
              <ListItemText>Course Page</ListItemText>
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
              <ListItemText>UCSC Cart</ListItemText>
            </MenuItem>
          </Menu>
        </CardContent>
      </StyledCard>
    );
  }
);

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "8px",
  boxSizing: "border-box",

  position: "relative",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
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
