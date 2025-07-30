import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

interface InstructorRatings {
  avg_rating: number;
  difficulty_level: number;
  would_take_again_percent: number;
  num_ratings: number;
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

interface SummaryCardProps {
  chart: AddedChart;
  onRemove: (id: string) => void;
  isLoadingRatings?: boolean;
  hasRatingsError?: boolean;
}

function SummaryCard({
  chart,
  onRemove,
  isLoadingRatings = false,
  hasRatingsError = false,
}: SummaryCardProps) {
  const getColorHue = (value: number, metric: string) => {
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

  // Check if we have instructor data but no ratings (still loading or error)
  const hasInstructor = chart.instructor && chart.instructor !== "";
  const showLoadingOrError = hasInstructor && !chart.ratingSnapshot;

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
              CLASS GPA
            </p>
            <p className="text-2xl font-bold">
              {chart.avgGPA.toFixed(2)}
              <span className="text-sm text-muted-foreground ml-1">/ 4</span>
            </p>
          </div>

          {hasInstructor && (
            <div
              className="p-3 rounded-lg border-l-4 bg-muted/50"
              style={{
                borderLeftColor: chart.ratingSnapshot
                  ? `hsl(${getColorHue(
                      chart.ratingSnapshot.avg_rating,
                      "rating"
                    )}, 70%, 50%)`
                  : "hsl(200, 20%, 50%)",
              }}
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                RateMyProfessor Rating
              </p>
              {showLoadingOrError ? (
                isLoadingRatings ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : hasRatingsError ? (
                  <p className="text-sm text-muted-foreground">Not found</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not found</p>
                )
              ) : chart.ratingSnapshot ? (
                <p className="text-2xl font-bold">
                  {chart.ratingSnapshot.avg_rating.toFixed(1)}
                  <span className="text-sm text-muted-foreground ml-1">
                    / 5
                  </span>
                </p>
              ) : null}
            </div>
          )}
        </div>

        {hasInstructor && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Professor Difficulty
              </p>
              {showLoadingOrError ? (
                isLoadingRatings ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not found</p>
                )
              ) : chart.ratingSnapshot ? (
                <p className="text-lg font-semibold">
                  {chart.ratingSnapshot.difficulty_level.toFixed(1)}
                  <span className="text-sm text-muted-foreground ml-1">
                    / 5
                  </span>
                </p>
              ) : null}
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Professor Take Again
              </p>
              {showLoadingOrError ? (
                isLoadingRatings ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not found</p>
                )
              ) : chart.ratingSnapshot ? (
                <p className="text-lg font-semibold">
                  {chart.ratingSnapshot.would_take_again_percent.toFixed(1)}%
                </p>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
