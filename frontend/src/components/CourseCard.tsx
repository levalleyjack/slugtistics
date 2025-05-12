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
  getLetterGrade,
  StyledChip,
} from "../Constants";

import {
  Chip,
  CourseCodeChip,
  DifficultyChip,
  GECategoryChip,
  GradeChip,
  RatingChip,
  ReviewCountChip,
} from "@/components/ui/chip";
import StatusIcon from "./StatusIcon";
import React from "react";
import { Bookmark, BookmarkCheck, Ellipsis, Heart } from "lucide-react";

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
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
          <RatingChip
            rating={!isStaffOrLoading ? rmpData?.avg_rating : undefined}
            compact
          />
          <DifficultyChip
            difficulty={
              !isStaffOrLoading ? rmpData?.difficulty_level : undefined
            }
            compact
          />
          {isSmallScreen && rmpData?.num_ratings != undefined && (
            <ReviewCountChip
              count={rmpData.num_ratings}
              onClick={handleRatingsOpen}
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
                  <CourseCodeChip courseCode={course_code} />
                  {avgGPA !== null && !isNaN(Number(avgGPA)) ? (
                    <Tooltip title={`${avgGPA}`} disableInteractive>
                      <GradeChip
                        grade={Number(avgGPA)}
                        letterGrade={getLetterGrade(avgGPA)}
                        onClick={handleDistributionOpen}
                      />
                    </Tooltip>
                  ) : (
                    <GradeChip
                      grade={undefined}
                      letterGrade={getLetterGrade(avgGPA)}
                      onClick={handleDistributionOpen}
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
                        count={rmpData.num_ratings}
                        onClick={handleRatingsOpen}
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
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (handleAddToFavorites) {
                          handleAddToFavorites(course);
                        }
                      }}
                      size="small"
                      sx={{
                        transition: "background-color 0.15s ease-in-out",
                        p: 0.5,
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Heart
                        className="h-4 w-5 text-slate-400"
                        fill={
                          isFavorited ? "rgba(239, 68, 68, 0.5)" : "transparent"
                        }
                      />
                    </IconButton>
                  )}

                  <IconButton
                    onClick={handleMenuClick}
                    size="small"
                    sx={{
                      p: 0.5,
                      borderRadius: "8px",
                      transition: "background-color 0.15s ease-in-out",

                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Ellipsis className="h-4 w-5 text-slate-400" />
                  </IconButton>
                </Box>

                {course.ge && (
                  <GECategoryChip
                    category={course.ge}
                    interactive={!!setSelectedGE}
                    onClick={() => {
                      if (setSelectedGE) setSelectedGE(course.ge);
                    }}
                  />
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
  transition:
    "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out, background-color 0.15s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    "& .MuiChip-clickable": {
      transform: "translateY(-1px)",
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
