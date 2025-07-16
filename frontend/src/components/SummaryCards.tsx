import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface SummaryCardsProps {
  addedCharts: AddedChart[];
  onRemove: (id: string) => void;
}

export function SummaryCards({ addedCharts, onRemove }: SummaryCardsProps) {
  const getColorHue = (
    value: number,
    metric: "gpa" | "rating" | "difficulty" | "takeAgain"
  ): number => {
    switch (metric) {
      case "gpa":
        // 2.0 is worst, 4.0 is best → green at 4, red at 2
        return Math.max(0, Math.min(120, ((value - 2) / 2) * 120));
      case "rating":
        // 0 to 5: green at 5, red at 0
        return Math.max(0, Math.min(120, (value / 5) * 120));
      case "difficulty":
        // invert: red at 5 (hard), green at 0 (easy)
        return Math.max(0, Math.min(120, (1 - value / 5) * 120));
      case "takeAgain":
        // 0 to 100: green at 100, red at 0
        return Math.max(0, Math.min(120, (value / 100) * 120));
      default:
        return 60; // neutral hue fallback
    }
  };

  // helper to get a hue between red (0) and green (120) based on [0…max]
  const getHue = (value: number, max: number) =>
    Math.round((value / max) * 120);

  return (
    <div className="flex flex-wrap gap-4 w-[30%]">
      {addedCharts.map((ch) => (
        <Card
          key={ch.id}
          className="w-full border-t-4"
          style={{ borderTopColor: ch.color }}
        >
          <CardHeader className="flex justify-between items-baseline">
            <CardTitle className="text-3xl font-bold">{ch.label}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => onRemove(ch.id)}>
              Delete
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-lg font-medium text-muted-foreground">
              {ch.instructor ?? "All"} / {ch.term ?? "All"}
            </p>

            {/* Main metrics - GPA and Overall Rating */}
            <div className="flex gap-4">
              {/* Avg GPA (0–4) - Large and prominent */}
              <div
                className="p-3 rounded border-l-4 flex-1"
                style={{
                  borderColor: `hsl(${getColorHue(
                    ch.avgGPA,
                    "gpa"
                  )}, 70%, 50%)`,
                }}
              >
                <p className="font-semibold text-sm text-muted-foreground">
                  Avg GPA
                </p>
                <p className="text-4xl font-bold">
                  {ch.avgGPA.toFixed(2)}
                  <span className="text-lg text-gray-500"> / 4</span>
                </p>
              </div>

              {/* Overall Rating - Large and prominent */}
              {ch.instructor && ch.ratingSnapshot && (
                <div
                  className="p-3 rounded border-l-4 flex-1"
                  style={{
                    borderColor: `hsl(${getHue(
                      ch.ratingSnapshot.avg_rating,
                      5
                    )}, 70%, 50%)`,
                  }}
                >
                  <p className="font-semibold text-sm text-muted-foreground">
                    Professor Rating
                  </p>
                  <p className="text-4xl font-bold">
                    {ch.ratingSnapshot.avg_rating.toFixed(1)}{" "}
                    <span className="text-lg text-gray-500">/ 5</span>
                  </p>
                </div>
              )}
            </div>

            {/* Secondary RMP metrics - smaller */}
            {ch.instructor && ch.ratingSnapshot && (
              <div className="border rounded-lg p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Additional RateMyProfessor Data
                </p>
                <div className="flex gap-2">
                  {/* Difficulty */}
                  <div
                    className="flex-1 p-2 rounded border-l-4"
                    style={{
                      borderLeftColor: `hsl(${
                        120 - getHue(ch.ratingSnapshot.difficulty_level, 5)
                      }, 70%, 50%)`,
                    }}
                  >
                    <p className="font-semibold text-xs">Difficulty</p>
                    <p className="text-lg">
                      {ch.ratingSnapshot.difficulty_level.toFixed(1)}{" "}
                      <span className="text-sm text-gray-500">/ 5</span>
                    </p>
                  </div>

                  {/* Take Again */}
                  <div
                    className="flex-1 p-2 rounded border-l-4"
                    style={{
                      borderLeftColor: `hsl(${getHue(
                        ch.ratingSnapshot.would_take_again_percent,
                        100
                      )}, 70%, 50%)`,
                    }}
                  >
                    <p className="font-semibold text-xs">Take Again</p>
                    <p className="text-lg">
                      {ch.ratingSnapshot.would_take_again_percent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
