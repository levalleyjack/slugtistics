import React from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalculateIcon from "@mui/icons-material/Calculate";
import ScienceIcon from "@mui/icons-material/Science";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ParkIcon from "@mui/icons-material/Park";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PaletteIcon from "@mui/icons-material/Palette";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AppsIcon from "@mui/icons-material/Apps";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import BookIcon from "@mui/icons-material/Book";
import { alpha, Chip, ChipProps, styled, Theme, useTheme } from "@mui/material";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import HandshakeIcon from "@mui/icons-material/Handshake";
import Diversity3Icon from "@mui/icons-material/Diversity3";

export const COLORS = {
  WHITE: "#ffffff",
  BLACK: "#000000",
  INDIGO: "#4F46E5",
  INDIGO_LIGHT: "rgba(79, 70, 229, 0.1)",
  GRAY_50: "#f8fafc",
  GRAY_100: "#f1f5f9",
  GRAY_300: "#d1d5db",
  GRAY_400: "#9ca3af",
  GRAY_500: "#6B7280",
  YELLOW: "#ffc107",
  YELLOW_LIGHT: "#ffd54f",
  YELLOW_STAR: "#fbbf24",
  NAVY_DARK: "#1e1e2f",
  NAVY: "#2d2d44",
} as const;

// Type for the colors object
export type ColorType = typeof COLORS;

// Example usage:
// import { COLORS } from './colors';
// backgroundColor: COLORS.WHITE

export enum ClassStatusEnum {
  OPEN = "Open",
  CLOSED = "Closed",
  WAITLIST = "Wait List",
}
export const ALLOWED_TYPES = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
} as const;

export interface Course {
  has_enrollment_reqs: boolean;
  id: string;
  subject: string;
  catalog_num: string;
  link: string;
  enroll_num: number;
  name: string;
  instructor: string;
  class_count: string;
  class_type: string;
  ge: string;
  schedule: string;
  location: string;
  gpa: number;
  instructor_ratings: any;
  class_status: ClassStatusEnum;
  ge_category: string;
  credits: string;
  career: string;
  grading: string;
}
export const getStatusColor = (status: string) => {
  const theme = useTheme();

  switch (status.toLowerCase()) {
    case "open":
      return theme.palette.success.main;
    case "closed":
      return theme.palette.error.main;
    case "wait list":
      return theme.palette.warning.main;
    default:
      return theme.palette.text.secondary;
  }
};

interface RatingsPanelData {
  professorName: string;
  currentClass: string;
  courseCodes: CourseCode[];
}
interface DistributionPanelData {
  courseCode: string;
  professorName: string;
}
export type PanelData = DistributionPanelData | RatingsPanelData | Course;

export interface FilterOptions {
  subjects: string[];
  classTypes: string[];
  enrollmentStatuses: string[];
  GEs: string[];
  careers: string[];
  prereqs: string[];
}

export interface RMPResponse {
  average_rating: number;
  number_of_ratings: number;
  department: string;
  would_take_again: number;
  average_difficulty: number;
  first_name: string;
  last_name: string;
}
export interface Category {
  id: string;
  name?: string;
  icon: React.ReactNode;
}

export interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export interface CategorySidebarProps {
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  isOpen?: boolean;
}

export interface CategoryDrawerProps {
  isOpen: boolean;
  isCategoriesVisible: boolean;
  isCategoryDrawer: boolean;
  isDistributionDrawer: boolean;
  selectedGE: string;
  setSelectedGE: (ge: string) => void;
  setIsOpen: (open: boolean) => void;
  setIsCategoriesVisible: (visible: boolean) => void;
  activePanel:
    | "distribution"
    | "ratings"
    | "courseDetails"
    | "comparison"
    | null;
}
export interface ChatHeaderProps {
  onClose: () => void;
  theme: Theme;
}
export interface MessageListProps {
  messages: Message[];
  theme: Theme;
}
export interface ChatInputProps {
  inputMessage: string;
  selectedFile: Message["file"];
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onFileClick: () => void;
  onRemoveFile: (e: React.MouseEvent<HTMLButtonElement>) => void;
  theme: Theme;
}
export interface RMPData {
  avgRating: number;
  numRatings: number;
  department: string;
  wouldTakeAgainPercent: number;
  difficultyLevel: number;
  name: string;
}
export interface Rating {
  clarity_rating: number;
  helpful_rating: number;
  difficulty_rating: number;
  comment: string;
  is_online: boolean;
  attendance_mandatory: string;
  textbook_use: number;
  class_name: string;
  date: string;
  createdByUser: string;
  flag_status: "UNFLAGGED" | "FLAGGED";
  tags: string;
  thumbs_up: number;
  thumbs_down: number;
  would_take_again: true;
  overall_rating: number;
}
export interface ExpandIconProps {
  expanded: boolean;
}

