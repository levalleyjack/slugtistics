import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Course } from "../Colors";

interface GradeDistribution {
  [grade: string]: number;
}

interface InstructorMap {
  [key: string]: string;
}

interface EnhancedCourse extends Course {
  average_gpa: string;
}
export const local = "http://127.0.0.1:5001";

//constants
export const CONFIG = {
  local: "http://127.0.0.1:5001",
  gpaRoute: "https://api.slugtistics.com/api/",
  schoolId: 1078,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
} as const;

const API_URL = `${CONFIG.local}/api/courses`;

const GPA_MAP = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
} as const;

const calculateGPA = (grade: string): number => {
  return GPA_MAP[grade as keyof typeof GPA_MAP] || 0.0;
};

const calculateAverageGPA = (gradeDistribution: GradeDistribution): string => {
  let totalGPA = 0;
  let totalStudents = 0;

  Object.entries(gradeDistribution).forEach(([grade, count]) => {
    totalGPA += calculateGPA(grade) * count;
    totalStudents += count;
  });

  return totalStudents > 0 ? (totalGPA / totalStudents).toFixed(2) : "N/A";
};

//removing special characters
const normalizeInstructorName = (name: string): string => {
  return name
    .replace(/[**,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

//initals from name
const getInitials = (name: string): string[] => {
  return name
    .split(/[\s.]/)
    .filter(
      (part) => part.length === 1 || (part.length === 2 && part.endsWith("."))
    )
    .map((initial) => initial.charAt(0).toUpperCase());
};

//finds instructor based on first inital and last name, is used to display the full name which is fetched from gpa
const findMatchingInstructor = (
  normalizedInput: string,
  instructors: string[]
): string | undefined => {
  const inputParts = normalizedInput
    .split(" ")
    .filter((part) => part.length > 0);
  const inputLast = inputParts[inputParts.length - 1];
  const inputInitials = getInitials(normalizedInput);

  return instructors.find((fullName) => {
    const normalizedFullName = normalizeInstructorName(fullName);
    const fullNameParts = normalizedFullName.split(" ");
    const firstNames = fullNameParts.slice(0, -1);
    const lastName = fullNameParts[fullNameParts.length - 1];

    // Check if last names match
    const lastNameMatches = lastName.toLowerCase() === inputLast.toLowerCase();
    if (!lastNameMatches) return false;

    // Check initials if provided
    if (inputInitials.length > 0) {
      const fullNameInitials = firstNames.map((name) =>
        name.charAt(0).toUpperCase()
      );
      return inputInitials.every(
        (initial, index) => fullNameInitials[index] === initial
      );
    }

    // Check first names
    return firstNames.some(
      (name) => name.toLowerCase() === inputParts[0].toLowerCase()
    );
  });
};

const fetchGradeDistribution = async (code: string): Promise<string> => {
  try {
    const response = await fetch(
      `${CONFIG.gpaRoute}grade-distribution/${code}?instructor=All&term=All`
    );
    const gradeData: GradeDistribution = await response.json();
    return calculateAverageGPA(gradeData);
  } catch (error) {
    console.error(`Error fetching GPA for ${code}:`, error);
    return "N/A";
  }
};

//exporting all course info like instructor, average gpa, etc.
export const useCourseData = (categoryValue: string) => {
  // Fetch basic course data
  const courseQuery = useQuery({
    queryKey: ["courses", categoryValue],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}?course=${categoryValue}`);
      return response.data?.data || [];
    },
  });

  //Extract unique course codes
  const courseCodes = React.useMemo(() => {
    if (!courseQuery.data) return [];
    return [...new Set(courseQuery.data.map((course: Course) => course.code))];
  }, [courseQuery.data]);

  //Fetch instructor full name, if possible
  const instructorQuery = useQuery({
    queryKey: ["instructors-batch", courseCodes],
    queryFn: async () => {
      const instructorMap: InstructorMap = {};

      await Promise.all(
        courseCodes.map(async (code) => {
          try {
            const course = courseQuery.data.find(
              (c: Course) => c.code === code
            );
            if (!course || course.instructor === "Staff") {
              if (course) instructorMap[course.instructor] = course.instructor;
              return;
            }

            const response = await fetch(
              `${CONFIG.gpaRoute}instructors/${code}`
            );
            const courseInstructors = await response.json();
            const normalizedInput = normalizeInstructorName(course.instructor); //removes any special character from original web  scraping instructor

            instructorMap[course.instructor] = courseInstructors?.length
              ? findMatchingInstructor(normalizedInput, courseInstructors) || //if can't find instructor from slugtistics data then just return original instructor from scrape, like P. Tantalo instead of Patrick Tantalo
                course.instructor
              : course.instructor;
          } catch (error) {
            console.error(
              `Error fetching instructor for course ${code}:`,
              error
            );
            const course = courseQuery.data.find(
              (c: Course) => c.code === code
            );
            if (course) instructorMap[course.instructor] = course.instructor;
          }
        })
      );
      return instructorMap;
    },
    enabled: courseQuery.isSuccess && courseCodes.length > 0,
  });

  //Fetch GPA for all class
  const gpaQuery = useQuery({
    queryKey: ["gpas-batch", courseQuery.data],
    queryFn: async () => {
      const gpaMap: { [code: string]: string } = {};
      await Promise.all(
        courseQuery.data.map(async (course: Course) => {
          try {
            gpaMap[course.code] = await fetchGradeDistribution(course.code);
          } catch (error) {
            console.error(`Error fetching GPA: ${error}`);
            gpaMap[course.code] = "N/A";
          }
        })
      );
      return gpaMap;
    },
    enabled: courseQuery.isSuccess && courseQuery.data.length > 0,
  });

  //Combine all data
  const enhancedData = React.useMemo(() => {
    if (!courseQuery.data) return [];

    return courseQuery.data.map(
      (course: Course): EnhancedCourse => ({
        ...course,
        instructor:
          instructorQuery.data?.[course.instructor] || course.instructor,
        average_gpa: gpaQuery.data?.[course.code] || "N/A",
      })
    );
  }, [courseQuery.data, instructorQuery.data, gpaQuery.data]);

  return {
    data: enhancedData,
    isLoading:
      courseQuery.isLoading || instructorQuery.isLoading || gpaQuery.isLoading,
    isError: courseQuery.isError || instructorQuery.isError || gpaQuery.isError,
    error: courseQuery.error || instructorQuery.error || gpaQuery.error,
  };
};
