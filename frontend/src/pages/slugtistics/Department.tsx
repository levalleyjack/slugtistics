import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  BarChart3,
  PieChart,
  Settings,
  Download,
  BookOpen,
  Users,
  GraduationCap,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactSelect from "react-select";
import { useQuery, useMutation } from "@tanstack/react-query";

import { createSelectStyles } from "@/components/Slugtistics/reactSelectStyles";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import CreateDepartmentDialog from "@/components/Slugtistics/DepartmentDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
];

interface Department {
  id: string;
  name: string;
  description: string;
  classes: string[];
  color: string;
  data: GradeDistribution[];
  avgGPA: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
}

interface AddedChart {
  id: string;
  type: "department" | "class";
  label: string;
  instructor: string | null;
  term: string | null;
  data: GradeDistribution[];
  avgGPA: number;
  color: string;
  department?: Department;
}

interface ClassOption {
  label: string;
  value: string;
}

const GRADE_POINTS: { [key: string]: number } = {
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
  F: 0.0,
};

const calculateAvgGPA = (gradeDistribution: GradeDistribution[]): number => {
  const numeric = gradeDistribution.filter(
    (d) => GRADE_POINTS[d.grade] != null
  );
  const totalPts = numeric.reduce(
    (sum, { grade, count }) => sum + GRADE_POINTS[grade] * count,
    0
  );
  const totalCount = numeric.reduce((sum, { count }) => sum + count, 0);
  return totalCount ? totalPts / totalCount : 0;
};

const DEFAULT_DEPARTMENTS: Department[] = [];

const route = "https://api.slugtistics.com/api/";

const useLocalStorageDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const stored = localStorage.getItem("departments");
      return stored ? JSON.parse(stored) : DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("departments", JSON.stringify(departments));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [departments]);

  return [departments, setDepartments] as const;
};

