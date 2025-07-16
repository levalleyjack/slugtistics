import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  GraduationCap,
  Settings,
  Users,
  TrendingUp,
  Moon,
  Sun,
  Plus,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { SummaryCards } from "@/components/SummaryCards";
import ReactSelect from "react-select";
import { useQuery } from "@tanstack/react-query";
import { createSelectStyles } from "@/components/reactSelectStyles";

const route = "http://127.0.0.1:8080/";

// Types
interface ClassOption {
  label: string;
  value: string;
}

interface ClassInfo {
  SubjectCatalogNbr: string;
  Term: string;
  Instructors: string;
  Grades: Record<string, number | null>;
}

interface AddedChart {
  id: string;
  label: string;
  instructor: string | null;
  term: string | null;
  data: { grade: string; count: number }[];
  avgGPA: number;
  color: string;
  ratingSnapshot?: InstructorRatings;
}

interface InstructorRatings {
  avg_rating: number;
  difficulty_level: number;
  would_take_again_percent: number;
  num_ratings: number;
}

const GRADE_POINTS = {
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

const CLASS_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

// API Functions
async function fetchClasses(): Promise<ClassOption[]> {
  try {
    const res = await fetch(route + "classes");
    if (!res.ok) throw new Error("Failed to load classes");
    const data: string[] = await res.json();
    return data.map((cls) => ({ label: cls, value: cls }));
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

async function fetchClassInfo(subject: string): Promise<ClassInfo[]> {
  try {
    const res = await fetch(route + `class-info/${subject}`);
    if (!res.ok) throw new Error("Failed to load class info");
    return res.json();
  } catch (error) {
    console.error("Error fetching class info:", error);
    return [];
  }
}

async function fetchInstructorRatings(
  instructor: string
): Promise<InstructorRatings | null> {
  try {
    const res = await fetch(
      `https://api.slugtistics.com/api/pyback/instructor_ratings?instructor=${encodeURIComponent(
        instructor
      )}&course=`
    );
    if (!res.ok) throw new Error("Failed to load instructor ratings");
    return res.json();
  } catch (error) {
    console.error("Error fetching instructor ratings:", error);
    return null;
  }
}

function SummaryCard({ chart, onRemove }) {
  const getColorHue = (value, metric) => {
    switch (metric) {
      case "gpa":
        return Math.max(0, Math.min(120, ((value - 2) / 2) * 120));
      case "rating":
        return Math.max(0, Math.min(120, (value / 5) * 120));
      case "difficulty":
        return Math.max(0, Math.min(120, (1 - value / 5) * 120));
      case "takeAgain":
        return Math.max(0, Math.min(120, (value / 100) * 120));
      default:
        return 60;
    }
  };

  return (
    <Card className="relative">
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: chart.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{chart.label}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(chart.id)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          {chart.instructor || "All Instructors"} • {chart.term || "All Terms"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-3 rounded-lg border-l-4 bg-muted/50"
            style={{
              borderLeftColor: `hsl(${getColorHue(
                chart.avgGPA,
                "gpa"
              )}, 70%, 50%)`,
            }}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Avg GPA
            </p>
            <p className="text-2xl font-bold">
              {chart.avgGPA.toFixed(2)}
              <span className="text-sm text-muted-foreground ml-1">/ 4.0</span>
            </p>
          </div>

          {chart.ratingSnapshot && (
            <div
              className="p-3 rounded-lg border-l-4 bg-muted/50"
              style={{
                borderLeftColor: `hsl(${getColorHue(
                  chart.ratingSnapshot.avg_rating,
                  "rating"
                )}, 70%, 50%)`,
              }}
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Rating
              </p>
              <p className="text-2xl font-bold">
                {chart.ratingSnapshot.avg_rating.toFixed(1)}
                <span className="text-sm text-muted-foreground ml-1">
                  / 5.0
                </span>
              </p>
            </div>
          )}
        </div>

        {chart.ratingSnapshot && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">
                Difficulty
              </p>
              <p className="text-lg font-semibold">
                {chart.ratingSnapshot.difficulty_level.toFixed(1)}/5
              </p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">
                Take Again
              </p>
              <p className="text-lg font-semibold">
                {chart.ratingSnapshot.would_take_again_percent}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // — selection state —
  const [selectedClass, setSelectedClass] = React.useState<ClassOption | null>(
    null
  );
  const [selectedInstructor, setSelectedInstructor] = React.useState<
    string | null
  >(null);
  const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null);

  // — added charts state —
  const [addedCharts, setAddedCharts] = React.useState<AddedChart[]>([]);
  const [sortBy, setSortBy] = React.useState<"instructor" | "term">(
    "instructor"
  );

  // 1) load class options
  const { data: classOptions = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    staleTime: Infinity,
  });

  // 3) load info for selected class
  const { data: classInfo = [] } = useQuery({
    queryKey: ["classInfo", selectedClass?.value],
    queryFn: () => fetchClassInfo(selectedClass!.value),
    enabled: Boolean(selectedClass),
  });

  // 4) build dropdowns
  const termOptions = React.useMemo(() => {
    const relevantClasses = classInfo.filter(
      (classItem) =>
        !selectedInstructor ||
        selectedInstructor === "" ||
        classItem.Instructors === selectedInstructor
    );
    const allTerms = relevantClasses.map((classItem) => classItem.Term);
    const uniqueTerms = Array.from(new Set(allTerms));
    uniqueTerms.reverse();
    const options = [
      { label: "All Terms", value: "" },
      ...uniqueTerms.map((term) => ({ label: term, value: term })),
    ];
    return options;
  }, [classInfo, selectedInstructor]);

  const instructorOptions = React.useMemo(() => {
    const all = classInfo
      .filter(
        (c) => !selectedTerm || selectedTerm === "" || c.Term === selectedTerm
      )
      .map((c) => c.Instructors);
    const uniq = Array.from(new Set(all));
    return [
      { label: "All Instructors", value: "" },
      ...uniq.map((i) => ({ label: i, value: i })),
    ];
  }, [classInfo, selectedTerm]);

  // fetch instructor ratings - only when a specific instructor is selected
  const { data: instrRatings } = useQuery({
    queryKey: ["instructorRatings", selectedInstructor],
    queryFn: () => fetchInstructorRatings(selectedInstructor!),
    enabled: Boolean(selectedInstructor && selectedInstructor !== ""),
    staleTime: 1000 * 60 * 5,
  });

  const currentChartData = React.useMemo(() => {
    const buckets: Record<string, number> = {
      "A+": 0,
      A: 0,
      "A-": 0,
      "B+": 0,
      B: 0,
      "B-": 0,
      "C+": 0,
      C: 0,
      "C-": 0,
      "D+": 0,
      D: 0,
      "D-": 0,
      F: 0,
      P: 0,
      NP: 0,
      W: 0,
    };

    classInfo.forEach((row) => {
      const okInst =
        !selectedInstructor ||
        selectedInstructor === "" ||
        row.Instructors === selectedInstructor;
      const okTerm =
        !selectedTerm || selectedTerm === "" || row.Term === selectedTerm;
      if (okInst && okTerm) {
        Object.entries(row.Grades).forEach(([g, c]) => {
          buckets[g] += Number(c || 0);
        });
      }
    });

    const total = Object.values(buckets).reduce((s, c) => s + c, 0);

    return Object.entries(buckets).map(([grade, count]) => ({
      grade,
      count: total ? Math.round((count / total) * 1000) / 10 : 0,
    }));
  }, [classInfo, selectedInstructor, selectedTerm]);

  // — handlers —
  const handleAddClass = () => {
    if (addedCharts.length >= 4) return;
    const usedColors = addedCharts.map((c) => c.color);
    const color =
      CLASS_COLORS.find((col) => !usedColors.includes(col)) || CLASS_COLORS[0];
    if (!selectedClass) return;

    // calculate avgGPA as before...
    const { data } = { data: currentChartData };
    const numeric = data.filter((d) => GRADE_POINTS[d.grade] != null);
    const totalPts = numeric.reduce(
      (s, { grade, count }) => s + GRADE_POINTS[grade] * count,
      0
    );
    const totalCount = numeric.reduce((s, { count }) => s + count, 0);
    const avgGPA = totalCount ? totalPts / totalCount : 0;

    const id = `${Date.now()}`;

    // snapshot the current instrRatings, if any (only when specific instructor selected):
    const ratingSnapshot =
      selectedInstructor && selectedInstructor !== ""
        ? instrRatings
        : undefined;

    setAddedCharts((prev) => [
      ...prev,
      {
        id,
        label: selectedClass.label,
        instructor: selectedInstructor === "" ? null : selectedInstructor,
        term: selectedTerm === "" ? null : selectedTerm,
        data: currentChartData,
        avgGPA,
        color,
        ratingSnapshot,
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setAddedCharts((prev) => prev.filter((c) => c.id !== id));
  };

  // 7) build combined data for the multi‑series chart
  const combinedData = React.useMemo(() => {
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
      "P",
      "NP",
      "W",
    ];

    return grades.map((grade) => {
      const entry: any = { grade };

      addedCharts.forEach((ch) => {
        const total = ch.data.reduce((s, d) => s + d.count, 0);
        const rawCount = ch.data.find((d) => d.grade === grade)?.count || 0;
        entry[ch.id] = total ? Math.round((rawCount / total) * 1000) / 10 : 0;
      });

      return entry;
    });
  }, [addedCharts]);

  // dynamic legend/config for ChartContainer
  const chartConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string }> = {};
    addedCharts.forEach((ch) => {
      cfg[ch.id] = { label: ch.label };
    });
    return cfg;
  }, [addedCharts]);

  const handleRemoveChart = (id: string) => {
    setAddedCharts((prev) => prev.filter((chart) => chart.id !== id));
  };

  return (
    <div className={` ${isDarkMode ? "dark" : ""}`}>
      <div className="flex bg-background ">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sidebar */}
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              {/* Header */}
              <header className="bg-card border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-foreground" />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Grade Distribution Overview
                      </h2>
                      <p className="text-muted-foreground">
                        Analyze and compare course performance across different
                        instructors and terms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                      {isDarkMode ? (
                        <Sun className="h-4 w-4 text-foreground" />
                      ) : (
                        <Moon className="h-4 w-4 text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <div className="flex-1 p-6 flex flex-col overflow-y-auto h-[calc(100%-1328px)]">
                <div className="space-y-6 flex-1 flex flex-col">
                  {/* Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Class Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* Class */}
                        <div className="flex-1 min-w-[200px]">
                          <ReactSelect
                            options={classOptions}
                            value={selectedClass}
                            onChange={(opt) => {
                              setSelectedClass(opt as ClassOption);
                              setSelectedInstructor(null);
                              setSelectedTerm(null);
                            }}
                            placeholder="Class"
                            styles={createSelectStyles(isDarkMode)}
                            isClearable={true} // Optional: adds an X button to clear selection
                          />
                        </div>

                        {/* Sort By */}
                        <div className="w-[300px] min-w-[150px]">
                          <ReactSelect
                            options={[
                              {
                                value: "instructor",
                                label: "Select by Instructor",
                              },
                              { value: "term", label: "Select by Term" },
                            ]}
                            value={{
                              value: sortBy,
                              label: `Select by ${sortBy[0].toUpperCase()}${sortBy.slice(
                                1
                              )}`,
                            }}
                            onChange={(opt) => {
                              setSortBy(opt?.value || "instructor");
                              setSelectedInstructor(null);
                              setSelectedTerm(null);
                            }}
                            styles={createSelectStyles(isDarkMode)}
                          />
                        </div>

                        {/* First filtered dropdown */}
                        {sortBy === "instructor" ? (
                          <div className="w-[300px] min-w-[150px]">
                            <ReactSelect
                              options={instructorOptions}
                              value={
                                selectedInstructor !== null
                                  ? instructorOptions.find(
                                      (o) => o.value === selectedInstructor
                                    )
                                  : null
                              }
                              onChange={(opt) =>
                                setSelectedInstructor(
                                  (opt as ClassOption)?.value ?? null
                                )
                              }
                              placeholder="Instructor"
                              isDisabled={instructorOptions.length === 0}
                              styles={createSelectStyles(isDarkMode)}
                            />
                          </div>
                        ) : (
                          <div className="w-[300px] min-w-[150px]">
                            <ReactSelect
                              options={termOptions}
                              value={
                                selectedTerm !== null
                                  ? termOptions.find(
                                      (o) => o.value === selectedTerm
                                    )
                                  : null
                              }
                              onChange={(opt) =>
                                setSelectedTerm(
                                  (opt as ClassOption)?.value ?? null
                                )
                              }
                              placeholder="Term"
                              isDisabled={termOptions.length === 0}
                              styles={createSelectStyles(isDarkMode)}
                            />
                          </div>
                        )}

                        {/* Fourth dropdown */}
                        {sortBy === "instructor" ? (
                          <div className="w-[300px] min-w-[150px]">
                            <ReactSelect
                              options={termOptions}
                              value={
                                selectedTerm !== null
                                  ? termOptions.find(
                                      (o) => o.value === selectedTerm
                                    )
                                  : null
                              }
                              onChange={(opt) =>
                                setSelectedTerm(
                                  (opt as ClassOption)?.value ?? null
                                )
                              }
                              placeholder="Term"
                              isDisabled={
                                selectedInstructor === null ||
                                termOptions.length === 0
                              }
                              styles={createSelectStyles(isDarkMode)}
                            />
                          </div>
                        ) : (
                          <div className="w-[300px] min-w-[150px]">
                            <ReactSelect
                              options={instructorOptions}
                              value={
                                selectedInstructor !== null
                                  ? instructorOptions.find(
                                      (o) => o.value === selectedInstructor
                                    )
                                  : null
                              }
                              onChange={(opt) =>
                                setSelectedInstructor(
                                  (opt as ClassOption)?.value ?? null
                                )
                              }
                              placeholder="Instructor"
                              isDisabled={
                                selectedTerm === null ||
                                instructorOptions.length === 0
                              }
                              styles={createSelectStyles(isDarkMode)}
                            />
                          </div>
                        )}

                        {/* Add */}
                        <div className="flex items-center">
                          <Button onClick={handleAddClass} variant="outline">
                            Add Class
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
                    {/* Chart */}
                    <Card className="xl:col-span-2 flex flex-col">
                      <CardHeader>
                        <CardTitle>Grade Distribution Comparison</CardTitle>
                        <CardDescription>
                          Percentage distribution of grades across selected
                          courses
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex-1 min-h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={combinedData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                              />
                              <XAxis
                                dataKey="grade"
                                className="text-sm"
                                tick={{ fill: "var(--muted-foreground)" }}
                              />
                              <YAxis
                                className="text-sm"
                                tick={{ fill: "var(--muted-foreground)" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "var(--card)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "6px",
                                }}
                              />
                              <Legend />
                              {addedCharts.map((chart) => (
                                <Bar
                                  key={chart.id}
                                  dataKey={chart.id}
                                  name={chart.label}
                                  fill={chart.color}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Summary Cards */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          Course Summary
                        </h3>
                        <Badge variant="secondary">
                          {addedCharts.length}/4
                        </Badge>
                      </div>
                      {addedCharts.map((chart) => (
                        <SummaryCard
                          key={chart.id}
                          chart={chart}
                          onRemove={handleRemoveChart}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