export interface GradeChipProps extends ChipProps {
  grade: number;
  interactive?: number;
}
export interface DifficultyChipProps extends ChipProps {
  difficulty: number;
}

interface AnimatedArrowIconProps {
  isVisible: boolean;
  isSmallScreen: boolean;
  sx?: object;
}
export interface CourseDetailsProps {
  course: Course;
  onClose?: () => void;
  maxWidth?: string | number;
}

export interface DiscussionSection {
  class_count: number;
  class_status: ClassStatusEnum;
  code: string;
  enroll_num: number;
  instructor: string;
  location: string;
  schedule: string;
  wait_count: string;
}
export interface FilterDropdownProps {
  codes: string[];

  selectedSubjects: string[];
  GEs: string[];
  sortBy: string;
  selectedGEs: string[];
  selectedClassTypes: string[];
  selectedEnrollmentStatuses: string[];
  selectedCareers: string[];
  selectedPrereqs: string[];
  onSortBy: (value: string) => void;
  onSelectedSubjectsChange: (value: string[]) => void;
  onClassTypesChange: (value: string[]) => void;
  onEnrollmentStatusesChange: (value: string[]) => void;
  onSelectedGEs: (value: string[]) => void;
  onSelectedCareersChange: (value: string[]) => void;
  onSelectedPrereqsChange: (value: string[]) => void;
}
export interface ExpandButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  fullWidth?: boolean;
}

export interface StyledButtonProps {
  fullWidth?: boolean;
}
export type GradientType =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";
export interface GradientChipProps {
  gradienttype: GradientType;
  label: string;
}
export interface CourseApiResponse {
  data?: {
    id: number;
    description: string;
    class_notes: string;
    enrollment_reqs: {
      description: string;
      courses: string[][];
    };
    discussion_sections: DiscussionSection[];
  };
  success: boolean;
  error?: string;
  message?: string;
}

export interface CourseCardProps {
  course: Course;
  isSmallScreen: boolean;
  expanded: boolean;
  ratingsOpen?: boolean;
  distributionOpen?: boolean;
  courseDetailsOpen?: boolean;
  isFavorited?:boolean;

  onExpandChange?: (courseCode: string) => void;
  setSelectedGE?: (category: string) => void;
  onDistributionOpen: (courseCode: string, professorName: string) => void;
  onRatingsOpen: (
    professorName: string,
    courseCode: string,
    courseCodes: CourseCode[]
  ) => void;
  onCourseDetailsOpen: (course: Course) => void;
  handleAddToFavorites?: (course: Course) => void;
  hideCompareButton: boolean;
}

export interface CourseCode {
  courseCount: number;
  courseName: string;
}
export interface LoadingSkeletonProps {
  courseCodes: Array<{ courseName: string; courseCount: number }>;
  filterBy: string;
}
export interface PanelDrawerProps {
  activePanel:
    | "distribution"
    | "ratings"
    | "courseDetails"
    | "comparison"
    | null;
  panelData: any;
  isDistributionDrawer: boolean;
  isSmallScreen: boolean;
  onClose: () => void;
  comparisonCourses?: Course[];
  onRemoveComparisonCourse?: (index: number) => void;
}
export interface CourseDistributionProps {
  courseCode: string;
  professorName?: string;
  isOpen?: boolean;
  onClose?: (e: React.MouseEvent) => void;
  inPanel?: boolean;
}

export interface GradeDistribution {
  [key: string]: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius: number;
  }[];
}

