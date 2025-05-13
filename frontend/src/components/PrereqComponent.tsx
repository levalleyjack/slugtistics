import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrerequisitesSectionProps = {
  enrollmentReqs: string;
  coursesReq: string[][];
};

const getRelationType = (
  prevGroup: string[],
  currGroup: string[],
  fullText: string
): "and" | "or" => {
  const pattern = new RegExp(
    `(${prevGroup.join("|")})\\s*(or|OR)\\s*(${currGroup.join("|")})`,
    "i"
  );
  return pattern.test(fullText) ? "or" : "and";
};

const PrereqChip: React.FC<{ course: string; type?: string }> = ({
  course,
  type = "regular",
}) => {
  const styles = {
    regular: "bg-primary/10 text-primary px-2 py-0.5 text-xs",
    or: "bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 text-xs",
    concurrent:
      "bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 text-xs",
  };

  const chipType = course.toLowerCase().includes("concurrent")
    ? "concurrent"
    : type;

  return (
    <Badge variant="outline" className={cn("rounded-md", styles[chipType])}>
      {course}
    </Badge>
  );
};

const RelationDivider: React.FC<{ label: string }> = ({ label }) => (
  <div className="relative w-full flex items-center justify-center my-2">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-muted" />
    </div>
    <span className="z-10 px-1.5 text-[11px] font-medium bg-background text-muted-foreground border border-muted rounded-full">
      {label.toUpperCase()}
    </span>
  </div>
);

const RequirementGroup: React.FC<{
  group: string[];
  index: number;
  allCourses: string[][];
  enrollmentReqs: string;
}> = ({ group, index, allCourses, enrollmentReqs }) => {
  const isConcurrent = group.some((c) =>
    c.toLowerCase().includes("concurrent")
  );

  const relationType =
    index === 0
      ? null
      : isConcurrent
      ? "with"
      : getRelationType(allCourses[index - 1], group, enrollmentReqs);

  return (
    <div>
      {index > 0 && relationType && (
        <RelationDivider label={relationType} />
      )}
      <div className="flex flex-wrap gap-1.5">
        {group.map((course, i) => (
          <PrereqChip
            key={i}
            course={course}
            type={relationType === "or" && i === 0 ? "or" : undefined}
          />
        ))}
      </div>
    </div>
  );
};

const PrerequisitesSection: React.FC<PrerequisitesSectionProps> = ({
  enrollmentReqs,
  coursesReq,
}) => {
  const [showStructured, setShowStructured] = useState(false);
  const hasStructuredReqs = Array.isArray(coursesReq) && coursesReq.length > 0;

  return (
    <div className="border-l-2 border-primary pl-3 pt-2 pb-3 space-y-4 text-sm">
      <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap font-medium">
        {enrollmentReqs}
      </p>

      {hasStructuredReqs && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs text-muted-foreground hover:text-primary"
            onClick={() => setShowStructured((prev) => !prev)}
          >
            {showStructured ? "Hide Course List" : "Show Course List"}
          </Button>

          {showStructured && (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground border-b pb-1">
                Course Requirements (BETA)
              </p>
              {coursesReq.map((group, index) => (
                <RequirementGroup
                  key={index}
                  group={group}
                  index={index}
                  allCourses={coursesReq}
                  enrollmentReqs={enrollmentReqs}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrerequisitesSection;
