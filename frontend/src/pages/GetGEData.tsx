import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Course } from "../Constants";

export const local = "https://api.slugtistics.com/api/pyback";

const CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
} as const;

const GE_COURSES_URL = `${local}/ge_courses`;
const All_COURSES_URL = `${local}/all_courses`;

export const useGECourseData = () => {
  const courseQuery = useQuery({
    queryKey: ["ge_courses"],
    queryFn: async () => {
      const response = await axios.get<{ data: Record<string, Course[]> }>(
        GE_COURSES_URL
      );
      return response.data?.data ?? {};
    },
    staleTime: CONFIG.staleTime,
    refetchInterval: CONFIG.staleTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: CONFIG.gcTime,
  });

  const enhancedData = React.useMemo<Record<string, Course[]>>(() => {
    if (!courseQuery.data) return {};

    return Object.fromEntries(
      Object.entries(courseQuery.data).map(([category, courses]) => [
        category,
        Array.isArray(courses)
          ? courses.map(
              (course): Course => ({
                ...course,
                ge_category: category,
              })
            )
          : [],
      ])
    );
  }, [courseQuery.data]);

  return {
    data: enhancedData,
    isLoading: courseQuery.isLoading,
    isError: courseQuery.isError,
    error: courseQuery.error,
  };
};
export const useAllCourseData = () => {
  const courseQuery = useQuery({
    queryKey: ["all_courses"],
    queryFn: async () => {
      const response = await axios.get<{ data: Course[] }>(All_COURSES_URL);
      return response.data?.data ?? {};
    },
    staleTime: CONFIG.staleTime,
    refetchInterval: CONFIG.staleTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: CONFIG.gcTime,
  });

  return {
    data: courseQuery.data ?? [],
    isLoading: courseQuery.isLoading,
    isError: courseQuery.isError,
    error: courseQuery.error,
  };
};
