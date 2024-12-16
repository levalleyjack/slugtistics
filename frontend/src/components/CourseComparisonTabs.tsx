import React from "react";
import {
  Tabs,
  Tab,
  Box,
  IconButton,
  Paper,
  styled,
  Collapse,
  Typography,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { CourseCard } from "../components/CourseCard";
import { Course, StyledExpandIcon } from "../Constants";
import { useSessionStorage } from "../pages/GetGEData";

interface CourseComparisonProps {
  courses: Course[];
  onRemoveCourse: (index: number) => void;
  onClearAll: () => void;
  onDistributionOpen: (courseCode: string, professorName: string) => void;
  onRatingsOpen: (professorName: string, courseCode: string, courseCodes: any[]) => void;
  onCourseDetailsOpen: (course: Course) => void;
}

const Container = styled(Paper)({
  width: "100%",
  height: "fit-content",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
  width: "100%",
}));

const TabsContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: "flex",
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  width: "100%",
  minHeight: 48,
  '& .MuiTabs-indicator': {
    height: 3,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiTabs-flexContainer': {
    height: "100%",
    gap: theme.spacing(0.5)
  },
  '& .MuiTabs-scrollButtons': {
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  padding: theme.spacing(1.5, 2),
  borderRadius:"8px",
  textTransform: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  transition: theme.transitions.create(['color', 'background-color'], {
    duration: 200,
  }),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '15',
    fontWeight: 600,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
  marginRight: theme.spacing(0.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius:"8px",
  padding: theme.spacing(0.75, 2),
  backgroundColor: theme.palette.error.light + '20',
  color: theme.palette.error.main,
  '&:hover': {
    backgroundColor: theme.palette.error.light + '30',
  },
  '& .MuiButton-startIcon': {
    color: theme.palette.error.main,
  },
}));

const TabPanelsContainer = styled(Box)(({ theme }) => ({
  maxHeight: "400px",
  overflow: "auto",
  padding: theme.spacing(2),
}));

const TabPanel = styled(Box)({
  height: "100%",
});

const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
}));

const EnhancedCourseComparison: React.FC<CourseComparisonProps> = ({
  courses,
  onRemoveCourse,
  onClearAll,
  onDistributionOpen,
  onRatingsOpen,
  onCourseDetailsOpen,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useSessionStorage("courseComparisonActiveTab", 0);
  const [isExpanded, setIsExpanded] = useSessionStorage("courseComparisonExpanded", false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRemoveCourse = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveCourse(index);
    if (activeTab === index) {
      setActiveTab(Math.max(0, index - 1));
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleClearAll = () => {
    onClearAll();
    setActiveTab(0);
  };

  const TabLabel = ({ course, index }: { course: Course; index: number }) => (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      minWidth: isSmallScreen ? "auto" : 120,
      maxWidth: isSmallScreen ? 100 : 200,
    }}>
      <Typography variant="body2" noWrap sx={{ fontSize: isSmallScreen ? "0.75rem" : "0.875rem" }}>
        {`${course.subject} ${course.catalog_num}`}
      </Typography>
      <IconButton
        size="small"
        onClick={(e) => handleRemoveCourse(index, e)}
        sx={{
          p: 0.5,
          borderRadius: "8px",
          opacity: 0.7,
          transition: 'all 0.2s',
          '&:hover': {
            opacity: 1,
            backgroundColor: theme.palette.error.light + '20',
            color: theme.palette.error.main,
          }
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );

  if (!courses?.length) {
    return (
      <EmptyState>
        <Typography color="textSecondary">
          Add courses to compare them side by side
        </Typography>
      </EmptyState>
    );
  }

  React.useEffect(() => {
    if (activeTab >= courses.length) {
      setActiveTab(Math.max(0, courses.length - 1));
    }
  }, [courses.length, activeTab, setActiveTab]);

  return (
    <Container elevation={0}>
      <Header>
        <TabsContainer>
          <StyledTabs
            value={activeTab < courses.length ? activeTab : 0}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons={isSmallScreen ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              minHeight: isSmallScreen ? 40 : 48,
              "& .MuiTabs-scrollButtons": {
                width: isSmallScreen ? 28 : 40,
              },
            }}
          >
            {courses.map((course, index) => (
              <StyledTab
                key={`${course.id}-${index}`}
                label={<TabLabel course={course} index={index} />}
                id={`course-tab-${index}`}
                aria-controls={`course-tabpanel-${index}`}
                sx={{
                  minHeight: isSmallScreen ? 40 : 48,
                  px: isSmallScreen ? 1 : 2,
                }}
              />
            ))}
          </StyledTabs>
        </TabsContainer>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1 }}>
          {courses.length > 0 && (
            <Tooltip title="Clear All Tabs">
              <StyledButton
                size={isSmallScreen ? "small" : "medium"}
                onClick={handleClearAll}
                startIcon={<DeleteSweepIcon />}
                sx={{ display: isSmallScreen ? "none" : "flex" }}
              >
                Clear All
              </StyledButton>
            </Tooltip>
          )}
          {courses.length > 1 && isSmallScreen && (
            <Tooltip title="Clear all courses">
              <IconButton
                onClick={handleClearAll}
                size="small"
                sx={{
                  color: theme.palette.error.main,
                  backgroundColor: theme.palette.error.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.error.light + '30',
                  }
                }}
              >
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            sx={{
              p: 0.5,
              borderRadius: "8px",
            }}
          >
            <StyledExpandIcon expanded={isExpanded} />
          </IconButton>
        </Box>
      </Header>

      <Collapse in={isExpanded}>
        <TabPanelsContainer>
          {courses.map((course, index) => (
            <TabPanel
              key={`${course.id}-panel-${index}`}
              role="tabpanel"
              id={`course-tabpanel-${index}`}
              aria-labelledby={`course-tab-${index}`}
              hidden={activeTab !== index}
            >
              {activeTab === index && (
                <CourseCard
                  course={course}
                  isSmallScreen={isSmallScreen}
                  expanded={true}
                  onExpandChange={() => {}}
                  onDistributionOpen={onDistributionOpen}
                  onRatingsOpen={onRatingsOpen}
                  onCourseDetailsOpen={onCourseDetailsOpen}
                  hideCompareButton
                />
              )}
            </TabPanel>
          ))}
        </TabPanelsContainer>
      </Collapse>
    </Container>
  );
};

export default EnhancedCourseComparison;