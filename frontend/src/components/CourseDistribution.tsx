import React, { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
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
  ChartData,
  CourseDistributionProps,
  distributionAPIResponse,
  GradeDistribution,
} from "../Constants";

const API_ROUTE = "https://api.slugtistics.com/api/";

async function fetchGradeDistribution(
  courseCode: string,
  instructor: string,
  term: string
): Promise<distributionAPIResponse> {
  const res = await fetch(
    `${API_ROUTE}grade-distribution/${courseCode}?instructor=${instructor}&term=${term}`
  );
  return res.json();
}

async function fetchInstructors(courseCode: string): Promise<string[]> {
  const res = await fetch(`${API_ROUTE}instructors/${courseCode}`);
  return res.json();
}

async function fetchQuarters(courseCode: string): Promise<string[]> {
  const res = await fetch(`${API_ROUTE}quarters/${courseCode}`);
  return res.json();
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
  const { data: instructors = [], isLoading: loadingInst } = useQuery({
    queryKey: ["instructors", courseCode],
    queryFn: () => fetchInstructors(courseCode),
    enabled: !!courseCode,
  });

  const inst = useMemo(
    () => (instructors.includes(selInst) ? selInst : "All"),
    [instructors, selInst]
  );

  const { data: distribution, isLoading: loadingDist } = useQuery({
    queryKey: ["gradeDistribution", courseCode, inst, term],
    queryFn: () => fetchGradeDistribution(courseCode, inst, term),
    enabled: !!courseCode,
  });

  const { data: quarters = [], isLoading: loadingQtrs } = useQuery({
    queryKey: ["quarters", courseCode],
    queryFn: () => fetchQuarters(courseCode),
    enabled: !!courseCode,
  });

  const isLoading = loadingInst || loadingDist || loadingQtrs;

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

  const chartData = useMemo<ChartData>(
    () => ({
      labels: grades,
      datasets: [
        {
          label: "Students",
          data: grades.map((g) => {
            const c = distribution?.[g] || 0;
            return showPct ? Number(((c / totalStudents) * 100).toFixed(1)) : c;
          }),
          borderRadius: 2,
          backgroundColor: "var(--shadcn-primary)",
        },
      ],
    }),
    [distribution, showPct, totalStudents]
  );

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val: any) => (showPct ? `${val}%` : (val as number)),
        },
      },
    },
    plugins: { legend: { display: false } },
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
              <Bar data={chartData} options={chartOpts as any} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
