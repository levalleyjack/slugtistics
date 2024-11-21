import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Course } from "../Colors";

export const local = "https://api.slugtistics.com/api/pyback";

//constants
export const CONFIG = {
  local: "https://api.slugtistics.com/api/pyback",
  gpaRoute: "https://api.slugtistics.com/api/",
  schoolId: 1078,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
} as const;

const API_URL = `${CONFIG.local}/api/courses`;

//exporting all course info like instructor, average gpa, etc.
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
    refetchOnMount: false, //prevent refetching on component mount
    gcTime: CONFIG.gcTime,
  });

  const courseCodes = React.useMemo(() => {
    if (!courseQuery.data) return [];
    return [
      ...new Set(
        Object.values(courseQuery.data).flatMap((courses) =>
          courses.map((course) => course.code)
        )
      ),
    ];
  }, [courseQuery.data]);

  const enrollmentQuery = useQuery({
    queryKey: ["enrollment-batch", courseCodes],
    queryFn: async () => {
      const enrollmentMap: Record<string, string> = {};
      await Promise.all(
        courseCodes.map(async (code) => {
          try {
            const [subject, catalogNbr] = code.split(" ");
            const response = await fetch(
              `https://my.ucsc.edu/PSIGW/RESTListeningConnector/PSFT_CSPRD/SCX_CLASS_LIST.v1/2250?subject=${subject}&catalog_nbr=${catalogNbr}`
            );
            const data = await response.json();
            const classInfo = data.classes?.[0];

            if (classInfo) {
              enrollmentMap[
                code
              ] = `${classInfo.enrl_total}/${classInfo.enrl_capacity}`;
            } else {
              enrollmentMap[code] = "N/A";
            }
          } catch (error) {
            console.error(
              `Error fetching enrollment for course ${code}:`,
              error
            );
            enrollmentMap[code] = "N/A";
          }
        })
      );
      return enrollmentMap;
    },
    enabled: courseQuery.isSuccess && courseCodes.length > 0,
    refetchOnMount: false,
    staleTime: CONFIG.staleTime,
    gcTime: CONFIG.gcTime,
    refetchOnWindowFocus: false,
  });

  const enhancedData = React.useMemo<Record<string, Course[]>>(() => {
    if (!courseQuery.data) return {};

    return Object.fromEntries(
      Object.entries(courseQuery.data).map(([category, courses]) => [
        category,
        courses.map(
          (course): Course => ({
            ...course,
            class_count: enrollmentQuery.data?.[course.code] ?? "Loading...",
          })
        ),
      ])
    );
  }, [courseQuery.data, enrollmentQuery.data]);

  return {
    data: enhancedData,
    isLoading: courseQuery.isLoading,
    isError: courseQuery.isError,
    error: courseQuery.error,
  };
};
