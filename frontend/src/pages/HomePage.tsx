'use client'

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
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
import MultipleSelector, { Option } from "@/components/ui/multiselect"
import { toast } from "sonner"

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

// Fetch function
const fetchClassOptions = async (): Promise<Option[]> => {
  const res = await fetch('https://api.slugtistics.com/api/SubjectCatalogNbr')
  if (!res.ok) throw new Error('Failed to fetch')
  const data: string[] = await res.json()
  return data.map((label, index) => ({ label, value: index.toString() }))
}



export function HomePage() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("desktop")
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([])

  const { data: options = [], isLoading, isError } = useQuery({
    queryKey: ['classOptions'],
    queryFn: fetchClassOptions,
    staleTime: Infinity,
  })
  
  const handleSearch = React.useCallback(
    (value: string) =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(value.toLowerCase())
      ),
    [options]
  );
  


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
        <div className="flex items-center justify-between mb-4 w-full">
          <div className="flex items-center w-4/12">
        <MultipleSelector
          options={options}
          onSearchSync={handleSearch}
          placeholder="Search for a class..."
          loadingIndicator={
            isLoading ? (
              <p className="text-center text-muted-foreground py-2">Loading...</p>
            ) : null
          }
          emptyIndicator={
            <p className="text-center text-muted-foreground py-2">No results found.</p>
          }
          disabled={isError}
        />
        </div>
        <Select>
      <SelectTrigger className="w-2/12">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select an option</SelectLabel>
            <SelectItem value="apple">By Instructor</SelectItem>
            <SelectItem value="blueberry">By Quarter</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
      <SelectTrigger className="w-3/12">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select an option</SelectLabel>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
      <SelectTrigger className="w-2/12">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select an option</SelectLabel>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="outline">Add Class</Button>
        </div>
        </CardContent>
      </Card>

      {/* — Chart Card — */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-stretch border-b p-0">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Bar Chart - Interactive</CardTitle>
            <CardDescription>Showing total visitors</CardDescription>
          </div>
          <div className="flex">
            {(["desktop", "mobile"] as const).map((key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })
                    }
                  />
                }
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
