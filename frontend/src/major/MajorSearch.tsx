import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  School,
  FlaskConical,
  Palette,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MajorPlanner } from "./MajorPlanner";
import { local } from "../pages/GetGEData";

// Type definition for Major
interface Major {
  name: string;
}

const MajorSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: majors, isLoading } = useQuery<Major[]>({
    queryKey: ["majors"],
    queryFn: async () => {
      const response = await fetch(`${local}/all_majors`);
      if (!response.ok) {
        throw new Error("Failed to fetch majors");
      }
      return response.json();
    },
  });

  const getDegreeType = (majorName: string) => {
    if (majorName.includes("B.S.")) return "B.S.";
    if (majorName.includes("B.A.")) return "B.A.";
    if (majorName.includes("B.M.")) return "B.M.";
    return "Degree";
  };

  const getMajorCategory = (majorName: string) => {
    if (
      majorName.match(
        /Biology|Chemistry|Physics|Science|Engineering|Mathematics|Computer|Technology/i
      )
    ) {
      return "STEM";
    }
    if (majorName.match(/Art|Music|Theater|Design|Creative|Film|Visual/i)) {
      return "Arts";
    }
    return "Humanities";
  };

  const getMajorIcon = (category: string) => {
    switch (category) {
      case "STEM":
        return <FlaskConical className="h-4 w-4" />;
      case "Arts":
        return <Palette className="h-4 w-4" />;
      default:
        return <School className="h-4 w-4" />;
    }
  };

  // Filter majors based on search term and category
  const filteredMajors = majors?.filter((major) => {
    const matchesSearch = major.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter
      ? getMajorCategory(major.name) === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  // Get counts for each category
  const categoryCounts =
    majors?.reduce((acc, major) => {
      const category = getMajorCategory(major.name);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  // Category styling
  const getCategoryClasses = (category: string) => {
    switch (category) {
      case "STEM":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "Arts":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
        </div>
      </div>
    );
  }

  if (selectedMajor) {
    return (
      <MajorPlanner
        selectedMajor={selectedMajor.name}
        onBack={() => setSelectedMajor(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] overflow-hidden max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="sticky top-0 z-10 bg-background px-6 py-4 border-b border-border">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">UCSC Majors and Programs</h1>
          <p className="text-muted-foreground">
            Find your perfect major and plan your academic journey
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search majors by name or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap pb-2">
          <Badge
            variant={categoryFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategoryFilter(null)}
          >
            All ({majors?.length || 0})
          </Badge>
          {Object.entries(categoryCounts).map(([category, count]) => (
            <Badge
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              className={`cursor-pointer ${
                categoryFilter === category ? "" : "hover:bg-secondary"
              }`}
              onClick={() =>
                setCategoryFilter(category === categoryFilter ? null : category)
              }
            >
              {category} ({count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredMajors?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No majors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredMajors?.map((major) => {
              const category = getMajorCategory(major.name);
              const degreeType = getDegreeType(major.name);
              const majorName = major.name.replace(` ${degreeType}`, "");

              return (
                <Card
                  key={major.name}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 group cursor-pointer"
                  onClick={() => setSelectedMajor(major)}
                >
                  <div
                    className={`h-1 ${
                      category === "STEM"
                        ? "bg-emerald-500"
                        : category === "Arts"
                        ? "bg-purple-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getCategoryClasses(category)}>
                        <span className="flex items-center">
                          {getMajorIcon(category)}
                          <span className="ml-1">{category}</span>
                        </span>
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {degreeType}
                      </Badge>
                    </div>

                    <h3 className="text-base font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {majorName}
                    </h3>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MajorSearch;