export interface distributionAPIResponse {
  [key: string]: number;
}
export interface StatisticsDrawerProps {
  isOpen: boolean;
  isCategoriesVisible: boolean;
  isMediumScreen: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCategoriesVisible: (visible: boolean) => void;
  filteredCourses: Course[];
  activePanel: string | null;
  isDistributionDrawer: boolean;
}
export interface SearchControlsProps {
  isCategoryDrawer: boolean;
  handleCategoryToggle: () => void;
  headerVisible: boolean;
  isCategoriesVisible: boolean;
  courses: any;
  handleGlobalCourseSelect: (
    course: Course,
    courseId: string,
    category?: string
  ) => void;
  selectedGE: string;
  codes: string[];
  GEs: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedClassTypes: string[];
  setSelectedClassTypes: (types: string[]) => void;
  selectedSubjects: string[];
  setSelectedSubjects: (subjects: string[]) => void;
  selectedEnrollmentStatuses: string[];
  setSelectedEnrollmentStatuses: (statuses: string[]) => void;
  selectedCareers: string[];
  setSelectedCareers: (careers: string[]) => void;
  selectedPrereqs: string[];
  setSelectedPrereqs: (prereqs: string[]) => void;
  selectedGEs: string[];
  setSelectedGEs: (ges: string[]) => void;
}
export interface Message {
  id: number;
  text: string;
  isBot: boolean;
  file?: {
    actual_file: File;
    name: string;
    type: string;
    size: number;
    url: string;
  } | null;
}

