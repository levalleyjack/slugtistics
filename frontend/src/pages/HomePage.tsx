import * as React from "react"
import ReactSelect from "react-select";
import { MenuList } from '@/components/MenuList';
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, CartesianGrid, XAxis } from "recharts"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import MultipleSelector, { Option } from "@/components/ui/multiselect"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { s } from "vite/dist/node/types.d-aGj9QkWt";

// Chart data & config
const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop:  97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
]
const chartConfig = {
  views:   { label: "Page Views" },
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile:  { label: "Mobile",  color: "hsl(var(--chart-2))" },
} as const
//route
const route = "http://127.0.0.1:8080/"


// ---- types ----
type ClassOption = { label: string; value: string }
type ClassInfo = {
  SubjectCatalogNbr: string
  Term: string
  Instructors: string
  // Grades now include A+…F, P, NP, W
  Grades: Record<string, number | null>
}

async function fetchClasses(): Promise<ClassOption[]> {
  const res = await fetch(route + "classes")
  if (!res.ok) throw new Error("Failed to load classes")
  const data: string[] = await res.json()
  return data.map((cls) => ({ label: cls, value: cls }))
}

async function fetchClassInfo(subject: string): Promise<ClassInfo[]> {
  const res = await fetch(route + `class-info/${subject}`)
  if (!res.ok) throw new Error("Failed to load class info")
  return res.json()
}




export function HomePage() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop")
  const [selectedClass, setSelectedClass] = React.useState<ClassOption | null>(null)
  const [selectedInstructor, setSelectedInstructor] = React.useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null)
  
// 1) load all classes
const { data: classOptions = [], isLoading: loadingClasses } = useQuery({
  queryKey: ["classes"],
  queryFn: fetchClasses,
  staleTime: Infinity,
})
  

  // 2) load info for the chosen class
  const { data: classInfo = [], isLoading: loadingInfo } = useQuery({
    queryKey: ["classInfo", selectedClass?.value],
    queryFn: () => fetchClassInfo(selectedClass!.value),
    enabled: Boolean(selectedClass),
  })

  // 3) extract unique instructors & terms
  const termOptions = React.useMemo(() => {
    const filtered = classInfo.filter((c) =>
      !selectedInstructor || c.Instructors === selectedInstructor
    )
    const set_ = new Set(filtered.map((c) => c.Term))
    return Array.from(set_).map((label) => ({ label, value: label }))
  }, [classInfo, selectedInstructor])
  
  const instructorOptions = React.useMemo(() => {
    const filtered = classInfo.filter((c) =>
      !selectedTerm || c.Term === selectedTerm
    )
    const set_ = new Set(filtered.map((c) => c.Instructors))
    return Array.from(set_).map((label) => ({ label, value: label }))
  }, [classInfo, selectedTerm])

  const gradeChartData = React.useMemo(() => {
    // initialize every grade bucket to 0
    const buckets: Record<string, number> = {
      "A+": 0, A: 0, "A-": 0,
      "B+": 0, B: 0, "B-": 0,
      "C+": 0, C: 0, "C-": 0,
      "D+": 0, D: 0, "D-": 0,
      F:  0,
      P:  0, NP: 0, W: 0,
    };

    // sum up only the classInfo rows matching both filters
    classInfo.forEach((row) => {
      if (
        (!selectedInstructor || row.Instructors === selectedInstructor) &&
        (!selectedTerm       || row.Term        === selectedTerm)
      ) {
        Object.entries(row.Grades).forEach(([grade, count]) => {
          buckets[grade] = (buckets[grade] || 0) + (count ?? 0);
        });
      }
    });

    // convert to [{ grade, count }, …]
    return Object.entries(buckets).map(([grade, count]) => ({
      grade,
      count,
    }));
  }, [classInfo, selectedInstructor, selectedTerm]);

  


  
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")


  const total = React.useMemo(() => ({
    desktop: chartData.reduce((sum, d) => sum + d.desktop, 0),
    mobile:  chartData.reduce((sum, d) => sum + d.mobile, 0),
  }), [])

  return (
    <div className="p-8 space-y-8">
      {/* — Multi-Select Card — */}
      <Card>
        <CardHeader>
          <CardTitle>Search Class</CardTitle>
          <CardDescription>Select one or more classes</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="flex items-center justify-between mb-4 w-full gap-4">
  {/* Class Select */}
  <div className="w-[800px]">
    <ReactSelect
      isLoading={loadingClasses}
      options={classOptions}
      value={selectedClass}
      components={{ MenuList }}
      onChange={(option) => setSelectedClass(option)}
      placeholder="Select class..."
      className="min-h-1/2"
      styles={{
        control: (provided) => ({
          ...provided,
          minHeight: '50px',
        }),
      }}
    />
  </div>

  {/* Term (Quarter) Select */}
  <div className="w-[400px]">
  <ReactSelect
  isLoading={loadingInfo}
  options={instructorOptions}
  value={instructorOptions.find(opt => opt.value === selectedInstructor) || null}
  onChange={(option) => setSelectedInstructor(option?.value ?? null)}
  placeholder="Select instructor..."
  className="min-h-1/2"
  isClearable={true}
  styles={{ control: (provided) => ({ ...provided, minHeight: '50px' }) }}
/>

  </div>

  {/* Instructor Select */}
  <div className="w-[400px]">
  <ReactSelect
  isLoading={loadingInfo}
  options={termOptions}
  value={termOptions.find(opt => opt.value === selectedTerm) || null}
  onChange={(option) => setSelectedTerm(option?.value ?? null)}
  placeholder="Select term..."
  className="min-h-1/2"
  isClearable={true}
  styles={{ control: (provided) => ({ ...provided, minHeight: '50px' }) }}
/>

  </div>

  <Button variant="outline">Add Class</Button>
</div>
  </CardContent>
</Card>

      {/* — Chart Card — */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-stretch border-b p-0">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              {selectedClass?.label ?? "—"} 
              {selectedInstructor && ` / ${selectedInstructor}`} 
              {selectedTerm       && ` / ${selectedTerm}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer className="h-[250px] w-full" config={{ count: { label: "Students" } }}>
            <BarChart data={gradeChartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="grade"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                  content={<ChartTooltipContent nameKey="count" />}
                />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
