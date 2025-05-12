import React, { useState, useMemo } from "react";
import he from "he";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns-tz";
import {
  ChevronDown,
  ChevronUp,
  School,
  Tag,
  ThumbsDown,
  ThumbsUp,
  ArrowRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Rating } from "../Constants";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";

const RatingCard = ({ overallRating, difficultyRating }) => {
  const getRatingColor = (score, type = "rating") => {
    if (type === "difficulty") {
      if (score <= 3) return "text-emerald-500";
      if (score <= 4) return "text-amber-500";
      return "text-rose-500";
    }
    if (score >= 4) return "text-emerald-500";
    if (score >= 3) return "text-amber-500";
    return "text-rose-500";
  };

  const getRatingBg = (score, type = "rating") => {
    if (type === "difficulty") {
      if (score <= 3) return "bg-emerald-50";
      if (score <= 4) return "bg-amber-50";
      return "bg-rose-50";
    }
    if (score >= 4) return "bg-emerald-50";
    if (score >= 3) return "bg-amber-50";
    return "bg-rose-50";
  };

  return (
    <div className="flex w-full gap-3 my-2">
      <div className={`flex-1 p-3 rounded-lg ${getRatingBg(overallRating, "rating")}`}>
        <div className={`text-3xl font-bold ${getRatingColor(overallRating, "rating")}`}>
          {overallRating.toFixed(1)}
        </div>
        <div className="text-xs text-slate-500 font-medium">Rating</div>
      </div>
      
      <div className={`flex-1 p-3 rounded-lg ${getRatingBg(difficultyRating, "difficulty")}`}>
        <div className={`text-3xl font-bold ${getRatingColor(difficultyRating, "difficulty")}`}>
          {difficultyRating.toFixed(1)}
        </div>
        <div className="text-xs text-slate-500 font-medium">Difficulty</div>
      </div>
    </div>
  );
};

