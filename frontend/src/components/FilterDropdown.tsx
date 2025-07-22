import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  X,
  BookOpen,
  Lock,
  BadgeCheck,
  MonitorPlay,
  Circle,
  Briefcase,
  Clock,
} from "lucide-react";
import type { FilterDropdownProps } from "../Constants";
import {
  careersOptions,
  classTypeOptions,
  enrollmentStatusOptions,
  prereqOptions,
} from "../Constants";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge as MUIBadge, Tooltip } from "@mui/material";
import { Badge } from "./ui/badge";

export default function FilterDropdown({
  codes,
  GEs,
  selectedGEs,
  selectedSubjects,
  selectedClassTypes,
  selectedEnrollmentStatuses,
  selectedCareers,
  selectedPrereqs,
  onSelectedSubjectsChange,
  onClassTypesChange,
  onEnrollmentStatusesChange,
  onSelectedGEs,
  onSelectedCareersChange,
  onSelectedPrereqsChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("enrollment");

  // Calculate total selected filters for badge count
  const totalFilters =
    selectedSubjects.length +
    selectedClassTypes.length +
    selectedEnrollmentStatuses.length +
    selectedGEs.length +
    selectedCareers.length +
    selectedPrereqs.length;

  const categoryFilters = {
    enrollment: selectedEnrollmentStatuses.length,
    types: selectedClassTypes.length,
    subjects: selectedSubjects.length,
    careers: selectedCareers.length,
    prereqs: selectedPrereqs.length,
    ge: selectedGEs.length,
  };

  const categoryIcons = {
    subjects: <BookOpen className="w-4 h-4" />, // Clear metaphor for academic subject
    careers: <Briefcase className="w-4 h-4" />, // Represents career/level cleanly (vs. Building2)
    prereqs: <Lock className="w-4 h-4" />, // Lock icon makes sense for “gated by prerequisites”
    ge: <BadgeCheck className="w-4 h-4" />, // Emphasizes “requirement fulfilled” visually
    types: <MonitorPlay className="w-4 h-4" />, // Implies format: online/async/etc.
    enrollment: <Clock className="w-4 h-4" />, // Circle = open; swap icon state by status if needed
  };

  // Define filter categories for both mobile and desktop
  const filterCategories = {
    enrollment: "Enrollment Status",
    ...(GEs.length > 1 ? { ge: "GE Requirements" } : {}),
    types: "Class Format",

    prereqs: "Prerequisite Req",
    careers: "Student Level",

    subjects: "Subject Area",
  };

  function renderFilterSection(
    title: string,
    options: string[],
    selected: string[],
    onChange: (vals: string[]) => void
  ) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900">{title}</h3>
            <Badge
              variant="outline"
              className="text-xs font-normal bg-slate-50 border-slate-200 text-slate-600"
            >
              {selected.length} of {options.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => onChange(options)}
            >
              Select All
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
        <ScrollArea className="h-52 rounded-lg border border-slate-200 bg-white">
          <div className="p-1">
            {options.map((opt) => (
              <label
                key={opt}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer text-sm transition-colors",
                  selected.includes(opt)
                    ? "bg-blue-50 text-blue-900"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <Checkbox
                  checked={selected.includes(opt)}
                  onCheckedChange={(checked) => {
                    if (checked) onChange([...selected, opt]);
                    else onChange(selected.filter((v) => v !== opt));
                  }}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip title="Filter Classes">
        <PopoverTrigger asChild>
          <MUIBadge
            badgeContent={totalFilters > 0 ? totalFilters : 0}
            color="primary"
            overlap="circular"
            invisible={totalFilters < 1}
          >
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "relative h-9 w-9 border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md transition-shadow"
              )}
            >
              <Filter className="h-4 w-4 text-slate-600" />
            </Button>
          </MUIBadge>
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-[340px] sm:w-[600px] p-0 border-slate-200 shadow-xl rounded-xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col sm:flex-row h-[550px] max-h-[80vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Sidebar navigation for desktop */}
            <div className="hidden sm:flex flex-col w-[240px] bg-slate-50 border-r border-slate-200 p-2 pt-3">
            <div className="px-3 mb-3">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Refine course results
                </p>
              </div>

              <div className="space-y-1">
                {Object.entries(filterCategories).map(([key, label]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start px-3 h-9 font-normal",
                      activeTab === key
                        ? "bg-white text-blue-600 shadow-sm font-medium hover:bg-white hover:text-blue-600"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                    onClick={() => setActiveTab(key)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex items-center gap-2">
                        {categoryIcons[key]}
                        <span>{label}</span>
                      </div>

                      {categoryFilters[key] > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs font-normal bg-blue-100 text-blue-700 hover:bg-blue-100"
                        >
                          {categoryFilters[key]}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {totalFilters > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto mx-2 mb-2 text-xs border-slate-200 hover:bg-slate-100"
                  onClick={() => {
                    onSelectedSubjectsChange([]);
                    onClassTypesChange([]);
                    onEnrollmentStatusesChange([]);
                    onSelectedGEs([]);
                    onSelectedCareersChange([]);
                    onSelectedPrereqsChange([]);
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear All Filters
                </Button>
              )}
            </div>

            {/* Tabs for mobile view */}
            <div className="sm:hidden flex flex-col bg-white border-b border-slate-200">
              <div className="p-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-t border-slate-100">
                <ScrollArea className="w-full pb-2">
                  <div className="flex px-4 py-2 gap-2">
                    {Object.entries({
                      enrollment: "Enrollment",
                      types: "Type",
                      subjects: "Subjects",
                      careers: "Career",
                      prereqs: "Prereqs",
                      ...(GEs.length > 1 ? { ge: "GE" } : {}),
                    }).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={activeTab === key ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 px-3 rounded-full whitespace-nowrap flex-shrink-0",
                          activeTab === key
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-700"
                        )}
                        onClick={() => setActiveTab(key)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{label}</span>
                          {categoryFilters[key] > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-0.5 text-[10px] h-4 w-4 p-0 flex items-center justify-center rounded-full bg-white text-blue-700"
                            >
                              {categoryFilters[key]}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 overflow-hidden bg-white">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {activeTab === "enrollment" &&
                  renderFilterSection(
                    "Class Status",
                    enrollmentStatusOptions,
                    selectedEnrollmentStatuses,
                    onEnrollmentStatusesChange
                  )}

                {activeTab === "types" &&
                  renderFilterSection(
                    "Class Type",
                    classTypeOptions,
                    selectedClassTypes,
                    onClassTypesChange
                  )}

                {activeTab === "subjects" &&
                  renderFilterSection(
                    "Subjects",
                    codes,
                    selectedSubjects,
                    onSelectedSubjectsChange
                  )}

                {activeTab === "careers" &&
                  renderFilterSection(
                    "Career Type",
                    careersOptions,
                    selectedCareers,
                    onSelectedCareersChange
                  )}

                {activeTab === "prereqs" &&
                  renderFilterSection(
                    "Prerequisites",
                    prereqOptions,
                    selectedPrereqs,
                    onSelectedPrereqsChange
                  )}

                {activeTab === "ge" &&
                  GEs.length > 1 &&
                  renderFilterSection(
                    "GE Requirements",
                    GEs,
                    selectedGEs,
                    onSelectedGEs
                  )}
              </motion.div>

              {/* Mobile action buttons */}
              <div className="mt-4 sm:hidden flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    // Clear all filters when Cancel is clicked
                    onSelectedSubjectsChange([]);
                    onClassTypesChange([]);
                    onEnrollmentStatusesChange([]);
                    onSelectedGEs([]);
                    onSelectedCareersChange([]);
                    onSelectedPrereqsChange([]);
                    setOpen(false);
                  }}
                >
                  Clear All
                </Button>

                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
