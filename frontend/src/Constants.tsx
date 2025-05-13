import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Chip, ChipProps, styled, Theme, useTheme } from "@mui/material";
import { toZonedTime } from "date-fns-tz";
import {
  AppWindow,
  BookOpen,
  Globe,
  Users2,
  Film,
  Sigma,
  FlaskConical,
  BarChart2,
  FileText,
  Leaf,
  Brain,
  Cpu,
  Handshake,
  Paintbrush2,
  HeartHandshake,
} from "lucide-react";
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
  isFavorited?: boolean;

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
export type ScrollDirection = "up" | "down" | "none";

export interface SearchControlsProps {
  handleCategoryToggle: () => void;
  lastUpdated: any;
  scrollDirection: ScrollDirection;
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
  scrollToSelectedCourse: () => void;
  setIsOpen?: (open: boolean) => void;
  favoriteCoursesLength: number;
  compareMode: boolean;
  setCompareMode: (on: boolean) => void;
  handleDeleteAllFavorites: ()=>void;
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
  disabled: boolean;
}

export const categories = [
  { id: "AnyGE", name: "All Courses", icon: <AppWindow /> },
  { id: "C", name: "Composition", icon: <BookOpen /> },

  {
    id: "CC",
    name: "Cross-Cultural Analysis",
    icon: <Globe />,
  },
  {
    id: "ER",
    name: "Ethnicity and Race",
    icon: <Users2 />,
  },
  {
    id: "IM",
    name: "Interpreting Arts and Media",
    icon: <Film />,
  },
  {
    id: "MF",
    name: "Mathematical and Formal Reasoning",
    icon: <Sigma />,
  },
  {
    id: "SI",
    name: "Scientific Inquiry",
    icon: <FlaskConical />,
  },
  {
    id: "SR",
    name: "Statistical Reasoning",
    icon: <BarChart2 />,
  },
  {
    id: "TA",
    name: "Textual Analysis",
    icon: <FileText />,
  },
  {
    id: "PE-E",
    name: "Perspectives: Environmental Awareness",
    icon: <Leaf />,
  },
  {
    id: "PE-H",
    name: "Perspectives: Human Behavior",
    icon: <Brain />,
  },
  {
    id: "PE-T",
    name: "Perspectives: Technology and Society",
    icon: <Cpu />,
  },
  {
    id: "PR-E",
    name: "Practice: Collaborative Endeavor",
    icon: <Handshake />,
  },
  {
    id: "PR-C",
    name: "Practice: Creative Process",
    icon: <Paintbrush2 />,
  },
  {
    id: "PR-S",
    name: "Practice: Service Learning",
    icon: <HeartHandshake />,
  },
];

export const categoryIconMap = categories.reduce((acc, curr) => {
  acc[curr.id] = curr.icon;
  return acc;
}, {} as Record<string, React.ReactNode>);
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
  border: "1px solid",

  background: "transparent",
  fontSize: "0.875rem",
  letterSpacing: "0.03em",
  height: "32px",
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
    const getText = (gpa: number) => {
      if (gpa >= 3.7) return theme.palette.success.dark;
      if (gpa >= 3.3) return theme.palette.success.light;

      if (gpa >= 3.0) return theme.palette.warning.dark;

      if (gpa >= 2.7) return theme.palette.warning.light;

      return theme.palette.error.dark;
    };
    return {
      height: "28px",
      background: interactive ? getGradient(grade) : "transparent",
      color: interactive ? theme.palette.common.white : getText(grade),
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

export function sortCourses(courses: Course[], sortBy: string): Course[] {
  return [...courses].sort((a, b) => {
    switch (sortBy) {
      case "DEFAULT":
        const scoreA = calculateCourseScoreOutOf10(
          a.gpa,
          a.instructor_ratings?.avg_rating,
          0.85
        );
        const scoreB = calculateCourseScoreOutOf10(
          b.gpa,
          b.instructor_ratings?.avg_rating,
          0.85
        );
        return scoreB - scoreA;

      case "GPA":
        return (b.gpa ?? -Infinity) - (a.gpa ?? -Infinity);

      case "INSTRUCTOR":
        return (
          (b.instructor_ratings?.avg_rating ?? -Infinity) -
          (a.instructor_ratings?.avg_rating ?? -Infinity)
        );

      case "ALPHANUMERIC":
        return `${a.subject} ${a.catalog_num}`.localeCompare(
          `${b.subject} ${b.catalog_num}`,
          "en",
          { numeric: true }
        );

      default:
        return 0;
    }
  });
}

export function filterBySort(
  sortBy: string,
  filters: FilterOptions,
  courses: Course[],
  currentGE?: string
): Course[] {
  const { subjects, classTypes, enrollmentStatuses, GEs, careers, prereqs } =
    filters;
  return sortCourses(
    courses.filter((course) => {
      const matchSubject =
        !subjects.length || subjects.includes(course.subject);
      const matchType =
        !classTypes.length || classTypes.includes(course.class_type);
      const matchStatus =
        !enrollmentStatuses.length ||
        enrollmentStatuses.includes(course.class_status);
      const matchGEs = currentGE
        ? course.ge === currentGE
        : !GEs.length || GEs.includes(course.ge);
      const matchCareers = !careers.length || careers.includes(course.career);
      const matchPrereqs =
        !prereqs.length ||
        prereqs.some((p) =>
          p === "Has Prerequisites"
            ? course.has_enrollment_reqs
            : !course.has_enrollment_reqs
        );
      return (
        matchSubject &&
        matchType &&
        matchStatus &&
        matchGEs &&
        matchCareers &&
        matchPrereqs
      );
    }),
    sortBy
  );
}

export function filterByText(courses: Course[], text: string): Course[] {
  if (!text) return courses;
  const lower = text.toLowerCase();
  return courses.filter((course) => {
    const code = `${course.subject} ${course.catalog_num}`.toLowerCase();
    return (
      course.name.toLowerCase().includes(lower) ||
      code.includes(lower) ||
      course.instructor.toLowerCase().includes(lower)
    );
  });
}

const getTimeAgo = (input?: string | Date): string => {
  if (!input) return "Invalid date";

  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.valueOf())) return "Invalid date";

  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
};

export const getLastUpdatedText = (rawTimestamp?: string): string => {
  if (!rawTimestamp) return "Updated just now";

  const trimmed = rawTimestamp.trim().replace(" ", "T");
  const zonedTime = toZonedTime(trimmed, "America/Los_Angeles");

  return `Updated ${getTimeAgo(zonedTime)}`;
};