export interface FileViewProps {
  file: NonNullable<Message["file"]>;
  inMessage?: boolean;
  onRemove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface RatingsPanelProps {
  professorName: string;
  currentClass: string;
  courseCodes: Array<{ courseName: string; courseCount: number }>;
  onClose?: () => void;
}

export interface RatingCardProps {
  overallRating: number;
  difficultyRating: number;
  getRatingColor: (score: number, type?: "difficulty" | "rating") => string;
}
export const classTypeOptions = [
  "In Person",
  "Hybrid",
  "Synchronous Online",
  "Asynchronous Online",
];
export const enrollmentStatusOptions = ["Open", "Wait List", "Closed"];
export const careersOptions = ["Graduate", "Undergraduate"];
export const prereqOptions = ["Has Prerequisites", "No Prerequisites"];

export interface GlobalSearchDropdownProps {
  courses: Course[] | Record<string, Course[]>;
  onCourseSelect: (course: Course, courseId: string, category?: string) => void;
  selectedGE?: string;
  lastUpdated: string;
  disabled:boolean;
}
export const categories = [
  { id: "AnyGE", name: "All Courses", icon: <AppsIcon color="inherit" /> },
  { id: "C", name: "Composition", icon: <BookIcon color="inherit" /> },

  {
    id: "CC",
    name: "Cross-Cultural Analysis",
    icon: <Diversity3Icon color="inherit" />,
  },
  {
    id: "ER",
    name: "Ethnicity and Race",
    icon: <Diversity2Icon color="inherit" />,
  },
  {
    id: "IM",
    name: "Interpreting Arts and Media",
    icon: <MenuBookIcon color="inherit" />,
  },
  {
    id: "MF",
    name: "Mathematical and Formal Reasoning",
    icon: <CalculateIcon color="inherit" />,
  },
  {
    id: "SI",
    name: "Scientific Inquiry",
    icon: <ScienceIcon color="inherit" />,
  },
  {
    id: "SR",
    name: "Statistical Reasoning",
    icon: <BarChartIcon color="inherit" />,
  },
  {
    id: "TA",
    name: "Textual Analysis",
    icon: <AutoStoriesIcon color="inherit" />,
  },
  {
    id: "PE-E",
    name: "Perspectives: Environmental Awareness",
    icon: <ParkIcon color="inherit" />,
  },
  {
    id: "PE-H",
    name: "Perspectives: Human Behavior",
    icon: <PsychologyIcon color="inherit" />,
  },
  {
    id: "PE-T",
    name: "Perspectives: Technology and Society",
    icon: <PrecisionManufacturingIcon color="inherit" />,
  },
  {
    id: "PR-E",
    name: "Practice: Collaborative Endeavor",
    icon: <HandshakeIcon color="inherit" />,
  },
  {
    id: "PR-C",
    name: "Practice: Creative Process",
    icon: <PaletteIcon color="inherit" />,
  },
  {
    id: "PR-S",
    name: "Practice: Service Learning",
    icon: <VolunteerActivismIcon color="inherit" />,
  },
];

export const StyledExpandIcon = styled(KeyboardArrowDownIcon, {
  shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";

const AnimatedIcon = styled("div")<{ isVisible: boolean }>(({ isVisible }) => ({
  display: "flex",
  alignItems: "center",
  transform: isVisible ? "rotate(0deg)" : "rotate(180deg)",
  transition: "transform 0.3s ease-in-out",
}));

export const AnimatedArrowIcon: React.FC<AnimatedArrowIconProps> = ({
  isVisible,
  isSmallScreen,
  sx,
}) => {
  const IconComponent = isSmallScreen ? ArrowForwardIos : ArrowBackIosNew;

  return (
    <AnimatedIcon isVisible={isVisible}>
      <IconComponent sx={{ fontSize: 20, ...sx }} />
    </AnimatedIcon>
  );
};

export const BaseChip = styled(Chip)(({ theme }) => ({
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  height: "28px",
  fontWeight: "bold",
  "&.MuiChip-clickable": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
export const RatingChip = styled(BaseChip)(({ theme }) => ({
  height: "26px",
  color: "white",
}));
export const ReviewCountChip = styled(BaseChip)(({ theme }) => ({
  height: "24px",

  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  "&.MuiChip-clickable:hover": {
    backgroundColor: "transparent",

    color: theme.palette.primary.main,
  },
}));
export const DifficultyChip = styled(BaseChip)<DifficultyChipProps>(
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

export const CourseCodeChip = styled(BaseChip)(({ theme }) => ({
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

export const GECategoryChip = styled(BaseChip)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.secondary.dark} 0%, 
    ${theme.palette.secondary.light} 100%)`,
  color: "white",
  "& .MuiChip-icon": {
    fontSize: "18px",
    marginLeft: "4px",
    marginRight: "-12px",
  },
  "&.MuiChip-clickable:hover": {
    background: `linear-gradient(135deg, 
      ${theme.palette.secondary.light} 0%, 
      ${theme.palette.secondary.main} 100%)`,
  },
  "&.MuiChip-root": {
    padding: "16px 8px",
  },
}));

export const GradeChip = styled(BaseChip)<GradeChipProps>(
  ({ theme, grade, interactive = 1 }) => {
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
      background: interactive ? getGradient(grade) : theme.palette.common.white,
      color: interactive ? theme.palette.common.white : "transparent",
      backgroundImage: !interactive ? getGradient(grade) : undefined,
      backgroundClip: !interactive ? "text" : undefined,
      WebkitBackgroundClip: !interactive ? "text" : undefined,
      WebkitTextFillColor: !interactive ? "transparent" : undefined,
      "& .MuiChip-icon": {
        color: "inherit",
      },
    };
  }
);
export const StyledChip = styled(BaseChip)(({ theme }) => ({
  "&.MuiChip-outlined": {
    background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    borderColor: theme.palette.grey[300],
    "&.MuiChip-clickable:hover": {
      background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
      borderColor: theme.palette.grey[400],
    },
  },
}));

export const getLetterGrade = (gpa: number) => {
  const gpaNum = gpa;
  if (gpaNum >= 4.0) return "A";
  if (gpaNum >= 3.7) return "A-";
  if (gpaNum >= 3.3) return "B+";
  if (gpaNum >= 3.0) return "B";
  if (gpaNum >= 2.7) return "B-";
  if (gpaNum >= 2.3) return "C+";
  if (gpaNum >= 2.0) return "C";
  if (gpaNum >= 1.7) return "C-";
  if (gpaNum >= 1.3) return "D+";
  if (gpaNum >= 1.0) return "D";
  if (gpaNum >= 0.7) return "D-";
  return "F";
};

export const calculateNormalizedCourseScore = (
  gpa: number | null,
  instructorRating: number | null,
  gpaWeight: number = 0.7
): number => {
  const defaultGpa = 3;
  const defaultRating = 2.5;

  const normalizedGpa = (gpa ?? defaultGpa) / 4;
  const normalizedRating = (instructorRating ?? defaultRating) / 5;

  const enhancedGpa = 1 / (1 + Math.exp(-6 * (normalizedGpa - 0.5)));
  const enhancedRating = 1 / (1 + Math.exp(-4 * (normalizedRating - 0.5)));

  return gpaWeight * enhancedGpa + (1 - gpaWeight) * enhancedRating;
};

export const calculateCourseScoreOutOf10 = (
  gpa: number | null,
  instructorRating: number | null,
  gpaWeight: number = 0.7
): number => {
  const normalizedScore = calculateNormalizedCourseScore(
    gpa,
    instructorRating,
    gpaWeight
  );
  return normalizedScore * 10;
};
