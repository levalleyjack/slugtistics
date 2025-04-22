import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import * as React from "react"
import { ComboBox } from "@/components/ui/combobox"
import { useQuery, QueryClient } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ClassItem {
  value: string
  label: string
}

// Fetcher for TanStack Query
async function fetchClasses(): Promise<ClassItem[]> {
  const res = await fetch('classes')
  if (!res.ok) {
    throw new Error('Failed to fetch classes')
  }
  return res.json()
}

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 }
]

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]



const chartConfig = {
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig


export function HomePage() {
  
    const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("desktop")
    const [selectedClass, setSelectedClass] =
    React.useState<string>('')
    
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  )

  const {
    data: classes = [],
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
    staleTime: 5 * 60000,
    cacheTime: 30 * 60000,
    retry: 1,
  })
  
  {/* API */}
  
  const route = "https://api.slugtistics.com/api/";

    // Access the clien
  const queryClient = new QueryClient()
  // Queries


  

  return (
    <div className="p-8 space-y-8">
    {/* Search Card */}
    <Card>
      <CardHeader>
        <CardTitle>Search Framework</CardTitle>
        <CardDescription>Select a framework from the list</CardDescription>
      </CardHeader>
      <CardContent>
          {isLoading ? (
            <div>Loading classes…</div>
          ) : isError ? (
            <div>Error: {error.message}</div>
          ) : (
            <ComboBox
              items={classes}
              value={selectedClass}
              onValueChange={setSelectedClass}
              placeholder="Select a class..."
            />
          )}
        </CardContent>
    </Card>

      {/* Chart Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-stretch border-b p-0">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Bar Chart - Interactive</CardTitle>
            <CardDescription>Showing total visitors for the last 3 months</CardDescription>
          </div>
          <div className="flex">
            {(["desktop", "mobile"] as (keyof typeof chartConfig)[]).map(
              (chart) => (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg font-bold leading-none sm:text-3xl">
                    {total[chart].toLocaleString()}
                  </span>
                </button>
              )
            )}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
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

export default HomePage;
