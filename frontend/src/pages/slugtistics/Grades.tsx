import React, { useState } from "react";
import { Download, Sun, Moon, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";
import ReactSelect from "react-select";
import { useQuery } from "@tanstack/react-query";
import { createSelectStyles } from "@/components/Slugtistics/reactSelectStyles";
import SummaryCard from "@/components/Slugtistics/SummaryCard";
import html2canvas from "html2canvas-pro";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Your existing interfaces and constants
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

const CLASS_COLORS = ["#fdc086", "#7fc97f", "#beaed4", "#ffff99"];
const route = "https://api.slugtistics.com/api/";

// Your existing API functions
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
    if (!res.ok) {
      // Return null for any HTTP error (including 500)
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching instructor ratings:", error);
    return null;
  }
}

interface OverviewPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function OverviewPage({
  isDarkMode,
  setIsDarkMode,
}: OverviewPageProps) {
  // Initialize dark mode from localStorage or props
  const [internalDarkMode, setInternalDarkMode] = React.useState(() => {
    // Try to get from localStorage first, fallback to props
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("slugtistics-dark-mode");
      if (stored !== null) {
        return JSON.parse(stored);
      }
    }
    return isDarkMode;
  });

  // Loading state management
  const [showDelayedLoading, setShowDelayedLoading] = React.useState(false);
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync internal state with parent component
  React.useEffect(() => {
    setIsDarkMode(internalDarkMode);
  }, [internalDarkMode, setIsDarkMode]);

  // Handle dark mode toggle with persistence
  const handleDarkModeToggle = () => {
    const newMode = !internalDarkMode;
    setInternalDarkMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("slugtistics-dark-mode", JSON.stringify(newMode));
    }
  };

  const [selectedClass, setSelectedClass] = React.useState<ClassOption | null>(
    null
  );
  const [selectedInstructor, setSelectedInstructor] = React.useState<
    string | null
  >(null);
  const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null);
  const [addedCharts, setAddedCharts] = React.useState<AddedChart[]>([]);
  const [sortBy, setSortBy] = React.useState<"instructor" | "term">(
    "instructor"
  );

  // Separate data structure to store instructor ratings
  const [instructorRatingsCache, setInstructorRatingsCache] = React.useState<
    Record<string, InstructorRatings | null>
  >({});

  const { data: classOptions = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    staleTime: Infinity,
  });

  const { data: classInfo = [] } = useQuery({
    queryKey: ["classInfo", selectedClass?.value],
    queryFn: () => fetchClassInfo(selectedClass!.value),
    enabled: Boolean(selectedClass),
  });

  const termOptions = React.useMemo(() => {
    const filteredClasses =
      sortBy === "term"
        ? classInfo
        : classInfo.filter(
            (classItem) =>
              !selectedInstructor ||
              selectedInstructor === "" ||
              classItem.Instructors === selectedInstructor
          );
    const allTerms = filteredClasses.map((classItem) => classItem.Term);
    const uniqueTerms = Array.from(new Set(allTerms));
    uniqueTerms.reverse();
    return [
      { label: "All Terms", value: "" },
      ...uniqueTerms.map((term) => ({ label: term, value: term })),
    ];
  }, [classInfo, selectedInstructor, sortBy]);

  const instructorOptions = React.useMemo(() => {
    const filteredClasses =
      sortBy === "instructor"
        ? classInfo
        : classInfo.filter(
            (c) =>
              !selectedTerm || selectedTerm === "" || c.Term === selectedTerm
          );
    const allInstructors = filteredClasses.map((c) => c.Instructors);
    const uniqueInstructors = Array.from(new Set(allInstructors));
    return [
      { label: "All Instructors", value: "" },
      ...uniqueInstructors.map((instructor) => ({
        label: instructor,
        value: instructor,
      })),
    ];
  }, [classInfo, selectedTerm, sortBy]);

  // Enhanced instructor ratings query with loading state management
  const {
    data: instrRatings,
    isFetching: isRatingsFetching,
    isError: ratingsError,
  } = useQuery({
    queryKey: ["instructorRatings", selectedInstructor],
    queryFn: () => fetchInstructorRatings(selectedInstructor!),
    enabled: Boolean(selectedInstructor && selectedInstructor !== ""),
    staleTime: 1000 * 60 * 5,
    retry: false, // Don't retry on 500 errors
  });

  // Update the ratings cache when new data comes in
  React.useEffect(() => {
    if (selectedInstructor && selectedInstructor !== "") {
      if (instrRatings !== undefined) {
        setInstructorRatingsCache((prev) => ({
          ...prev,
          [selectedInstructor]: instrRatings,
        }));
      } else if (ratingsError) {
        setInstructorRatingsCache((prev) => ({
          ...prev,
          [selectedInstructor]: null,
        }));
      }
    }
  }, [selectedInstructor, instrRatings, ratingsError]);

  // Effect to manage delayed loading indicator
  React.useEffect(() => {
    if (isRatingsFetching && selectedInstructor && selectedInstructor !== "") {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a timeout to show loading indicator after a delay
      // This creates a "natural" threshold based on user interaction patterns
      loadingTimeoutRef.current = setTimeout(() => {
        setShowDelayedLoading(true);
      }, 300); // Small delay to avoid flashing for quick requests
    } else {
      // Clear timeout and hide loading when request completes
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setShowDelayedLoading(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isRatingsFetching, selectedInstructor]);

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

  // Check if the third column has a selection
  const hasThirdColumnSelection = React.useMemo(() => {
    if (sortBy === "instructor") {
      return selectedTerm !== null;
    } else {
      return selectedInstructor !== null;
    }
  }, [sortBy, selectedTerm, selectedInstructor]);

  // Check if button should be enabled
  const isButtonEnabled = React.useMemo(() => {
    return selectedClass && hasThirdColumnSelection && addedCharts.length < 3;
  }, [selectedClass, hasThirdColumnSelection, addedCharts.length]);

  const handleAddClass = () => {
    if (!isButtonEnabled) return;

    const usedColors = addedCharts.map((c) => c.color);
    const color =
      CLASS_COLORS.find((col) => !usedColors.includes(col)) || CLASS_COLORS[0];
    if (!selectedClass) return;

    const { data } = { data: currentChartData };
    const numeric = data.filter((d) => GRADE_POINTS[d.grade] != null);
    const totalPts = numeric.reduce(
      (s, { grade, count }) => s + GRADE_POINTS[grade] * count,
      0
    );
    const totalCount = numeric.reduce((s, { count }) => s + count, 0);
    const avgGPA = totalCount ? totalPts / totalCount : 0;

    const id = `${Date.now()}`;
    const ratingSnapshot =
      selectedInstructor && selectedInstructor !== ""
        ? instructorRatingsCache[selectedInstructor]
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

  const handleRemoveChart = (id: string) => {
    setAddedCharts((prev) => prev.filter((chart) => chart.id !== id));
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry, index) => {
          const chart = addedCharts.find((c) => c.id === entry.dataKey);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{chart?.label}</span>
                <span className="text-xs text-muted-foreground">
                  {chart?.instructor && chart.instructor !== ""
                    ? chart.instructor
                    : "All Instructors"}
                  {chart?.term && chart.term !== ""
                    ? ` • ${chart.term}`
                    : " • All Terms"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const screenshotRef = React.useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (!screenshotRef.current) return;
    const canvas = await html2canvas(screenshotRef.current);
    const link = document.createElement("a");
    link.download = "slugtistics-screenshot.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <TooltipProvider>
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
            <Button variant="outline" size="sm" onClick={handleDarkModeToggle}>
              {internalDarkMode ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScreenshot}
              title="Download Screenshot"
            >
              <Download className="h-4 w-4 text-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div
        ref={screenshotRef}
        className="flex-1 p-6 flex flex-col overflow-y-auto"
      >
        <div className="space-y-6 flex-1 flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Class Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
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
                    isClearable={true}
                  />
                </div>

                <div className="w-[300px] min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <ReactSelect
                      options={[
                        { value: "instructor", label: "Select by Instructor" },
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
                      styles={createSelectStyles(internalDarkMode)}
                      className="flex-1"
                    />
                  </div>
                </div>

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
                      onChange={(opt) => {
                        const newInstructor =
                          (opt as ClassOption)?.value ?? null;
                        setSelectedInstructor(newInstructor);
                        // Auto-select "All Terms" when instructor is selected
                        setSelectedTerm("");
                      }}
                      placeholder="Instructor"
                      isDisabled={instructorOptions.length === 0}
                      styles={createSelectStyles(internalDarkMode)}
                      isClearable={true}
                    />
                  </div>
                ) : (
                  <div className="w-[300px] min-w-[150px]">
                    <ReactSelect
                      options={termOptions}
                      value={
                        selectedTerm !== null
                          ? termOptions.find((o) => o.value === selectedTerm)
                          : null
                      }
                      onChange={(opt) => {
                        const newTerm = (opt as ClassOption)?.value ?? null;
                        setSelectedTerm(newTerm);
                        // Auto-select "All Instructors" when term is selected
                        setSelectedInstructor("");
                      }}
                      placeholder="Term"
                      isDisabled={termOptions.length === 0}
                      styles={createSelectStyles(internalDarkMode)}
                      isClearable={true}
                    />
                  </div>
                )}

                {sortBy === "instructor" ? (
                  <div className="w-[300px] min-w-[150px]">
                    <ReactSelect
                      options={termOptions}
                      value={
                        selectedTerm !== null
                          ? termOptions.find((o) => o.value === selectedTerm)
                          : null
                      }
                      onChange={(opt) =>
                        setSelectedTerm((opt as ClassOption)?.value ?? null)
                      }
                      placeholder="Term"
                      // Removed the disabling condition - third dropdown is always enabled
                      isDisabled={termOptions.length === 0}
                      styles={createSelectStyles(internalDarkMode)}
                      isClearable={true}
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
                      // Removed the disabling condition - third dropdown is always enabled
                      isDisabled={instructorOptions.length === 0}
                      styles={createSelectStyles(internalDarkMode)}
                      isClearable={true}
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <Button
                    onClick={handleAddClass}
                    disabled={!isButtonEnabled}
                    variant={isButtonEnabled ? "default" : "muted"}
                    size={"addclass"}
                  >
                    Add Class
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
            <Card className="xl:col-span-2 flex flex-col">
              <CardHeader>
                <CardTitle>Grade Distribution Comparison</CardTitle>
                <CardDescription>
                  Percentage distribution of grades across selected courses
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
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend content={<CustomLegend />} />
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg text-foreground font-semibold">
                  Course Summary
                </h3>
                <Badge variant="secondary">{addedCharts.length}/3</Badge>
              </div>
              {addedCharts.map((chart) => {
                // Get current ratings from cache for this instructor
                const currentRatings =
                  chart.instructor && chart.instructor !== ""
                    ? instructorRatingsCache[chart.instructor]
                    : undefined;

                // Check if we're currently loading data for this instructor
                const isCurrentlyLoading =
                  chart.instructor === selectedInstructor &&
                  selectedInstructor &&
                  selectedInstructor !== "" &&
                  isRatingsFetching;

                // Check if we have an error for this instructor
                const hasCurrentError =
                  chart.instructor === selectedInstructor &&
                  selectedInstructor &&
                  selectedInstructor !== "" &&
                  ratingsError;

                // Create updated chart with current ratings from cache
                const updatedChart = {
                  ...chart,
                  ratingSnapshot:
                    currentRatings !== undefined
                      ? currentRatings
                      : chart.ratingSnapshot,
                };

                return (
                  <SummaryCard
                    key={chart.id}
                    chart={updatedChart}
                    onRemove={handleRemoveChart}
                    isLoadingRatings={isCurrentlyLoading}
                    hasRatingsError={hasCurrentError}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