const LoadingSkeleton = ({ courseCodes, filterBy }) => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-xl bg-slate-50 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 p-3 h-16 rounded-lg bg-slate-200"></div>
            <div className="flex-1 p-3 h-16 rounded-lg bg-slate-200"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-3"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-slate-200 rounded w-24"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
          </div>
          <div className="h-px bg-slate-200 w-full mb-3"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-slate-200 rounded w-12"></div>
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RatingsPanel = ({ professorName, currentClass, courseCodes, onClose }) => {
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState(currentClass);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  React.useMemo(() => {
    setFilterBy(currentClass);
  }, [currentClass]);

  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ["reviews", professorName, filterBy],
    queryFn: async () => {
      const response = await fetch(
        `https://api.slugtistics.com/api/pyback/instructor_ratings?instructor=${encodeURIComponent(
          professorName
        )}&course=${encodeURIComponent(filterBy === "all" ? "" : filterBy)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.all_ratings ?? [];
    },
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    if (!ratings?.length) {
      return { overall: 0, difficulty: 0, wouldTakeAgain: 0 };
    }

    const validOverall = ratings.filter((r) => r.overall_rating !== undefined);
    const validDifficulty = ratings.filter(
      (r) => r.difficulty_rating !== undefined
    );
    const validTakeAgain = ratings.filter(
      (r) => r.would_take_again !== undefined
    );

    return {
      overall: validOverall.length
        ? Number(
            (
              validOverall.reduce(
                (acc, r) => acc + (r.overall_rating ?? 0),
                0
              ) / validOverall.length
            ).toFixed(1)
          )
        : 0,
      difficulty: validDifficulty.length
        ? Number(
            (
              validDifficulty.reduce(
                (acc, r) => acc + (r.difficulty_rating ?? 0),
                0
              ) / validDifficulty.length
            ).toFixed(1)
          )
        : 0,
      wouldTakeAgain: validTakeAgain.length
        ? Number(
            (
              (validTakeAgain.filter((r) => r.would_take_again).length /
                validTakeAgain.length) *
              100
            ).toFixed(1)
          )
        : 0,
    };
  }, [ratings]);

  const processedRatings = useMemo(() => {
    return (
      ratings?.sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return (b.overall_rating ?? 0) - (a.overall_rating ?? 0);
          case "difficulty_rating":
            return (b.difficulty_rating ?? 0) - (a.difficulty_rating ?? 0);
          case "likes":
            return (b.thumbs_up ?? 0) - (a.thumbs_up ?? 0);
          default: {
            const dateA = new Date((a.date ?? "").replace(" ", "T")).valueOf();
            const dateB = new Date((b.date ?? "").replace(" ", "T")).valueOf();
            return dateB - dateA;
          }
        }
      }) ?? []
    );
  }, [ratings, sortBy]);

  const formatDate = (dateString) => {
    try {
      const dateWithoutTZ = dateString.replace(/ \+\d{4} UTC$/, "");
      const date = new Date(dateWithoutTZ);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return format(date, "MM/dd/yy");
    } catch (error) {
      console.error(
        "Error formatting date:",
        error,
        "for date string:",
        dateString
      );
      return "Invalid date";
    }
  };

  const getRatingColor = (score, type = "rating") => {
    if (type === "difficulty") {
      if (score <= 3) return "text-emerald-500";
      if (score <= 4) return "text-amber-500";
      return "text-rose-500";
    }
    if (score >= 4) return "text-emerald-500";
    if (score >= 3) return "text-amber-500";
    return "text-rose-500";
  };

  const getRatingBg = (score, type = "rating") => {
    if (type === "difficulty") {
      if (score <= 3) return "bg-emerald-50";
      if (score <= 4) return "bg-amber-50";
      return "bg-rose-50";
    }
    if (score >= 4) return "bg-emerald-50";
    if (score >= 3) return "bg-amber-50";
    return "bg-rose-50";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex justify-between items-center border-b p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{professorName}'s Ratings</h2>
          <div>
            {isLoading ? (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading reviews...</span>
              </div>
            ) : (
              <span className="text-sm text-slate-500">
                {ratings?.length ?? 0} reviews
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-auto p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className={`border-0 ${getRatingBg(stats.overall, "rating")}`}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${getRatingColor(stats.overall, "rating")}`}>
                {stats.overall}
              </div>
              <div className="text-xs text-slate-500 mt-1">Avg. Rating</div>
            </CardContent>
          </Card>
          
          <Card className={`border-0 ${getRatingBg(stats.difficulty, "difficulty")}`}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${getRatingColor(stats.difficulty, "difficulty")}`}>
                {stats.difficulty}
              </div>
              <div className="text-xs text-slate-500 mt-1">Avg. Difficulty</div>
            </CardContent>
          </Card>
          
          <Card className={`border-0 ${getRatingBg(stats.wouldTakeAgain / 20, "rating")}`}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${getRatingColor(stats.wouldTakeAgain / 20, "rating")}`}>
                {stats.wouldTakeAgain}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Would Take Again</div>
            </CardContent>
          </Card>
        </div>

        <Collapsible 
          open={filtersExpanded} 
          onOpenChange={setFiltersExpanded}
          className="mb-6 border rounded-xl overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm">Filters</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <Separator />
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-500">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Recent</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                    <SelectItem value="difficulty_rating">Highest Difficulty</SelectItem>
                    <SelectItem value="likes">Most Likes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-slate-500">Course</label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courseCodes?.map((course) => (
                      <SelectItem key={course.courseName} value={course.courseName}>
                        {course.courseName} ({course.courseCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton courseCodes={courseCodes} filterBy={filterBy} />
          ) : processedRatings.length > 0 ? (
            processedRatings.map((rating, index) => {
              const formattedDate = formatDate(rating.date);
              return (
                <div 
                  key={index}
                  className="border rounded-xl p-4 bg-white hover:shadow-sm transition-shadow duration-200"
                >
                  <RatingCard 
                    overallRating={rating.overall_rating ?? 0} 
                    difficultyRating={rating.difficulty_rating ?? 0}
                  />
                  
                  <p className="text-sm text-slate-700 my-3">
                    {he.decode(rating.comment ?? "")}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rating.is_online && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Online
                      </Badge>
                    )}
                    {rating.attendance_mandatory === "mandatory" && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Attendance Required
                      </Badge>
                    )}
                    {rating.would_take_again && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Would Take Again
                      </Badge>
                    )}
                  </div>
                  
                  {rating.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rating.tags.split("--").map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{formattedDate}</span>
                      {filterBy === "all" && (
                        <div className="flex items-center gap-1">
                          <School className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">{rating.class_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-slate-500">{rating.thumbs_up ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3 text-rose-500" />
                        <span className="text-xs text-slate-500">{rating.thumbs_down ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border rounded-xl p-8 text-center">
              <div className="mb-2 text-lg font-medium text-slate-700">No Reviews Found</div>
              <p className="text-slate-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingsPanel;