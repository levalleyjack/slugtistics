import * as React from "react";
import ReactSelect from "react-select";
import { MenuList } from "@/components/MenuList";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const route = "http://127.0.0.1:8080/";

type ClassOption = { label: string; value: string };
type ClassInfo = {
  SubjectCatalogNbr: string;
  Term: string;
  Instructors: string;
  Grades: Record<string, number | null>;
};

interface AddedChart {
  id: string;
  label: string;
  instructor: string | null;
  term: string | null;
  data: { grade: string; count: number }[];
  avgGPA: number;
  color: string;
}

interface InstructorRatings {
  avg_rating: number;
  difficulty_level: number;
  would_take_again_percent: number;
  num_ratings: number;
}

export interface Rating {
  overall_rating?: number;
  difficulty_rating?: number;
  would_take_again?: boolean;
  date?: string;
  thumbs_up?: number;
}

const GRADE_POINTS: Record<string, number> = {
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

const CLASS_COLORS = ["#B3EBF2", "#FF6961", "#90EE90", "#FFEE8C"];

async function fetchRatings(subject: string): Promise<Rating[]> {
  const res = await fetch(`${route}ratings/${subject}`);
  if (!res.ok) throw new Error("Failed to load ratings");
  return res.json();
}

async function fetchClasses(): Promise<ClassOption[]> {
  const res = await fetch(route + "classes");
  if (!res.ok) throw new Error("Failed to load classes");
  const data: string[] = await res.json();
  return data.map((cls) => ({ label: cls, value: cls }));
}

async function fetchClassInfo(subject: string): Promise<ClassInfo[]> {
  const res = await fetch(route + `class-info/${subject}`);
  if (!res.ok) throw new Error("Failed to load class info");
  return res.json();
}

async function fetchInstructorRatings(
  instructor: string
): Promise<InstructorRatings> {
  const res = await fetch(
    `https://api.slugtistics.com/api/pyback/instructor_ratings?instructor=${encodeURIComponent(
      instructor
    )}&course=`
  );
  if (!res.ok) throw new Error("Failed to load instructor ratings");
  return res.json();
}

export function HomePage() {
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

  // 1) load class options
  const { data: classOptions = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    staleTime: Infinity,
  });

  // 2) default “Sum: course…” on first load
  React.useEffect(() => {
    if (classOptions.length && !selectedClass) {
      const def =
        classOptions.find((o) =>
          o.label.toLowerCase().includes("sum: course of everything at ucsc")
        ) || classOptions[0];
      setSelectedClass(def);
    }
  }, [classOptions, selectedClass]);

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
        !selectedInstructor || classItem.Instructors === selectedInstructor
    );
    const allTerms = relevantClasses.map((classItem) => classItem.Term);
    const uniqueTerms = Array.from(new Set(allTerms));
    const options = [
      { label: "All Terms", value: "" },
      ...uniqueTerms.map((term) => ({ label: term, value: term })),
    ];
    return options;
  }, [classInfo, selectedInstructor]);

  const instructorOptions = React.useMemo(() => {
    const all = classInfo
      .filter((c) => !selectedTerm || c.Term === selectedTerm)
      .map((c) => c.Instructors);
    const uniq = Array.from(new Set(all));
    return [
      { label: "All Instructors", value: "" },
      ...uniq.map((i) => ({ label: i, value: i })),
    ];
  }, [classInfo, selectedTerm]);

  // fetch instructor ratings
  const { data: instrRatings } = useQuery({
    queryKey: ["instructorRatings", selectedInstructor],
    queryFn: () => fetchInstructorRatings(selectedInstructor!),
    enabled: Boolean(selectedInstructor),
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
        !selectedInstructor || row.Instructors === selectedInstructor;
      const okTerm = !selectedTerm || row.Term === selectedTerm;
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

  // 6) auto-add default on first data load
  React.useEffect(() => {
    if (currentChartData.some((d) => d.count > 0) && addedCharts.length === 0) {
      handleAddClass();
    }
  }, [currentChartData]);

  // — handlers —
  const handleAddClass = () => {
    if (addedCharts.length >= 4) return;
    if (!selectedClass) return;
    const { data } = { data: currentChartData };
    const numeric = data.filter((d) => GRADE_POINTS[d.grade] != null);
    const totalPts = numeric.reduce(
      (s, { grade, count }) => s + GRADE_POINTS[grade] * count,
      0
    );
    const totalCount = numeric.reduce((s, { count }) => s + count, 0);
    const avgGPA = totalCount ? totalPts / totalCount : 0;
    const color = CLASS_COLORS[addedCharts.length % CLASS_COLORS.length];

    const id = `${Date.now()}`;
    setAddedCharts((prev) => [
      ...prev,
      {
        id,
        label: selectedClass.label,
        instructor: selectedInstructor,
        term: selectedTerm,
        data: currentChartData,
        avgGPA,
        color,
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

  return (
    <div className="p-8 space-y-4">
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
                styles={{ control: (p) => ({ ...p, minHeight: 50 }) }}
              />
            </div>
            {/* Instructor */}
            <div className="w-[300px] min-w-[150px]">
              <ReactSelect
                options={instructorOptions}
                value={
                  selectedInstructor
                    ? instructorOptions.find(
                        (o) => o.value === selectedInstructor
                      )
                    : instructorOptions[0]
                }
                onChange={(opt) =>
                  setSelectedInstructor((opt as ClassOption)?.value || null)
                }
                placeholder="Instructor"
                styles={{ control: (p) => ({ ...p, minHeight: 50 }) }}
              />
            </div>
            {/* Term */}
            <div className="w-[300px] min-w-[150px]">
              <ReactSelect
                options={termOptions}
                value={
                  selectedTerm
                    ? termOptions.find((o) => o.value === selectedTerm)
                    : termOptions[0]
                }
                onChange={(opt) =>
                  setSelectedTerm((opt as ClassOption)?.value || null)
                }
                placeholder="Term"
                styles={{ control: (p) => ({ ...p, minHeight: 50 }) }}
              />
            </div>
            {/* Add */}
            <div className="flex items-center">
              <Button onClick={handleAddClass} variant="outline">
                Add Class
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-1">
        {addedCharts.map((ch) => (
          <Card
            key={ch.id}
            className="w-[300px] border-t-4"
            style={{ borderTopColor: ch.color }}
          >
            <CardHeader className="flex justify-between items-baseline">
              <CardTitle className="text-sm">{ch.label}</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(ch.id)}
              >
                Delete
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs">
                {ch.instructor ?? "All"} / {ch.term ?? "All"}
              </p>
              <p className="text-sm font-medium">
                Avg GPA: {ch.avgGPA.toFixed(2)}
              </p>
              {ch.instructor &&
                instrRatings &&
                ch.instructor === selectedInstructor && (
                  <div className="space-y-0.5 mt-1 text-xs">
                    <p>Overall Rating: {instrRatings.avg_rating.toFixed(1)}</p>
                    <p>
                      Difficulty: {instrRatings.difficulty_level.toFixed(1)}
                    </p>
                    <p>Take Again: {instrRatings.would_take_again_percent}%</p>
                    <p>Num Ratings: {instrRatings.num_ratings}</p>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Combined Bar Chart */}
      <Card className="p-2">
        <CardContent className="px-2 py-1">
          <div className="h-[400px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={combinedData}
                  margin={{ top: 5, bottom: 5, left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {addedCharts.map((ch) => (
                    <Bar
                      key={ch.id}
                      dataKey={ch.id}
                      name={ch.label}
                      fill={ch.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