export default function DepartmentGradeDashboard() {
  const CLASS_COLORS = ["#fdc086", "#7fc97f", "#beaed4", "#ffff99"];
  const [departments, setDepartments] = useLocalStorageDepartments();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"bar" | "pie">("bar");
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

  //API functions
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

  async function fetchDepartmentGrades(
    department: Department
  ): Promise<GradeDistribution[]> {
    const response = await fetch(route + "department-grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classes: department.classes,
      }),
    });

    if (!response.ok) {
      throw Error("Failed to fetch department grades");
    }

    return response.json(); // Returns { grade: string; count: number }[]
  }

  const gradesMutation = useMutation({
    mutationFn: fetchDepartmentGrades,
  });

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

  /// DEPARTMENT SECTION

  const handleCreateDepartment = (departmentData: {
    name: string;
    description: string;
    classes: string[];
  }) => {
    // Create a temporary department object to pass to the mutation
    const tempDepartment: Department = {
      id: "",
      name: departmentData.name,
      description: departmentData.description,
      classes: departmentData.classes,
      color: "",
      avgGPA: 0,
      gradeDistribution: [],
    };

    // Fetch grades using the department object
    gradesMutation.mutate(tempDepartment, {
      onSuccess: (data: GradeDistribution[]) => {
        const calculatedGPA = calculateAvgGPA(data);

        const newDept: Department = {
          id: Date.now().toString(),
          name: departmentData.name,
          description: departmentData.description,
          classes: departmentData.classes,
          color: COLORS[departments.length % COLORS.length],
          avgGPA: calculatedGPA,
          gradeDistribution: data,
        };

        setDepartments([...departments, newDept]);
      },
      onError: (error) => {
        console.error("Failed to fetch grades for new department:", error);
      },
    });
  };

  const handleAddDepartmentToChart = (dept: Department) => {
    if (addedCharts.length >= 4) return;
    const usedColors = addedCharts.map((c) => c.color);
    const color = COLORS.find((col) => !usedColors.includes(col)) || COLORS[0];

    const chartItem: AddedChart = {
      id: `dept-${dept.id}-${Date.now()}`,
      type: "department",
      label: dept.name,
      instructor: null,
      term: null,
      data: dept.gradeDistribution, // Use existing data from department
      avgGPA: dept.avgGPA,
      color: color,
      department: dept,
    };

    setAddedCharts([...addedCharts, chartItem]);
  };

  const handleRemoveChart = (id: string) => {
    setAddedCharts(addedCharts.filter((item) => item.id !== id));
  };

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
        Object.entries(row.Grades).forEach(([grade, count]) => {
          buckets[grade] += Number(count || 0); // Convert "6" → 6, null → 0
        });
      }
    });

    return Object.entries(buckets)
      .filter(([, count]) => count > 0)
      .map(([grade, count]) => ({ grade, count }));
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
    return selectedClass && hasThirdColumnSelection && addedCharts.length < 4;
  }, [selectedClass, hasThirdColumnSelection, addedCharts.length]);

  const handleAddClass = () => {
    if (!isButtonEnabled || !selectedClass) return;

    const usedColors = addedCharts.map((c) => c.color);
    const color =
      CLASS_COLORS.find((col) => !usedColors.includes(col)) || CLASS_COLORS[0];

    const data = currentChartData;
    const avgGPA = calculateAvgGPA(data);

    const id = `class-${Date.now()}`;

    setAddedCharts((prev) => [
      ...prev,
      {
        id,
        type: "class",
        label: selectedClass.label,
        instructor: selectedInstructor === "" ? null : selectedInstructor,
        term: selectedTerm === "" ? null : selectedTerm,
        data: currentChartData,
        avgGPA,
        color,
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

  const handleDeleteDepartment = (
    departmentId: string,
    departmentName: string
  ) => {
    if (
      window.confirm(`Are you sure you want to delete "${departmentName}"?`)
    ) {
      setDepartments(departments.filter((dept) => dept.id !== departmentId));
    }
  };

  return (
    <TooltipProvider>
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
            {/*<ModeToggle></ModeToggle>*/}
          </div>
        </div>
      </header>

      <div className="mx-auto px-6 py-6 space-y-6">
        {/* Row 1: Department Groups and Individual Class Selection */}
        <div className="grid grid-cols-2 gap-6">
          {/* Department Management */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Department Groups</CardTitle>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Add Department
                </Button>
                <CreateDepartmentDialog
                  isOpen={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  onCreateDepartment={handleCreateDepartment}
                  availableClasses={classOptions}
                />
              </div>
            </CardHeader>
            <ScrollArea className="h-100 border p-4">
              <CardContent className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          {" "}
                          {/* Changed to justify-between */}
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: dept.color }}
                            />
                            <h4 className="font-medium">{dept.name}</h4>
                          </div>
                          {/* Add X button here */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleDeleteDepartment(dept.id, dept.name)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {dept.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {dept.classes.length} classes
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              GPA: {dept.avgGPA.toFixed(2)}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAddDepartmentToChart(dept)}
                            disabled={addedCharts.length >= 4}
                          >
                            Add to Chart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Individual Class Selection */}
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
                    styles={createSelectStyles()}
                    isClearable={true}
                  />
                </div>

                <div className="w-[300px] min-w-[150px]">
                  <div className="flex items-center gap-2">
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
                      styles={createSelectStyles()}
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
                      styles={createSelectStyles()}
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
                      styles={createSelectStyles()}
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
                      styles={createSelectStyles()}
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
                      styles={createSelectStyles()}
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
        </div>

        {/* Row 2: Grade Distribution Chart and Added Classes */}
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-9">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Grade Distribution Comparison</CardTitle>
                  <CardDescription>
                    Currently comparing {addedCharts.length} items (
                    {4 - addedCharts.length} slots remaining)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {addedCharts.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChart(item.id)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {addedCharts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No items selected for comparison
                  </h3>
                  <p className="text-sm">
                    Add departments or classes from above to start comparing
                    grade distributions
                  </p>
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={combinedData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="grade" className="text-sm" />
                      <YAxis className="text-sm" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      {addedCharts.map((item) => (
                        <Bar
                          key={item.id}
                          dataKey={item.id}
                          name={item.label}
                          fill={item.color}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Added Charts</CardTitle>
                <Badge variant="secondary">{addedCharts.length}/4</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {addedCharts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No charts added yet</p>
                </div>
              ) : (
                addedCharts.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <h4
                          className="font-medium text-xs leading-tight"
                          title={item.label}
                        >
                          {item.label}
                        </h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChart(item.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="text-xs h-4">
                          {item.type === "department" ? "Dept" : "Class"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">GPA</span>
                        <span className="font-medium">
                          {item.avgGPA.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">A-range</span>
                        <span className="font-medium">
                          {(() => {
                            const total = item.data.reduce(
                              (s, d) => s + d.count,
                              0
                            );
                            const aRangeCount = item.data
                              .filter((d) =>
                                ["A+", "A", "A-"].includes(d.grade)
                              )
                              .reduce((s, d) => s + d.count, 0);
                            return total
                              ? ((aRangeCount / total) * 100).toFixed(1)
                              : "0.0";
                          })()}
                          %
                        </span>
                      </div>
                      {item.type === "class" && (
                        <>
                          {item.instructor && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Instructor
                              </span>
                              <span className="font-medium text-right truncate max-w-40">
                                {item.instructor}
                              </span>
                            </div>
                          )}
                          {item.term && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Term
                              </span>
                              <span className="font-medium">{item.term}</span>
                            </div>
                          )}
                        </>
                      )}
                      {item.type === "department" && item.department && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Classes</span>
                          <span className="font-medium">
                            {item.department.classes.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
