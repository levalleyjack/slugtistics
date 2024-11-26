import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Course } from "../Colors";

export const local = "https://api.slugtistics.com/api/pyback";

const CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
} as const;

const API_URL = `${local}/api/courses`;

export const useCourseData = () => {
  const courseQuery = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await axios.get<{ data: Record<string, Course[]> }>(
        API_URL
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

    const baseEnhancedData = Object.fromEntries(
      Object.entries(courseQuery.data).map(([category, courses]) => [
        category,
        courses.map(
          (course): Course => ({
            ...course,
            ge_category: category,
          })
        ),
      ])
    );

    return {
      ...baseEnhancedData,
    };
  }, [courseQuery.data]);

  return {
    data: enhancedData,
    isLoading: courseQuery.isLoading,
    isError: courseQuery.isError,
    error: courseQuery.error,
  };
};
