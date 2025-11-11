import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useState } from "react";
import { Course } from "../Constants";
import { useNavigate, useSearchParams } from "react-router-dom";

// Use localhost for development, production URL for production
// VITE_API_URL should be set in production builds
// For development: use localhost:5001
// For production: use https://api.slugtistics.com/api/pyback
export const local = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === "development" || import.meta.env.DEV 
    ? "http://localhost:5001" 
    : "https://api.slugtistics.com/api/pyback");
const CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
} as const;

const All_COURSES_URL = `${local}/all_courses`;

export const useAllCourseData = () => {
  const courseQuery = useQuery({
    queryKey: ["all_courses"],
    queryFn: async () => {
      const response = await axios.get<{
        data: Course[];
        last_update: string;
      }>(All_COURSES_URL);

      return {
        data: response.data?.data ?? [],
        lastUpdate: response.data?.last_update,
      };
    },
    staleTime: CONFIG.staleTime,
    refetchInterval: CONFIG.staleTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: CONFIG.gcTime,
  });

  return {
    data: courseQuery.data?.data ?? [],
    lastUpdate: courseQuery.data?.lastUpdate ?? "",
    isLoading: courseQuery.isLoading,
    isError: courseQuery.isError,
    error: courseQuery.error,
  };
};

export const useGEState = (defaultValue: string) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedGE, setSelectedGE] = useState(() => {
    return searchParams.get("ge") ?? defaultValue;
  });

  const setGEWithNavigation = useCallback(
    (value: string | ((prev: string) => string)) => {
      setSelectedGE((prev) => {
        const newValue = typeof value === "function" ? value(prev) : value;
        navigate(`?ge=${newValue}`);
        return newValue;
      });
    },
    [navigate]
  );

  return [selectedGE, setGEWithNavigation] as const;
};
export const useSessionStorage = <T,>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  const setStateWithStorage = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        sessionStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    },
    [key]
  );

  return [state, setStateWithStorage] as const;
};

export const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  const setStateWithStorage = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    },
    [key]
  );

  return [state, setStateWithStorage] as const;
};
