import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, School, FlaskConical, Palette, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MajorPlanner } from "./MajorPlanner";
import { local } from "@/components/GetGEData";

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
      if (!response.ok) throw new Error("Failed to fetch majors");
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
    )
      return "STEM";
    if (majorName.match(/Art|Music|Theater|Design|Creative|Film|Visual/i))
      return "Arts";
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

  const filteredMajors = majors?.filter((major) => {
    const matchesSearch = major.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter
      ? getMajorCategory(major.name) === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts =
    majors?.reduce((acc, major) => {
      const category = getMajorCategory(major.name);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

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

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
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
              className="cursor-pointer"
              onClick={() =>
                setCategoryFilter(category === categoryFilter ? null : category)
              }
            >
              {category} ({count})
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
          {isLoading ? (
            Array(12)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-1 bg-muted rounded" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-full rounded" />
                </div>
              ))
          ) : filteredMajors?.length === 0 ? (
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
                  className="group cursor-pointer transition-all duration-200 border border-muted hover:border-primary bg-card hover:bg-accent/30"
                  onClick={() => setSelectedMajor(major)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Badge className="flex items-center gap-1">
                        {getMajorIcon(category)}
                        <span>{category}</span>
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {degreeType}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-tight group-hover:text-primary">
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
