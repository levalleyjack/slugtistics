import React from "react";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalculateIcon from "@mui/icons-material/Calculate";
import ScienceIcon from "@mui/icons-material/Science";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ParkIcon from "@mui/icons-material/Park";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import GroupsIcon from "@mui/icons-material/Groups";
import PaletteIcon from "@mui/icons-material/Palette";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CreateIcon from "@mui/icons-material/Create";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AppsIcon from "@mui/icons-material/Apps";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChipProps } from "@mui/material";
export const COLORS = {
  WHITE: "#ffffff",
  BLACK: "#000000",
  INDIGO: "#4F46E5",
  INDIGO_LIGHT: "rgba(79, 70, 229, 0.1)",
  GRAY_50: "#f8fafc",
  GRAY_100: "#f1f5f9",
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

export interface ExpandIconProps {
  expanded: boolean;
}

export interface GradeChipProps extends ChipProps {
  grade: number;
}
export interface DifficultyChipProps extends ChipProps {
  difficulty: number;
}

export interface Course {
  id: any;
  code: string;
  link: string;
  enroll_num: string;
  name: string;
  instructor: string;
  class_count: string;
  class_type: string;
  ge: string;
  schedule: string;
  location: string;
  gpa: string;
  instructor_ratings: any;
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
  flag_status: 'UNFLAGGED' | 'FLAGGED';
  tags: string;
  thumbs_up:number;
  thumbs_down:number;
  would_take_again:true;
  overall_rating:number;

}

export const getLetterGrade = (gpa: string) => {
  const gpaNum = parseFloat(gpa);
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

export const categories = [
  { id: "CC", name: "Cross-Cultural Analysis", icon: <PeopleIcon /> },
  { id: "ER", name: "Ethnicity and Race", icon: <PeopleIcon /> },
  { id: "IM", name: "Interpreting Arts and Media", icon: <MenuBookIcon /> },
  {
    id: "MF",
    name: "Mathematical and Formal Reasoning",
    icon: <CalculateIcon />,
  },
  { id: "SI", name: "Scientific Inquiry", icon: <ScienceIcon /> },
  { id: "SR", name: "Statistical Reasoning", icon: <BarChartIcon /> },
  { id: "TA", name: "Textual Analysis", icon: <AutoStoriesIcon /> },
  {
    id: "PE-E",
    name: "Perspectives: Environmental Awareness",
    icon: <ParkIcon />,
  },
  {
    id: "PE-H",
    name: "Perspectives: Human Behavior",
    icon: <PsychologyIcon />,
  },
  {
    id: "PE-T",
    name: "Perspectives: Technology and Society",
    icon: <PrecisionManufacturingIcon />,
  },
  {
    id: "PR-E",
    name: "Practice: Collaborative Endeavor",
    icon: <GroupsIcon />,
  },
  { id: "PR-C", name: "Practice: Creative Process", icon: <PaletteIcon /> },
  {
    id: "PR-S",
    name: "Practice: Service Learning",
    icon: <VolunteerActivismIcon />,
  },
  { id: "C", name: "Composition", icon: <CreateIcon /> },

  { id: "AnyGE", name: "All Courses", icon: <AppsIcon /> },
];
