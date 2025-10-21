import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CourseDistributionProps,
  distributionAPIResponse,
  GradeDistribution,
  ClassInfoAPIResponse,
} from "../Constants";

const API_ROUTE = "https://api.slugtistics.com/api/";

async function fetchClassInfo(
  courseCode: string
): Promise<ClassInfoAPIResponse> {
  const res = await fetch(`${API_ROUTE}class-info/${courseCode}`);
  return res.json();
}

function aggregateGradeDistribution(
  classInfoData: ClassInfoAPIResponse,
  instructor: string,
  term: string
): distributionAPIResponse {
  // Filter data based on instructor and term
  let filteredData = classInfoData;
  
  if (instructor !== "All") {
    filteredData = filteredData.filter(
      (record) => record.Instructors === instructor
    );
  }
  
  if (term !== "All") {
    filteredData = filteredData.filter((record) => record.Term === term);
  }
  
  // Aggregate grades
  const aggregated: distributionAPIResponse = {};
  
  filteredData.forEach((record) => {
    Object.entries(record.Grades).forEach(([grade, count]) => {
      if (count !== null) {
        const numCount = parseInt(count, 10);
        if (!isNaN(numCount)) {
          aggregated[grade] = (aggregated[grade] || 0) + numCount;
        }
      }
    });
  });
  
  return aggregated;
}

function extractInstructors(classInfoData: ClassInfoAPIResponse): string[] {
  const instructors = new Set<string>();
  classInfoData.forEach((record) => {
    if (record.Instructors) {
      instructors.add(record.Instructors);
    }
  });
  return Array.from(instructors).sort();
}

function extractTerms(classInfoData: ClassInfoAPIResponse): string[] {
  const terms = new Set<string>();
  classInfoData.forEach((record) => {
    if (record.Term) {
      terms.add(record.Term);
    }
  });
  return Array.from(terms).sort();
}

function calculateGPA(gradeDistribution: GradeDistribution): string {
  const gpaMap: Record<string, number> = {
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
  };
  let totalPoints = 0,
    totalStudents = 0;
  Object.entries(gradeDistribution).forEach(([grade, count]) => {
    if (gpaMap[grade] != null) {
      totalPoints += gpaMap[grade] * count;
      totalStudents += count;
    }
  });
  return totalStudents > 0 ? (totalPoints / totalStudents).toFixed(2) : "N/A";
}

export const CourseDistribution: React.FC<CourseDistributionProps> = ({
  courseCode,
  professorName = "All",
  isOpen, // you can drop this prop now if you like
  onClose,
}) => {
  const [term, setTerm] = useState<string>("All");
  const [showPct, setShowPct] = useState(false);
  const [selInst, setSelInst] = useState<string>(professorName);

  // Fetch all class info data
  const { data: classInfoData = [], isLoading } = useQuery({
    queryKey: ["classInfo", courseCode],
    queryFn: () => fetchClassInfo(courseCode),
    enabled: !!courseCode,
  });

  // Extract instructors from data
  const instructors = useMemo(
    () => extractInstructors(classInfoData),
    [classInfoData]
  );

  // Extract quarters from data
  const quarters = useMemo(
    () => extractTerms(classInfoData),
    [classInfoData]
  );

  const inst = useMemo(
    () => (instructors.includes(selInst) ? selInst : "All"),
    [instructors, selInst]
  );

  // Aggregate grade distribution based on filters
  const distribution = useMemo(
    () => aggregateGradeDistribution(classInfoData, inst, term),
    [classInfoData, inst, term]
  );

  const grades = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "F",
  ];

  const totalStudents = distribution
    ? Object.values(distribution).reduce((a, b) => a + b, 0)
    : 0;

  const chartData = useMemo(() => {
    return grades.map((grade) => {
      const count = distribution?.[grade] || 0;
      const value = showPct
        ? Number(((count / totalStudents) * 100).toFixed(1))
        : count;
      return {
        grade,
        value,
        count, // Keep original count for tooltip
      };
    });
  }, [distribution, showPct, totalStudents, grades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{`Grade: ${label}`}</p>
          <p className="text-primary">
            {showPct
              ? `${data.value}% (${data.count} students)`
              : `${data.count} students`}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    return showPct ? `${value}%` : value.toString();
  };

  return (
    <div className="flex flex-col bg-background rounded-2xl w-full max-h-[85vh] overflow-hidden">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-card">
        <div>
          <h2 className="text-xl font-semibold">{courseCode}</h2>
          <p className="text-sm text-muted-foreground">
            {inst === "All" ? "All Instructors" : inst}
          </p>
        </div>
      </div>

      {/* ─── Stats Bar ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex gap-8 px-6 py-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-8 px-6 py-6 bg-background border-b border-divider"
        >
          <div>
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">students</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {distribution ? calculateGPA(distribution) : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">GPA</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{instructors.length}</p>
            <p className="text-sm text-muted-foreground">instructors</p>
          </div>
        </motion.div>
      )}

      {/* ─── Filters & Chart ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-grow overflow-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Instructor & Term selects + toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={inst} onValueChange={(v) => setSelInst(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Instructors</SelectItem>
                  {instructors.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={term} onValueChange={(v) => setTerm(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Terms</SelectItem>
                  {quarters.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full md:text-xs lg:text-lg"
                onClick={() => setShowPct((p) => !p)}
              >
                {showPct ? "Count" : "Percentage"}
              </Button>
            </div>

            {/* Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="grade"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxisTick}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
