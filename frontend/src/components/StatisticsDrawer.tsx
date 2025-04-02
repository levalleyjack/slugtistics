import React, { useCallback, useRef } from "react";
import {
  Typography,
  useTheme,
  styled,
  Drawer,
  Box,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Course, StatisticsDrawerProps } from "../Constants";
import { ArrowForward } from "@mui/icons-material";

const StatisticsCard = styled("div")(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: "#F9FAFB",
  borderRadius: "12px",
  marginBottom: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    marginBottom: 0,
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `calc(${theme.spacing(2)} + 2px)`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#FFFFFF",
}));

const CourseStatistic = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  marginBottom: theme.spacing(1),
  "&:last-child": {
    marginBottom: 0,
  },
}));

const StatisticsContent = styled(Box)(({ theme }) => ({
  width: "calc(100% - 32px)",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),

  overflowY: "auto",
}));

const StatisticsDrawer = ({
  isOpen,
  isCategoriesVisible,
  isMediumScreen,
  setIsOpen,
  setIsCategoriesVisible,
  filteredCourses,
  activePanel,
  isDistributionDrawer,
}: StatisticsDrawerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const theme = useTheme();

  const handleClose = () => {
    setIsCategoriesVisible(false);
    setIsOpen(false);
  };

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, [setIsOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!isMediumScreen) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        timeoutRef.current = undefined;
      }, 150);
    }
  }, [isMediumScreen, setIsOpen]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate statistics
  const totalCourses = filteredCourses?.length || 0;
  const coursesWithGpa = filteredCourses?.filter(
    (course) => course?.gpa != null
  );
  const averageGPA =
    filteredCourses?.reduce(
      (sum, course) => sum + (course.gpa ? course.gpa : 0),
      0
    ) / coursesWithGpa?.length;
  const openSections =
    filteredCourses?.filter((course) => course.class_status === "Open")
      .length || 0;

  const departmentCounts = filteredCourses?.reduce((acc, course) => {
    acc[course.subject] = (acc[course.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDepartments = Object.entries(departmentCounts || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const coursesAt4 =
    filteredCourses?.filter((course) => course.gpa === 4).length || 0;
  const coursesOver3 =
    filteredCourses?.filter((course) => course.gpa >= 3 && course.gpa < 4)
      .length || 0;
  const coursesOver2 =
    filteredCourses?.filter((course) => course.gpa >= 2 && course.gpa < 3)
      .length || 0;
  const noGPA =
    filteredCourses?.filter((course) => course.gpa === null).length || 0;

  const isTemporary = !isCategoriesVisible || isMediumScreen;
  const variant = isTemporary ? "temporary" : "persistent";
  const drawerWidth = 300;

  return (
    <Box sx={{ position: "relative" }}>
      {!isMediumScreen && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "8px",
            height: "100dvh",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
            transition: "background-color 200ms",
            display: isMediumScreen ? "none" : "block",
            zIndex: 100,
          }}
          onMouseEnter={handleMouseEnter}
        />
      )}
      <Drawer
        variant={variant}
        anchor="left"
        open={
          (isOpen || isCategoriesVisible) &&
          (!isDistributionDrawer || !activePanel)
        }
        onClose={handleClose}
        SlideProps={{
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            marginTop: "64px",
            height: "calc(100dvh - 64px)",
            boxSizing: "border-box",
            borderTopRightRadius: !isTemporary ? 0 : "8px",
            borderBottomRightRadius: !isTemporary ? 0 : "8px",
            opacity: 0.96,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            WebkitBackdropFilter: "blur(8px)",
            overflow: "hidden",
          },
        }}
      >
        <DrawerHeader>
          <Typography variant="h6" fontWeight="500">
            Course Statistics
          </Typography>
          {isMediumScreen && (
            <IconButton
              edge="end"
              onClick={handleClose}
              size="small"
              sx={{ borderRadius: "8px" }}
            >
              <ArrowForward />
            </IconButton>
          )}
        </DrawerHeader>

        <StatisticsContent>
          <StatisticsCard>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: theme.palette.grey[600] }}
            >
              Quick Overview
            </Typography>
            <CourseStatistic>
              <Typography variant="body2">Total Courses</Typography>
              <Typography variant="body2" fontWeight="medium">
                {totalCourses}
              </Typography>
            </CourseStatistic>
            <CourseStatistic>
              <Typography variant="body2">Average GPA</Typography>
              <Typography variant="body2" fontWeight="medium">
                {averageGPA ? averageGPA.toFixed(2) : "N/A"}
              </Typography>
            </CourseStatistic>
            <CourseStatistic>
              <Typography variant="body2">Open Sections</Typography>
              <Typography variant="body2" fontWeight="medium">
                {openSections}
              </Typography>
            </CourseStatistic>
          </StatisticsCard>

          <StatisticsCard>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: theme.palette.grey[600] }}
            >
              Top Departments
            </Typography>
            {topDepartments.map(([dept, count]) => (
              <CourseStatistic key={dept}>
                <Typography variant="body2">{dept}</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {count}
                </Typography>
              </CourseStatistic>
            ))}
          </StatisticsCard>

          <StatisticsCard>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: theme.palette.grey[600] }}
            >
              GPA Distribution
            </Typography>
            <CourseStatistic>
              <Typography variant="body2">4.0</Typography>
              <Typography variant="body2" fontWeight="medium">
                {coursesAt4}
              </Typography>
            </CourseStatistic>
            <CourseStatistic>
              <Typography variant="body2">3.0 - 3.99</Typography>
              <Typography variant="body2" fontWeight="medium">
                {coursesOver3}
              </Typography>
            </CourseStatistic>
            <CourseStatistic>
              <Typography variant="body2">2.0 - 2.99</Typography>
              <Typography variant="body2" fontWeight="medium">
                {coursesOver2}
              </Typography>
            </CourseStatistic>
            <CourseStatistic>
              <Typography variant="body2">No GPA</Typography>
              <Typography variant="body2" fontWeight="medium">
                {noGPA}
              </Typography>
            </CourseStatistic>
          </StatisticsCard>
        </StatisticsContent>
      </Drawer>
    </Box>
  );
};

export default StatisticsDrawer;
